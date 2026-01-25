'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import { Client, Project, Deletion, User, DashboardData } from './types';
import { db } from './db'; // Dein PostgreSQL Pool

// ================ AUTH HELPERS ================

async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

// ================ ORGANIZATION & TEAM ACTIONS ================

export async function getOrganizations() {
    return await auth.api.listOrganizations({ headers: await headers() });
}

export async function createOrganization(name: string, slug: string) {  
    const data = await auth.api.createOrganization({
        body: { name, slug },
        headers: await headers(),
    });
    await insertAction('createOrganization', `Created organization ${name}`);
    revalidatePath('/');
    return data;
}

export async function setActiveOrganization(organizationId: string) {
    const data = await auth.api.setActiveOrganization({
        body: { organizationId },
        headers: await headers(),
    });
    revalidatePath('/');
    return data;
}

// ================ CLIENT ACTIONS ================

export async function getClients() {
    const res = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    return res.rows as Client[];
}

export async function getUserClients(id: string) {
    const res = await db.query('SELECT * FROM clients WHERE "responsiblePersonId" = $1', [id]);
    return res.rows as Client[];
}

export async function getClient(id: string) {
    const res = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    return res.rows[0] as Client | undefined;
}

export async function createClient(
    name: string,
    email: string,
    responsiblePersonId?: string,
    responsibleOrganizationId?: string,
    type: Client["type"] = "person"
) {
    const existing = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existing.rowCount! > 0) {
        return { status: 15023, client: null };
    }

    const id = crypto.randomUUID();
    const query = `
        INSERT INTO clients (id, name, email, "responsiblePersonId", "responsibleOrganizationId", type, status, "createdAt", "updatedAt") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
    `;
    const values = [id, name, email, responsiblePersonId || null, responsibleOrganizationId || null, type, 'LEAD'];
    
    const res = await db.query(query, values);
    await insertAction('createClient', `Created client ${name}`);
    revalidatePath('/');
    return { status: 200, client: res.rows[0] as Client };
}

export async function updateClient(id: string, data: Partial<Client>) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const setClause = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ');
    const values = fields.map(f => (data as any)[f]);

    await db.query(`UPDATE clients SET ${setClause}, "updatedAt" = NOW() WHERE id = $1`, [id, ...values]);
    revalidatePath('/');
    return { status: 200 };
}

export async function deleteClient(id: string) {
    await db.query('BEGIN');
    try {
        await db.query('DELETE FROM projects WHERE "clientId" = $1', [id]);
        await db.query('DELETE FROM clients WHERE id = $1', [id]);
        await db.query('COMMIT');
        await insertAction('deleteClient', `Deleted client ${id}`);
        revalidatePath('/');
        return { status: 200 };
    } catch (e) {
        await db.query('ROLLBACK');
        return { status: 500 };
    }
}

// ================ DASHBOARD DATA ================

export async function getUserDashboardData(userId: string): Promise<DashboardData> {
    const clientsRes = await db.query('SELECT id FROM clients WHERE "responsiblePersonId" = $1', [userId]);
    const clientIds = clientsRes.rows.map(c => c.id);
    
    let runningProjects = 0;
    if (clientIds.length > 0) {
        const res = await db.query('SELECT COUNT(*) FROM projects WHERE finished = false AND "clientId" = ANY($1)', [clientIds]);
        runningProjects = parseInt(res.rows[0].count);
    }

    const orgsRes = await db.query('SELECT COUNT(DISTINCT "responsibleOrganizationId") FROM clients WHERE "responsiblePersonId" = $1', [userId]);
    const latestActions = await db.query('SELECT * FROM actions ORDER BY timestamp DESC LIMIT 5');

    return {
        clientNumber: clientsRes.rowCount!,
        runningProjects,
        organisations: parseInt(orgsRes.rows[0].count) || 0,
        organisationProjects: 0, // Hier müsste man je nach Org-Logik tiefer joinen
        teamNumbers: 0,
        latestActions: latestActions.rows
    };
}

// ================ SYSTEM ACTIONS ================

export async function insertAction(actionType: string, description: string) {
    const session = await getSession();
    const userId = session?.user.id || 'unknown';
    await db.query(
        'INSERT INTO actions ("userId", "actionType", description, timestamp) VALUES ($1, $2, $3, NOW())',
        [userId, actionType, description]
    );
}
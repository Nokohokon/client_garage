'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import { Client, Project, Deletion, User, DashboardData, Task, TaskWithClient, RevenueOverview, Action } from './types';
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
    const res = await db.query('SELECT * FROM clients ORDER BY "createdAt" DESC');
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
        INSERT INTO clients (id, name, email, "responsiblePersonId", "responsibleOrganizationId", type, status, "createdAt", "updatedAt", "lastContactAt") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
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
    // Alle Klienten des Users
    const allClientsRes = await db.query(
        'SELECT * FROM clients WHERE "responsiblePersonId" = $1 ORDER BY "createdAt" DESC',
        [userId]
    );
    const allClients = allClientsRes.rows as Client[];

    // Klienten nach Status filtern
    const activeClients = allClients.filter(c => c.status === 'ACTIVE');
    const waitingClients = allClients.filter(c => c.status === 'LEAD');
    const inactiveClients = allClients.filter(c => c.status === 'INACTIVE');
    const recentClients = allClients.slice(0, 5);

    // Client IDs für weitere Queries
    const clientIds = allClients.map(c => c.id);

    // Laufende Projekte
    let runningProjects: Project[] = [];
    if (clientIds.length > 0) {
        const projectsRes = await db.query(
            'SELECT * FROM projects WHERE finished = false AND ("clientId" = ANY($1) OR "userId" = $2) ORDER BY "createdAt" DESC',
            [clientIds, userId]
        );
        runningProjects = projectsRes.rows as Project[];
    } else {
        const projectsRes = await db.query(
            'SELECT * FROM projects WHERE finished = false AND "userId" = $1 ORDER BY "createdAt" DESC',
            [userId]
        );
        runningProjects = projectsRes.rows as Project[];
    }

    // Offene Aufgaben (OPEN, IN_PROGRESS, WAITING) mit Client-Daten
    const openTasksRes = await db.query(
        `SELECT 
            t.*,
            c.name as "clientName",
            c.status as "clientStatus"
         FROM tasks t
         LEFT JOIN clients c ON t."clientId" = c.id
         WHERE t."assignedUserId" = $1 
         AND t.status IN ('OPEN', 'IN_PROGRESS', 'WAITING') 
         ORDER BY t."dueDate" ASC NULLS LAST, t."createdAt" DESC`,
        [userId]
    );
    const openTasks = openTasksRes.rows as TaskWithClient[];

    // Aktuelle Aufgaben (IN_PROGRESS)
    const currentTasks = openTasks.filter(t => t.status === 'IN_PROGRESS');

    // Umsatz diesen Monat
    const monthlyRevenueRes = await db.query(
        `SELECT COALESCE(SUM(revenue::numeric), 0) as total 
         FROM tasks 
         WHERE "assignedUserId" = $1 
         AND status = 'COMPLETED'
         AND "createdAt" >= date_trunc('month', CURRENT_DATE)`,
        [userId]
    );
    const monthlyRevenue = parseFloat(monthlyRevenueRes.rows[0].total) || 0;

    // Umsatzübersicht (letzte 6 Monate)
    const revenueOverviewRes = await db.query(
        `SELECT 
            to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month,
            COALESCE(SUM(revenue::numeric), 0) as revenue
         FROM tasks 
         WHERE "assignedUserId" = $1 
         AND status = 'COMPLETED'
         AND "createdAt" >= date_trunc('month', CURRENT_DATE) - interval '5 months'
         GROUP BY date_trunc('month', "createdAt")
         ORDER BY month ASC`,
        [userId]
    );
    const revenueOverview: RevenueOverview[] = revenueOverviewRes.rows.map(r => ({
        month: r.month,
        revenue: parseFloat(r.revenue) || 0
    }));

    // Letzte Aktivitäten
    const latestActionsRes = await db.query(
        'SELECT * FROM actions WHERE "userId" = $1 ORDER BY timestamp DESC LIMIT 10',
        [userId]
    );
    const latestActions = latestActionsRes.rows as Action[];

    return {
        allClients,
        activeClients,
        waitingClients,
        inactiveClients,
        recentClients,
        runningProjects,
        openTasks,
        currentTasks,
        monthlyRevenue,
        revenueOverview,
        latestActions,
        counts: {
            totalClients: allClients.length,
            activeClients: activeClients.length,
            waitingClients: waitingClients.length,
            inactiveClients: inactiveClients.length,
            runningProjects: runningProjects.length,
            openTasks: openTasks.length,
        }
    };
}

// ================ TASK ACTIONS ================

export async function getTasks(userId: string) {
    const res = await db.query(
        'SELECT * FROM tasks WHERE "assignedUserId" = $1 ORDER BY "createdAt" DESC',
        [userId]
    );
    return res.rows as Task[];
}

export async function getTask(id: string) {
    const res = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return res.rows[0] as Task | undefined;
}

export async function createTask(
    title: string,
    clientId?: string,
    projectId?: string,
    assignedUserId?: string,
    organizationId?: string,
    description?: string,
    revenue?: string,
    dueDate?: Date
) {
    const id = crypto.randomUUID();
    const query = `
        INSERT INTO tasks (id, title, description, status, revenue, "clientId", "projectId", "assignedUserId", "organizationId", "dueDate", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'OPEN', $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
    `;
    const values = [
        id,
        title,
        description || null,
        revenue || '0.00',
        clientId || null,
        projectId || null,
        assignedUserId || null,
        organizationId || null,
        dueDate || null
    ];

    const res = await db.query(query, values);
    await insertAction('createTask', `Created task: ${title}`);
    revalidatePath('/');
    return { status: 200, task: res.rows[0] as Task };
}

export async function updateTask(id: string, data: Partial<Task>) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    if (fields.length === 0) return { status: 400 };

    const setClause = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ');
    const values = fields.map(f => (data as any)[f]);

    await db.query(
        `UPDATE tasks SET ${setClause}, "updatedAt" = NOW() WHERE id = $1`,
        [id, ...values]
    );
    await insertAction('updateTask', `Updated task ${id}`);
    revalidatePath('/');
    return { status: 200 };
}

export async function deleteTask(id: string) {
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    await insertAction('deleteTask', `Deleted task ${id}`);
    revalidatePath('/');
    return { status: 200 };
}

export async function updateClientLastContact(clientId: string) {
    await db.query(
        'UPDATE clients SET "lastContactAt" = NOW(), "updatedAt" = NOW() WHERE id = $1',
        [clientId]
    );
    revalidatePath('/');
    return { status: 200 };
}

// ================ SYSTEM ACTIONS ================

export async function insertAction(actionType: string, description: string) {
    const session = await getSession();
    const userId = session?.user.id || 'unknown';
    await db.query(
        'INSERT INTO actions (id, "userId", "actionType", description, timestamp) VALUES ($1, $2, $3, $4, NOW())',
        [crypto.randomUUID(), userId, actionType, description]
    );
}
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import { Client, Project, Deletion, User, DashboardData, Task, TaskWithClient, RevenueOverview, Action } from './types';
import db from './db';

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

export async function createOrganization(name: string, slug: string, logo?: string, metadata?: Record<string, any>, userId?: string, keepCurrentActiveOrganization: boolean = false) {  
    const data = await auth.api.createOrganization({
        body: { name, slug, logo: logo || undefined, metadata: metadata || {}, userId: userId || undefined, keepCurrentActiveOrganization },
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


// statistics

export async function createMetricSnapshot(
  userId: string, 
  granularity: 'hour' | 'day'
) {
  const now = new Date();
  const timestamp = granularity === 'hour' 
    ? new Date(now.setMinutes(0, 0, 0)) 
    : new Date(now.setHours(0, 0, 0, 0));

  // Hole aktuellen Stand
  const clientCounts = await db.query(`
    SELECT 
      COUNT(*)::int as total,
      COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::int as active,
      COUNT(CASE WHEN status = 'LEAD' THEN 1 END)::int as lead,
      COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END)::int as inactive
    FROM clients
    WHERE "responsiblePersonId" = $1
  `, [userId]);

  const counts = clientCounts.rows[0];

  // Hole Änderungen seit letztem Snapshot
  const lastSnapshot = await db.query(`
    SELECT * FROM client_metrics
    WHERE user_id = $1 AND granularity = $2
    ORDER BY timestamp DESC
    LIMIT 1
  `, [userId, granularity]);

  const last = lastSnapshot.rows[0];
  const clientsAdded = last ? Math.max(0, counts.total - last.total_clients) : 0;
  const clientsLost = last ? Math.max(0, last.total_clients - counts.total) : 0;
  const clientsActivated = last ? Math.max(0, counts.active - last.active_clients) : 0;

  // Revenue seit letztem Snapshot
  const revenueQuery = last 
    ? `WHERE "assignedUserId" = $1 AND status = 'COMPLETED' AND "updatedAt" > $2`
    : `WHERE "assignedUserId" = $1 AND status = 'COMPLETED'`;
  
  const revenueParams = last ? [userId, last.timestamp] : [userId];
  
  const revenue = await db.query(`
    SELECT 
      COALESCE(SUM(revenue::numeric), 0) as total,
      COUNT(*)::int as count
    FROM tasks
    ${revenueQuery}
  `, revenueParams);

  // Insert Snapshot
  await db.query(`
    INSERT INTO client_metrics (
      user_id, timestamp, granularity,
      total_clients, active_clients, lead_clients, inactive_clients,
      clients_added, clients_lost, clients_activated,
      total_revenue, completed_tasks
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (user_id, timestamp, granularity) DO UPDATE SET
      total_clients = EXCLUDED.total_clients,
      active_clients = EXCLUDED.active_clients,
      lead_clients = EXCLUDED.lead_clients,
      inactive_clients = EXCLUDED.inactive_clients,
      clients_added = EXCLUDED.clients_added,
      clients_lost = EXCLUDED.clients_lost,
      clients_activated = EXCLUDED.clients_activated,
      total_revenue = EXCLUDED.total_revenue,
      completed_tasks = EXCLUDED.completed_tasks
  `, [
    userId, timestamp, granularity,
    counts.total, counts.active, counts.lead, counts.inactive,
    clientsAdded, clientsLost, clientsActivated,
    revenue.rows[0].total, revenue.rows[0].count
  ]);
}

// Metriken abrufen mit Zeitbereich
export async function getMetrics(
  userId: string,
  granularity: 'hour' | 'day',
  hours?: number
) {
  const hoursBack = hours || (granularity === 'hour' ? 24 : 24 * 30);
  
  const metrics = await db.query(`
    SELECT 
      timestamp,
      total_clients,
      active_clients,
      lead_clients,
      inactive_clients,
      clients_added,
      clients_lost,
      clients_activated,
      total_revenue,
      completed_tasks
    FROM client_metrics
    WHERE user_id = $1 
    AND granularity = $2
    AND timestamp >= NOW() - interval '${hoursBack} hours'
    ORDER BY timestamp ASC
  `, [userId, granularity]);

  return metrics.rows.map((m, idx, arr) => {
    if (idx === 0) return { ...m, clientGrowthRate: 0, revenueGrowthRate: 0 };
    
    const prev = arr[idx - 1];
    const clientGrowthRate = prev.total_clients > 0
      ? ((m.total_clients - prev.total_clients) / prev.total_clients * 100)
      : 0;
    const revenueGrowthRate = parseFloat(prev.total_revenue) > 0
      ? ((parseFloat(m.total_revenue) - parseFloat(prev.total_revenue)) / parseFloat(prev.total_revenue) * 100)
      : 0;

    return {
      ...m,
      timestamp: m.timestamp.toISOString(),
      clientGrowthRate: clientGrowthRate.toFixed(2),
      revenueGrowthRate: revenueGrowthRate.toFixed(2)
    };
  });
}

// Echtzeit-Statistiken (ohne Snapshot)
export async function getLiveMetrics(userId: string) {
  const [clients, tasks, recentActivity] = await Promise.all([
    db.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::int as active,
        COUNT(CASE WHEN "createdAt" >= NOW() - interval '24 hours' THEN 1 END)::int as new_24h
      FROM clients
      WHERE "responsiblePersonId" = $1
    `, [userId]),
    
    db.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::int as completed,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN revenue::numeric ELSE 0 END), 0) as revenue_24h
      FROM tasks
      WHERE "assignedUserId" = $1
      AND "updatedAt" >= NOW() - interval '24 hours'
    `, [userId]),
    
    db.query(`
      SELECT COUNT(*)::int as count
      FROM actions
      WHERE "userId" = $1
      AND timestamp >= NOW() - interval '1 hour'
    `, [userId])
  ]);

  return {
    clients: clients.rows[0],
    tasks: tasks.rows[0],
    activityLastHour: recentActivity.rows[0].count
  };
}
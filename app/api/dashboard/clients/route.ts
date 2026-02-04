import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { Client, ClientStatus, ClientType } from "@/lib/types";
import { createClient } from "@/lib/actions";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  // =====================
  // Query Params
  // =====================
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") as ClientStatus | "ALL" | null;
  const type = searchParams.get("type") as ClientType | "ALL" | null;

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const offset = (page - 1) * pageSize;

  // =====================
  // WHERE CLAUSE
  // =====================
  const where: string[] = [`"responsiblePersonId" = $1`];
  const values: any[] = [session.user.id];
  let idx = 2;

  if (status && status !== "ALL") {
    where.push(`status = $${idx++}`);
    values.push(status);
  }

  if (type && type !== "ALL") {
    where.push(`type = $${idx++}`);
    values.push(type);
  }

  if (search) {
    where.push(`LOWER(name) LIKE $${idx++}`);
    values.push(`%${search.toLowerCase()}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // =====================
  // Data Query
  // =====================
  const clientsRes = await db.query(
    `
    SELECT *
    FROM clients
    ${whereClause}
    ORDER BY "createdAt" DESC
    LIMIT $${idx++}
    OFFSET $${idx}
    `,
    [...values, pageSize, offset]
  );

  // =====================
  // Count Query
  // =====================
  const countRes = await db.query(
    `
    SELECT COUNT(*)::int as total
    FROM clients
    ${whereClause}
    `,
    values
  );

  // =====================
  // Status Counts (Tabs)
  // =====================
  const statusCountsRes = await db.query(
    `
    SELECT status, COUNT(*)::int
    FROM clients
    WHERE "responsiblePersonId" = $1
    GROUP BY status
    `,
    [session.user.id]
  );

  const counts = {
    total: countRes.rows[0].total,
    active: 0,
    lead: 0,
    inactive: 0,
    archived: 0,
  };

  for (const row of statusCountsRes.rows) {
    if (row.status === "ACTIVE") counts.active = row.count;
    if (row.status === "LEAD") counts.lead = row.count;
    if (row.status === "INACTIVE") counts.inactive = row.count;
    if (row.status === "ARCHIVED") counts.archived = row.count;
  }

  return NextResponse.json({
    clients: clientsRes.rows as Client[],
    counts,
    page,
    pageSize,
    total: counts.total,
  });
}


export async function POST(req: NextRequest) {
  console.log('Schritt 1')
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  console.log('Schritt 2')

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  console.log('Daten:', data)

  try {
    const newClient = await createClient(data.name, data.email, session.user.id, undefined,  'person' );
    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create client" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  
  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }
  
  try {
    await db.query(
      `
      DELETE FROM clients
      WHERE id = $1 AND "responsiblePersonId" = $2
      `,
      [clientId, session.user.id]
    );
    
    return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete client" },
      { status: 500 }
    );
  }
}
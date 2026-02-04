import { NextResponse } from "next/server";
import db from "@/lib/db";
import { createMetricSnapshot } from "@/lib/actions";

// app/api/cron/daily/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await db.query('SELECT id FROM "user"');
  
  for (const user of users.rows) {
    await createMetricSnapshot(user.id, 'day');
  }

  return NextResponse.json({ success: true, processed: users.rows.length });
}
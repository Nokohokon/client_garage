// app/api/cron/hourly/route.ts
import { NextResponse } from "next/server";
import { createMetricSnapshot } from "@/lib/actions";
import db from "@/lib/db";

export async function GET(request: Request) {
  // Vercel Cron Secret checken
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await db.query('SELECT id FROM "user"');
  
  for (const user of users.rows) {
    await createMetricSnapshot(user.id, 'hour');
  }

  return NextResponse.json({ 
    success: true, 
    processed: users.rows.length,
    timestamp: new Date().toISOString()
  });
}
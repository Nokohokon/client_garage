// app/api/dashboard/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMetrics, getLiveMetrics } from "@/lib/actions";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const granularity = searchParams.get('granularity') as 'hour' | 'day' || 'day';
  const hours = Number(searchParams.get('hours')) || undefined;
  const live = searchParams.get('live') === 'true';

  if (live) {
    const liveMetrics = await getLiveMetrics(session.user.id);
    return NextResponse.json(liveMetrics);
  }

  const metrics = await getMetrics(session.user.id, granularity, hours);
  return NextResponse.json(metrics);
}
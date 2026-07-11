import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/travel — lista planos de viagem
export async function GET() {
  const plans = await db.travelPlan.findMany({
    orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
  });
  const parsed = plans.map((p) => ({
    ...p,
    garmentIds: JSON.parse(p.garmentIds) as string[],
  }));
  return NextResponse.json({ travels: parsed });
}

// POST /api/travel — cria plano de viagem
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.destination || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: 'destination, startDate e endDate são obrigatórios' }, { status: 400 });
  }
  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const plan = await db.travelPlan.create({
    data: {
      destination: body.destination,
      startDate: start,
      endDate: end,
      weather: body.weather ?? null,
      transport: body.transport ?? null,
      context: body.context ?? null,
      duration,
      garmentIds: JSON.stringify(body.garmentIds ?? []),
      reason: body.reason ?? null,
      notes: body.notes ?? null,
      status: 'planejada',
    },
  });
  return NextResponse.json({
    travel: { ...plan, garmentIds: JSON.parse(plan.garmentIds) },
  }, { status: 201 });
}

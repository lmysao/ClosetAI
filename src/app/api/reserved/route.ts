import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reserved — lista conjuntos reservados
export async function GET() {
  const sets = await db.reservedSet.findMany({
    orderBy: [{ status: 'asc' }, { eventDate: 'asc' }],
  });
  // parse garmentIds
  const parsed = sets.map((s) => ({
    ...s,
    garmentIds: JSON.parse(s.garmentIds) as string[],
  }));
  return NextResponse.json({ reserved: parsed });
}

// POST /api/reserved — cria conjunto reservado
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.garmentIds || !Array.isArray(body.garmentIds)) {
    return NextResponse.json({ error: 'name e garmentIds são obrigatórios' }, { status: 400 });
  }
  const set = await db.reservedSet.create({
    data: {
      name: body.name,
      eventType: body.eventType ?? 'casual',
      eventDate: new Date(body.eventDate),
      eventTime: body.eventTime ?? null,
      conditions: body.conditions ?? null,
      garmentIds: JSON.stringify(body.garmentIds),
      reason: body.reason ?? null,
      status: 'reservado',
    },
  });
  return NextResponse.json({
    reserved: { ...set, garmentIds: JSON.parse(set.garmentIds) },
  }, { status: 201 });
}

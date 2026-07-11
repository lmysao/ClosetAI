import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/travel/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.destination) data.destination = body.destination;
  if (body.startDate) data.startDate = new Date(body.startDate);
  if (body.endDate) data.endDate = new Date(body.endDate);
  if (body.weather !== undefined) data.weather = body.weather ?? null;
  if (body.transport !== undefined) data.transport = body.transport ?? null;
  if (body.context !== undefined) data.context = body.context ?? null;
  if (body.notes !== undefined) data.notes = body.notes ?? null;
  if (body.reason !== undefined) data.reason = body.reason ?? null;
  if (Array.isArray(body.garmentIds)) data.garmentIds = JSON.stringify(body.garmentIds);

  const plan = await db.travelPlan.update({ where: { id }, data });
  return NextResponse.json({
    travel: { ...plan, garmentIds: JSON.parse(plan.garmentIds) },
  });
}

// DELETE /api/travel/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.travelPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

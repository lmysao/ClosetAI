import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/reserved/[id] — atualiza status (usar conjunto reservado, cancelar)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status;
    if (body.name) data.name = body.name;
    if (body.eventType) data.eventType = body.eventType;
    if (body.eventDate) data.eventDate = new Date(body.eventDate);
    if (body.eventTime !== undefined) data.eventTime = body.eventTime ?? null;
    if (body.conditions !== undefined) data.conditions = body.conditions ?? null;
    if (body.reason !== undefined) data.reason = body.reason ?? null;
    if (Array.isArray(body.garmentIds)) data.garmentIds = JSON.stringify(body.garmentIds);

    const set = await db.reservedSet.update({ where: { id }, data });
    return NextResponse.json({
      reserved: { ...set, garmentIds: JSON.parse(set.garmentIds) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[reserved PATCH] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/reserved/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.reservedSet.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[reserved DELETE] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

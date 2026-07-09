import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/laundry — retorna peças agrupadas por status (suja, reusavel, lavando)
export async function GET() {
  const suja = await db.garment.findMany({
    where: { status: 'suja' },
    orderBy: { lastWornAt: 'desc' },
  });
  const reusavel = await db.garment.findMany({
    where: { status: 'reusavel' },
    orderBy: { lastWornAt: 'desc' },
  });
  const lavando = await db.garment.findMany({
    where: { status: 'lavando' },
    orderBy: { updatedAt: 'desc' },
  });

  const recentWashes = await db.washLog.findMany({
    orderBy: { washedAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ suja, reusavel, lavando, recentWashes });
}

// POST /api/laundry — marca peças como lavadas (volta para disponível)
// Body: { garmentIds: string[] } ou { garmentIds: ['all-sujas'] } para todas do cesto
// Também suporta { action: 'start-washing', garmentIds } para mover para lavando
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { garmentIds, action } = body as { garmentIds: string[]; action?: 'wash' | 'start-washing' };

    if (!Array.isArray(garmentIds) || garmentIds.length === 0) {
      return NextResponse.json({ error: 'garmentIds é obrigatório' }, { status: 400 });
    }

    const ids = garmentIds;
    const now = new Date();

    if (action === 'start-washing') {
      // Mover para "lavando"
      await db.garment.updateMany({
        where: { id: { in: ids } },
        data: { status: 'lavando' },
      });
      return NextResponse.json({ ok: true, action: 'started-washing', count: ids.length });
    }

    // Ação padrão: marcar como lavada (disponível)
    await db.garment.updateMany({
      where: { id: { in: ids } },
      data: {
        status: 'disponivel',
        reuseCount: 0,
      },
    });

    // Registrar no log de lavagens
    await db.washLog.create({
      data: {
        garmentIds: JSON.stringify(ids),
        washedAt: now,
      },
    });

    return NextResponse.json({ ok: true, washed: ids.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[laundry POST] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

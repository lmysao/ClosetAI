import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canReuse } from '@/lib/constants';

// POST /api/outfits/use — marca uma combinação como usada
// Atualiza status das peças: íntimas → suja; outras → reusavel (se ainda pode) ou suja
// Body: { garmentIds: string[], saveAsUniform?: boolean, uniformName?: string, eventType?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { garmentIds, saveAsUniform, uniformName, eventType } = body as {
      garmentIds: string[];
      saveAsUniform?: boolean;
      uniformName?: string;
      eventType?: string;
    };

    if (!Array.isArray(garmentIds) || garmentIds.length === 0) {
      return NextResponse.json({ error: 'garmentIds é obrigatório' }, { status: 400 });
    }

    const garments = await db.garment.findMany({
      where: { id: { in: garmentIds } },
    });

    const now = new Date();

    // Atualizar cada peça conforme regras de reuso
    for (const g of garments) {
      const canReuseCat = canReuse(g.category);
      const newReuseCount = g.reuseCount + 1;

      if (!canReuseCat) {
        // Cuecas/calcinhas/meias/suter → sempre suja
        await db.garment.update({
          where: { id: g.id },
          data: {
            status: 'suja',
            reuseCount: 0,
            timesWorn: g.timesWorn + 1,
            lastWornAt: now,
          },
        });
      } else {
        // Outras: se atingiu maxReuses → suja, senão → reusavel
        if (newReuseCount >= g.maxReuses) {
          await db.garment.update({
            where: { id: g.id },
            data: {
              status: 'suja',
              reuseCount: 0,
              timesWorn: g.timesWorn + 1,
              lastWornAt: now,
            },
          });
        } else {
          await db.garment.update({
            where: { id: g.id },
            data: {
              status: 'reusavel',
              reuseCount: newReuseCount,
              timesWorn: g.timesWorn + 1,
              lastWornAt: now,
            },
          });
        }
      }
    }

    // Salvar como outfit
    const outfit = await db.outfit.create({
      data: {
        name: uniformName || `Look de ${new Date().toLocaleDateString('pt-BR')}`,
        garmentIds: JSON.stringify(garmentIds),
        eventType: eventType || null,
        wornAt: saveAsUniform ? null : now,
        isUniform: saveAsUniform === true,
      },
    });

    return NextResponse.json({ ok: true, outfit });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[use] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

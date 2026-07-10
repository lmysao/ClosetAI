import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateShoppingTips } from '@/lib/ai';

// GET /api/shopping — lista dicas de compra salvas
export async function GET() {
  const tips = await db.shoppingTip.findMany({
    orderBy: [{ resolved: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ tips });
}

// POST /api/shopping — gera novas dicas via IA
// Substitui dicas antigas não resolvidas
export async function POST() {
  try {
    const allGarments = await db.garment.findMany();

    if (allGarments.length === 0) {
      return NextResponse.json({
        error: 'Adicione algumas peças ao guarda-roupa antes de gerar dicas.',
      }, { status: 400 });
    }

    // Buscar outfits recentes (últimos 30 dias)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOutfits = await db.outfit.findMany({
      where: { wornAt: { gte: since } },
      select: { garmentIds: true, wornAt: true },
    });

    const parsedOutfits = recentOutfits.map((o) => ({
      garmentIds: JSON.parse(o.garmentIds) as string[],
      wornAt: o.wornAt.toISOString(),
    }));

    const tips = await generateShoppingTips(allGarments, parsedOutfits);

    // Limpar dicas antigas não resolvidas
    await db.shoppingTip.deleteMany({ where: { resolved: false } });

    // Inserir novas
    const created = [];
    for (const t of tips) {
      const tip = await db.shoppingTip.create({
        data: {
          title: t.title,
          category: t.category,
          priority: t.priority,
          reason: t.reason ?? null,
          kind: t.kind,
        },
      });
      created.push(tip);
    }

    return NextResponse.json({ tips: created });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[shopping POST] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

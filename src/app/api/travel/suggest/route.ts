import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suggestTravelOutfit } from '@/lib/ai';
import type { TravelSuggestRequest } from '@/lib/types';

// POST /api/travel/suggest — IA sugere conjunto para viagem
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TravelSuggestRequest;
    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'destination, startDate e endDate são obrigatórios' }, { status: 400 });
    }

    // Buscar peças disponíveis/reusáveis
    const candidates = await db.garment.findMany({
      where: { OR: [{ status: 'disponivel' }, { status: 'reusavel' }] },
    });

    if (candidates.length < 4) {
      return NextResponse.json({
        error: 'Você precisa de pelo menos 4 peças disponíveis para gerar sugestão de viagem.',
      }, { status: 400 });
    }

    // Excluir peças reservadas
    const reserved = await db.reservedSet.findMany({ where: { status: 'reservado' } });
    const reservedIds = new Set<string>();
    for (const r of reserved) {
      for (const id of JSON.parse(r.garmentIds) as string[]) reservedIds.add(id);
    }
    const available = candidates.filter((g) => !reservedIds.has(g.id));

    const result = await suggestTravelOutfit(available, body);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[travel/suggest] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

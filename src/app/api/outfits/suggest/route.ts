import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suggestOutfits } from '@/lib/ai';
import { canReuse } from '@/lib/constants';
import type { SuggestRequest } from '@/lib/types';

// POST /api/outfits/suggest — gera 3 sugestões de combinação via LLM
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SuggestRequest;

    if (!body.eventType) {
      return NextResponse.json({ error: 'eventType é obrigatório' }, { status: 400 });
    }

    // Buscar peças disponíveis OU reusáveis (exceto íntimas, que devem ser disponíveis)
    const candidates = await db.garment.findMany({
      where: {
        OR: [
          { status: 'disponivel' },
          { status: 'reusavel' },
        ],
      },
    });

    // Filtrar íntimas: só disponíveis podem entrar (cueca/calcinha/meia/suter nunca reusar)
    const filtered = candidates.filter((g) => {
      if (g.status === 'reusavel' && !canReuse(g.category)) return false;
      return true;
    });

    if (filtered.length < 4) {
      return NextResponse.json({
        error: 'Você precisa de pelo menos 4 peças disponíveis para gerar combinações. Atualize: ' + filtered.length + ' disponíveis.',
        suggestions: [],
      }, { status: 400 });
    }

    const suggestions = await suggestOutfits(filtered, body);
    return NextResponse.json({ suggestions });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[suggest] erro:', msg);
    return NextResponse.json({ error: msg, suggestions: [] }, { status: 500 });
  }
}

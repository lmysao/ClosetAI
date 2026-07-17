import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { defaultMaxReuses } from '@/lib/constants';

// GET /api/garments — lista com filtros opcionais
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const formality = searchParams.get('formality');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (category && category !== 'all') where.category = category;
    if (status && status !== 'all') where.status = status;
    if (gender && gender !== 'all') where.gender = gender;
    if (formality && formality !== 'all') where.formality = formality;
    if (search) where.name = { contains: search };

    const garments = await db.garment.findMany({
      where,
      orderBy: [{ favorite: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ garments });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[garments GET] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/garments — cria nova peça (após análise VLM no cliente)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.imageData || !body.category) {
      return NextResponse.json(
        { error: 'imageData e category são obrigatórios' },
        { status: 400 }
      );
    }

    const maxReuses =
      body.maxReuses !== undefined
        ? Number(body.maxReuses)
        : defaultMaxReuses(body.category);

    const garment = await db.garment.create({
      data: {
        name: body.name || 'Sem nome',
        category: body.category,
        subcategory: body.subcategory ?? null,
        color: body.color ?? null,
        colorHex: body.colorHex ?? null,
        pattern: body.pattern ?? null,
        fabric: body.fabric ?? null,
        season: body.season ?? 'todas',
        formality: body.formality ?? 'casual',
        gender: body.gender ?? 'masculino',
        status: body.status ?? 'disponivel',
        maxReuses,
        imageData: body.imageData,
        backImage: body.backImage ?? null,
        brand: body.brand ?? null,
        notes: body.notes ?? null,
        favorite: body.favorite ?? false,
        careInstructions: body.careInstructions ?? null,
        usageRestrictions: body.usageRestrictions ?? null,
        defects: body.defects ?? null,
        careTips: body.careTips ?? null,
      },
    });

    return NextResponse.json({ garment }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[garments POST] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/model-photos — lista fotos de modelo
export async function GET() {
  try {
    const photos = await db.modelPhoto.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ photos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[model-photos GET] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/model-photos — adiciona foto de modelo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.imageData || !body.imageData.startsWith('data:image')) {
      return NextResponse.json({ error: 'imageData é obrigatório' }, { status: 400 });
    }
    // Limitar a 3 fotos
    const count = await db.modelPhoto.count();
    if (count >= 3) {
      return NextResponse.json({ error: 'Você pode ter no máximo 3 fotos de modelo. Remova uma antes de adicionar.' }, { status: 400 });
    }
    const photo = await db.modelPhoto.create({
      data: {
        imageData: body.imageData,
        label: body.label ?? null,
      },
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[model-photos POST] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

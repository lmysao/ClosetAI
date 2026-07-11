import { NextRequest, NextResponse } from 'next/server';
import { analyzeWornOutfitPhoto } from '@/lib/ai';

// POST /api/garments/analyze-worn — analisa foto de pessoa vestida e separa peças
// Body: { imageData: "data:image/jpeg;base64,..." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData } = body as { imageData?: string };

    if (!imageData || !imageData.startsWith('data:image')) {
      return NextResponse.json(
        { error: 'imageData deve ser uma data URL de imagem' },
        { status: 400 }
      );
    }

    const pieces = await analyzeWornOutfitPhoto(imageData);
    return NextResponse.json({ pieces });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[analyze-worn] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

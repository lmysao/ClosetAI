import { NextRequest, NextResponse } from 'next/server';
import { analyzeGarmentPhoto } from '@/lib/ai';

// POST /api/garments/analyze — analisa foto de peça com VLM (Vision Language Model)
// Body: { imageData: "data:image/jpeg;base64,..." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData } = body as { imageData?: string };

    if (!imageData || !imageData.startsWith('data:image')) {
      return NextResponse.json(
        { error: 'imageData deve ser uma data URL de imagem (data:image/...)' },
        { status: 400 }
      );
    }

    const analysis = await analyzeGarmentPhoto(imageData);
    return NextResponse.json({ analysis });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[analyze] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

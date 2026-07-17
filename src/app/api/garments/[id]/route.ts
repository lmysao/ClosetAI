import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/garments/[id] — atualiza peça (status, favorito, etc)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.garment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Peça não encontrada' }, { status: 404 });
    }

    // Campos permitidos para atualização
    const allowed: string[] = [
      'name', 'subcategory', 'color', 'colorHex', 'pattern', 'fabric',
      'season', 'formality', 'gender', 'status', 'maxReuses',
      'timesWorn', 'reuseCount', 'lastWornAt', 'brand', 'notes', 'favorite',
      'backImage', 'careInstructions', 'usageRestrictions', 'defects', 'careTips',
    ];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) data[k] = body[k];
    }

    const updated = await db.garment.update({ where: { id }, data });
    return NextResponse.json({ garment: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[garments PATCH] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/garments/[id] — remove peça (não usa mais)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.garment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[garments DELETE] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

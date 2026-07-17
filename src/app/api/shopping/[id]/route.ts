import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/shopping/[id] — marcar dica como resolvida/ignorada
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { resolved } = body as { resolved?: boolean };

    const tip = await db.shoppingTip.update({
      where: { id },
      data: { resolved: resolved ?? true },
    });
    return NextResponse.json({ tip });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[shopping PATCH] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/shopping/[id] — remover dica
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.shoppingTip.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[shopping DELETE] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

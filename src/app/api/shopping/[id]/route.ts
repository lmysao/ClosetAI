import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/shopping/[id] — marcar dica como resolvida/ignorada
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { resolved } = body as { resolved?: boolean };

  const tip = await db.shoppingTip.update({
    where: { id },
    data: { resolved: resolved ?? true },
  });
  return NextResponse.json({ tip });
}

// DELETE /api/shopping/[id] — remover dica
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.shoppingTip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

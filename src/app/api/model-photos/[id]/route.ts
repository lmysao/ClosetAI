import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/model-photos/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.modelPhoto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CATEGORIES, NEVER_REUSE_CATEGORIES } from '@/lib/constants';
import type { Stats } from '@/lib/types';

// GET /api/stats — estatísticas gerais do guarda-roupa
export async function GET() {
  try {
  const all = await db.garment.findMany();

  const total = all.length;
  const disponivel = all.filter((g) => g.status === 'disponivel').length;
  const suja = all.filter((g) => g.status === 'suja').length;
  const reusavel = all.filter((g) => g.status === 'reusavel').length;
  const lavando = all.filter((g) => g.status === 'lavando').length;

  // Por categoria
  const catCount: Record<string, number> = {};
  for (const g of all) {
    catCount[g.category] = (catCount[g.category] ?? 0) + 1;
  }
  const byCategory = Object.entries(catCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Por formalidade
  const formCount: Record<string, number> = {};
  for (const g of all) {
    formCount[g.formality] = (formCount[g.formality] ?? 0) + 1;
  }
  const byFormality = Object.entries(formCount).map(([formality, count]) => ({ formality, count }));

  // Mais usadas
  const mostWorn = [...all]
    .sort((a, b) => b.timesWorn - a.timesWorn)
    .slice(0, 5)
    .map((g) => ({ name: g.name, timesWorn: g.timesWorn, category: g.category }));

  // Menos usadas (disponíveis há muito tempo)
  const leastWorn = [...all]
    .filter((g) => g.status === 'disponivel')
    .sort((a, b) => (a.timesWorn - b.timesWorn) || (new Date(a.lastWornAt ?? a.createdAt).getTime() - new Date(b.lastWornAt ?? b.createdAt).getTime()))
    .slice(0, 5)
    .map((g) => ({
      name: g.name,
      timesWorn: g.timesWorn,
      category: g.category,
      lastWornAt: g.lastWornAt?.toISOString() ?? null,
    }));

  // Essenciais faltando (cada categoria essential deve ter pelo menos 2 peças, íntimas pelo menos 5)
  const missingEssentials: string[] = [];
  for (const [key, meta] of Object.entries(CATEGORIES)) {
    if (!meta.essential) continue;
    const count = catCount[key] ?? 0;
    const required = NEVER_REUSE_CATEGORIES.includes(key) ? 5 : 2;
    if (count < required) {
      missingEssentials.push(`${meta.label} (tem ${count}, ideal ≥${required})`);
    }
  }

  // Score de rotação: baseado em quantas peças disponíveis foram usadas nas últimas 2 semanas
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const usedRecently = all.filter(
    (g) => g.lastWornAt && new Date(g.lastWornAt).getTime() > twoWeeksAgo
  ).length;
  const rotationScore = total > 0 ? Math.round((usedRecently / total) * 100) : 0;

  // Alerta de lavanderia: se tem mais de 5 sujas ou mais íntimas sujas que disponíveis
  const sujasIntimas = all.filter((g) => g.status === 'suja' && NEVER_REUSE_CATEGORIES.includes(g.category)).length;
  const dispIntimas = all.filter((g) => g.status === 'disponivel' && NEVER_REUSE_CATEGORIES.includes(g.category)).length;
  const laundryAlert = suja >= 5 || sujasIntimas >= dispIntimas;

  const stats: Stats = {
    total,
    disponivel,
    suja,
    reusavel,
    lavando,
    byCategory,
    byFormality,
    mostWorn,
    leastWorn,
    missingEssentials,
    rotationScore,
    laundryAlert,
  };

  return NextResponse.json({ stats });
  } catch (error) {
    console.error('[/api/stats] Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar estatísticas', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

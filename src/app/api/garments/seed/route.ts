import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CATEGORIES, defaultMaxReuses } from '@/lib/constants';

// POST /api/garments/seed — popula o banco com peças demo (SVG placeholders)
// para o usuário poder testar todas as funcionalidades imediatamente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const existing = await db.garment.count();
    if (existing > 0 && !force) {
      return NextResponse.json({
        ok: false,
        message: `Já existem ${existing} peças. Envie { "force": true } para recriar.`,
      });
    }

    if (force) {
      await db.garment.deleteMany();
    }

    // Gera SVG placeholder colorido como data URL
    const placeholder = (label: string, hex: string, emoji: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${hex}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${hex}" stop-opacity="0.7"/>
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#g)"/>
        <text x="200" y="170" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
        <text x="200" y="290" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${label}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    };

    const seedData: Array<{
      name: string;
      category: string;
      color: string;
      colorHex: string;
      pattern: string;
      fabric: string;
      season: string;
      formality: string;
      gender: string;
      brand?: string;
      subcategory?: string;
      emoji: string;
    }> = [
      // Superiores masculino
      { name: 'Camiseta preta lisa', category: 'camiseta', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'casual', gender: 'masculino', brand: 'Hering', emoji: '👕' },
      { name: 'Camiseta branca básica', category: 'camiseta', color: 'branco', colorHex: '#f8f8f8', pattern: 'liso', fabric: 'algodao', season: 'verao', formality: 'casual', gender: 'masculino', emoji: '👕' },
      { name: 'Camiseta cinza moleton', category: 'camiseta', color: 'cinza', colorHex: '#9ca3af', pattern: 'liso', fabric: 'malha', season: 'inverno', formality: 'casual', gender: 'masculino', emoji: '👕' },
      { name: 'Polo azul-marinho', category: 'camisa', subcategory: 'polo', color: 'azul-marinho', colorHex: '#1e3a5f', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'casual-chique', gender: 'masculino', brand: 'Ralph Lauren', emoji: '👔' },
      { name: 'Camisa social branca', category: 'camisa', subcategory: 'social', color: 'branco', colorHex: '#f8f8f8', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'social', gender: 'masculino', emoji: '👔' },
      { name: 'Camisa xadrez vermelha', category: 'camisa', subcategory: 'flanela', color: 'vermelho', colorHex: '#dc2626', pattern: 'xadrez', fabric: 'algodao', season: 'inverno', formality: 'casual', gender: 'masculino', emoji: '👔' },
      { name: 'Regata preta academia', category: 'regata', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'poliester', season: 'verao', formality: 'esporte', gender: 'masculino', emoji: '🦺' },
      { name: 'Moleton cinza canguru', category: 'blusa', color: 'cinza', colorHex: '#6b7280', pattern: 'liso', fabric: 'malha', season: 'inverno', formality: 'casual', gender: 'masculino', emoji: '🧶' },
      // Inferiores masculino
      { name: 'Calça jeans azul', category: 'calca', subcategory: 'jeans', color: 'azul', colorHex: '#3b5b8a', pattern: 'liso', fabric: 'jeans', season: 'todas', formality: 'casual', gender: 'masculino', brand: 'Levis', emoji: '👖' },
      { name: 'Calça social preta', category: 'calca', subcategory: 'social', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'poliester', season: 'todas', formality: 'social', gender: 'masculino', emoji: '👖' },
      { name: 'Calça chino bege', category: 'calca', subcategory: 'chino', color: 'bege', colorHex: '#d4b896', pattern: 'liso', fabric: 'algodao', season: 'primavera', formality: 'casual-chique', gender: 'masculino', emoji: '👖' },
      { name: 'Bermuda jeans azul', category: 'bermuda', color: 'azul', colorHex: '#3b5b8a', pattern: 'liso', fabric: 'jeans', season: 'verao', formality: 'casual', gender: 'masculino', emoji: '🩳' },
      { name: 'Bermuda preta', category: 'bermuda', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'poliester', season: 'verao', formality: 'casual', gender: 'masculino', emoji: '🩳' },
      { name: 'Bermuda moletom cinza', category: 'bermuda', subcategory: 'moleton', color: 'cinza', colorHex: '#9ca3af', pattern: 'liso', fabric: 'malha', season: 'todas', formality: 'casa', gender: 'masculino', emoji: '🩳' },
      { name: 'Calça de moletom preta', category: 'calca', subcategory: 'jogger', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'malha', season: 'inverno', formality: 'casa', gender: 'masculino', emoji: '👖' },
      // Íntimas
      { name: 'Cueca boxer preta', category: 'cueca', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'intima', gender: 'masculino', brand: 'Dude', emoji: '🩲' },
      { name: 'Cueca boxer cinza', category: 'cueca', color: 'cinza', colorHex: '#9ca3af', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'intima', gender: 'masculino', emoji: '🩲' },
      { name: 'Cueca boxer azul', category: 'cueca', color: 'azul', colorHex: '#3b82f6', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'intima', gender: 'masculino', emoji: '🩲' },
      { name: 'Meia preta cano curto', category: 'meia', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'intima', gender: 'masculino', emoji: '🧦' },
      { name: 'Meia branca esportiva', category: 'meia', color: 'branco', colorHex: '#f8f8f8', pattern: 'liso', fabric: 'algodao', season: 'todas', formality: 'esporte', gender: 'masculino', emoji: '🧦' },
      // Calçados
      { name: 'Tênis branco casual', category: 'tenis', color: 'branco', colorHex: '#f8f8f8', pattern: 'liso', fabric: 'caneleiro', season: 'todas', formality: 'casual', gender: 'unissex', brand: 'Nike', emoji: '👟' },
      { name: 'Tênis preto corrida', category: 'tenis', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'poliester', season: 'todas', formality: 'esporte', gender: 'unissex', emoji: '👟' },
      { name: 'Sapato social marrom', category: 'sapato', color: 'marrom', colorHex: '#92400e', pattern: 'liso', fabric: 'couro', season: 'todas', formality: 'social', gender: 'masculino', emoji: '👞' },
      { name: 'Chinelo de casa', category: 'chinelo', color: 'azul', colorHex: '#3b82f6', pattern: 'liso', fabric: 'borracha', season: 'todas', formality: 'casa', gender: 'unissex', emoji: '🩴' },
      // Externas
      { name: 'Jaqueta jeans azul', category: 'jaqueta', color: 'azul', colorHex: '#3b5b8a', pattern: 'liso', fabric: 'jeans', season: 'inverno', formality: 'casual', gender: 'masculino', emoji: '🧥' },
      { name: 'Casaco preto inverno', category: 'casaco', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'la', season: 'inverno', formality: 'casual-chique', gender: 'masculino', emoji: '🧥' },
      // Acessórios
      { name: 'Relógio prata', category: 'relogio', color: 'prata', colorHex: '#d1d5db', pattern: 'liso', fabric: 'metal', season: 'todas', formality: 'social', gender: 'unissex', emoji: '⌚' },
      { name: 'Cinto preto couro', category: 'cinto', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'couro', season: 'todas', formality: 'social', gender: 'masculino', emoji: '➰' },
      { name: 'Boné preto', category: 'bone', color: 'preto', colorHex: '#1a1a1a', pattern: 'liso', fabric: 'algodao', season: 'verao', formality: 'casual', gender: 'unissex', emoji: '🧢' },
      // Perfumes preferidos
      { name: 'Coffee Unique', category: 'perfume', color: 'marrom', colorHex: '#92400e', pattern: 'liso', fabric: 'fragrancia', season: 'todas', formality: 'social', gender: 'masculino', brand: 'O Boticário', emoji: '🧴' },
      { name: 'Coffee Essencial', category: 'perfume', color: 'marrom', colorHex: '#7c2d12', pattern: 'liso', fabric: 'fragrancia', season: 'todas', formality: 'elegante', gender: 'masculino', brand: 'O Boticário', emoji: '🧴' },
    ];

    // Inserir todas
    for (const p of seedData) {
      await db.garment.create({
        data: {
          name: p.name,
          category: p.category,
          subcategory: p.subcategory ?? null,
          color: p.color,
          colorHex: p.colorHex,
          pattern: p.pattern,
          fabric: p.fabric,
          season: p.season,
          formality: p.formality,
          gender: p.gender,
          status: 'disponivel',
          maxReuses: defaultMaxReuses(p.category),
          imageData: placeholder(CATEGORIES[p.category]?.label ?? p.category, p.colorHex, p.emoji),
          brand: p.brand ?? null,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      count: seedData.length,
      message: `${seedData.length} peças demo criadas!`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[seed] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

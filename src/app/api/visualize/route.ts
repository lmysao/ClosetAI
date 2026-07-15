import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';

// POST /api/visualize — gera prompt detalhado para visualização externa (ex: nano banana)
// Body: { garmentIds: string[] }
// Retorna: { prompt, garments: [{name, category, imageData, color}] }
// O cliente monta o zip com as imagens + prompt.txt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { garmentIds } = body as { garmentIds?: string[] };

    if (!Array.isArray(garmentIds) || garmentIds.length === 0) {
      return NextResponse.json({ error: 'garmentIds é obrigatório' }, { status: 400 });
    }

    const garments = await db.garment.findMany({
      where: { id: { in: garmentIds } },
    });

    if (garments.length === 0) {
      return NextResponse.json({ error: 'Nenhuma peça encontrada' }, { status: 404 });
    }

    // Construir descrição detalhada de cada peça
    const pieceDescriptions = garments.map((g, i) => {
      const cat = CATEGORIES[g.category];
      const parts = [
        `PEÇA ${i + 1}: ${g.name}`,
        `  - Categoria: ${cat?.label ?? g.category}`,
        `  - Cor: ${g.color ?? 'não informada'} (hex: ${g.colorHex ?? '?'})`,
        g.pattern ? `  - Padrão: ${g.pattern}` : '',
        g.fabric ? `  - Tecido: ${g.fabric}` : '',
        g.formality ? `  - Formalidade: ${g.formality}` : '',
        g.brand ? `  - Marca: ${g.brand}` : '',
        g.backImage ? '  - HÁ FOTO DO VERSO (estampa/logo nas costas)' : '',
      ].filter(Boolean);
      return parts.join('\n');
    }).join('\n\n');

    // Camadas presentes
    const layersPresent = new Set<string>();
    for (const g of garments) {
      const cat = CATEGORIES[g.category];
      if (cat) layersPresent.add(cat.group);
    }

    const prompt = `# Visualização de Look — ClosetAI

Você é uma IA de visualização de moda (ex: Nano Banana). Sua tarefa é vestir a pessoa na FOTO MODELO com as peças descritas abaixo, mantendo proporções realistas, caimento natural e iluminação de estúdio profissional.

## INSTRUÇÕES:
1. Substitua as roupas atuais da pessoa na foto modelo pelas peças fornecidas.
2. Mantenha o rosto, corpo e pose da pessoa intactos.
3. Ajuste cores, padrões e caimentos conforme cada peça.
4. Adicione acessórios (relógio, cinto, boné) e perfume se aplicável.
5. Iluminação de estúdio profissional, fundo neutro.
6. Respeite estampas do VERSO da peça quando houver foto do verso.

## PEÇAS DO LOOK (${garments.length}):
${pieceDescriptions}

## CAMADAS PRESENTES:
${Array.from(layersPresent).join(', ')}

## ARQUIVOS DE IMAGEM ANEXADOS:
- model.jpg (ou model.png): a foto modelo (pessoa vestida) que você vai usar como base.
- piece-1.jpg, piece-2.jpg, ...: foto frontal de cada peça (na ordem acima).
- piece-1-back.jpg (quando houver): foto do verso da peça 1.

## PROMPT FINAL:
"Vista a pessoa da foto modelo com: ${garments.map((g) => `${g.color ?? ''} ${CATEGORIES[g.category]?.label ?? g.category} (${g.name})`).join(', ')}. Iluminação de estúdio, fundo neutro, realista, alta qualidade."`;

    return NextResponse.json({
      prompt,
      garments: garments.map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        color: g.color,
        colorHex: g.colorHex,
        imageData: g.imageData,
        backImage: g.backImage,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('[visualize] erro:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

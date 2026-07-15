// Helpers de IA: VLM para analisar fotos de roupas, LLM para sugerir combinações e dicas de compra
// z-ai-web-dev-sdk só pode ser usado no backend (server-side)

import ZAI from 'z-ai-web-dev-sdk';
import { CATEGORIES, FORMALITIES, PREFERRED_PERFUMES, OUTFIT_LAYERS, COLOR_PALETTE, defaultMaxReuses, canReuse, FABRIC_CARE, COMMON_DEFECTS, CARE_TIPS_LIBRARY, TRAVEL_CONTEXTS } from './constants';
import type { Garment, AnalyzeResult, OutfitSuggestion, SuggestRequest, ShoppingTip, WornOutfitPiece, TravelSuggestRequest } from './types';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ---- VLM: analisar foto de peça de roupa (com defeitos, cuidados, verso opcional) ----
export async function analyzeGarmentPhoto(imageBase64: string, backImageBase64?: string): Promise<AnalyzeResult> {
  const zai = await getZAI();

  const categoriesList = Object.entries(CATEGORIES)
    .map(([k, v]) => `${k} (${v.label})`)
    .join(', ');

  const prompt = `Você é um especialista em moda e conservação de roupas. Analise esta peça de roupa/acessório${backImageBase64 ? ' (há também uma foto do verso)' : ''} e retorne APENAS um JSON válido (sem markdown, sem texto extra) com esta estrutura exata:
{
  "name": "nome curto e descritivo em português, ex: 'Camiseta preta lisa de algodão'",
  "category": "uma destas categorias exatas: ${categoriesList}",
  "subcategory": "subcategoria se aplicável, ex: 'regata', 'slim', 'social', ou null",
  "color": "cor principal em português (preto, branco, cinza, azul-marinho, vermelho, etc)",
  "colorHex": "hex aproximado da cor principal, ex: '#1a1a1a'. Para estampado use '#multicolor'",
  "pattern": "padrão: liso, listrado, xadrez, estampado, quadriculado, floral",
  "fabric": "tecido provável: algodao, poliester, jeans, linho, malha, la, couro, caneleiro",
  "season": "estação ideal: verao, inverno, primavera, outono, todas",
  "formality": "formalidade: casual, casual-chique, social, esporte, elegante",
  "gender": "genero: masculino, feminino, unissex",
  "brand": "marca se visível na imagem, ou null",
  "description": "descrição curta (1 frase) da peça",
  "defects": "descreva defeitos visíveis: buracos, manchas (cor e local), desfiados, botões faltando, pilling, desbotamento, elástico folgado, etc. Seja específico (ex: 'mancha amarelada perto da gola', 'buraco de 2mm na barra esquerda'). Se não houver defeitos, retorne string vazia.",
  "careInstructions": "instruções de lavagem e cuidados específicas para esta peça (água fria/morna, passar ferro, secagem, alvejante, etc). Considere o tecido detectado.",
  "usageRestrictions": "restrições de uso (ex: 'não usar em dias de chuva — solta tinta', 'evitar calor — encolhe', 'não usar com cinto de fivela metálica — risca'). Se nenhuma, string vazia.",
  "careTips": "dicas práticas de salvar/conservar esta peça. Se houver defeito, sugira como consertar/remover (ex: 'mancha de gordura sai com detergente', 'manga deformada volta com vapor'). Se nenhuma dica relevante, string vazia."
}

Defeitos comuns a procurar: ${COMMON_DEFECTS.join(', ')}.
Seja preciso com a categoria. Retorne SOMENTE o JSON.`;

  const contentParts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: imageBase64 } },
  ];
  if (backImageBase64) {
    contentParts.push({ type: 'text', text: 'Foto do verso:' });
    contentParts.push({ type: 'image_url', image_url: { url: backImageBase64 } });
  }

  const response = await zai.chat.completions.createVision({
    messages: [
      { role: 'user', content: contentParts },
    ],
    thinking: { type: 'disabled' },
  });

  const content = response.choices[0]?.message?.content ?? '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Não foi possível extrair JSON da análise: ' + content.slice(0, 200));
  }

  let parsed: AnalyzeResult;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('JSON inválido da análise: ' + jsonMatch[0].slice(0, 200));
  }

  // Validar categoria; se não estiver na lista, tentar aproximar
  if (!CATEGORIES[parsed.category]) {
    const lower = (parsed.category ?? '').toLowerCase();
    const found = Object.keys(CATEGORIES).find((k) => lower.includes(k) || k.includes(lower));
    parsed.category = found ?? 'acessorio';
  }

  // Validar colorHex
  if (!parsed.colorHex || !parsed.colorHex.startsWith('#')) {
    const match = COLOR_PALETTE.find((c) => c.name === parsed.color?.toLowerCase());
    parsed.colorHex = match?.hex ?? '#888888';
  }

  // Garantir defaults dos campos novos
  parsed.defects = parsed.defects ?? '';
  parsed.careInstructions = parsed.careInstructions ?? (parsed.fabric ? (FABRIC_CARE[parsed.fabric] ?? '') : '');
  parsed.usageRestrictions = parsed.usageRestrictions ?? '';
  parsed.careTips = parsed.careTips ?? '';

  return parsed;
}

// ---- VLM: analisar foto de pessoa vestida e separar peças (lote) ----
export async function analyzeWornOutfitPhoto(imageBase64: string): Promise<WornOutfitPiece[]> {
  const zai = await getZAI();

  const categoriesList = Object.entries(CATEGORIES)
    .map(([k, v]) => `${k} (${v.label})`)
    .join(', ');

  const prompt = `Você é um especialista em moda. Veja esta foto de uma pessoa vestida. Identifique CADA peça de roupa/acessório visível que ela está usando e retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "pieces": [
    {
      "region": "região da foto onde a peça está, ex: 'tronco superior', 'pernas', 'pés', 'pulso esquerdo'",
      "analysis": {
        "name": "nome curto em português, ex: 'Camiseta branca lisa'",
        "category": "uma destas: ${categoriesList}",
        "subcategory": "subcategoria ou null",
        "color": "cor em português",
        "colorHex": "hex ou '#multicolor'",
        "pattern": "liso, listrado, xadrez, estampado, quadriculado, floral",
        "fabric": "algodao, poliester, jeans, linho, malha, la, couro, caneleiro",
        "season": "verao, inverno, primavera, outono, todas",
        "formality": "casual, casual-chique, social, esporte, elegante",
        "gender": "masculino, feminino, unissex",
        "brand": "marca se visível ou null",
        "description": "descrição curta",
        "defects": "defeitos visíveis ou string vazia",
        "careInstructions": "instruções de lavagem",
        "usageRestrictions": "restrições ou string vazia",
        "careTips": "dicas de conservar ou string vazia"
      }
    }
  ]
}

Identifique TODAS as peças visíveis: superior, inferior, íntimas se visíveis, calçado, casaco, acessórios (relógio, cinto, boné), etc. Não invente peças não visíveis. Retorne SOMENTE o JSON.`;

  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageBase64 } },
        ],
      },
    ],
    thinking: { type: 'disabled' },
  });

  const content = response.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Não foi possível extrair JSON da foto vestida: ' + content.slice(0, 200));
  }

  let parsed: { pieces: WornOutfitPiece[] };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('JSON inválido da foto vestida: ' + jsonMatch[0].slice(0, 200));
  }

  // Validar cada peça
  for (const p of parsed.pieces ?? []) {
    if (!CATEGORIES[p.analysis.category]) {
      const lower = (p.analysis.category ?? '').toLowerCase();
      const found = Object.keys(CATEGORIES).find((k) => lower.includes(k) || k.includes(lower));
      p.analysis.category = found ?? 'acessorio';
    }
    if (!p.analysis.colorHex || !p.analysis.colorHex.startsWith('#')) {
      const m = COLOR_PALETTE.find((c) => c.name === p.analysis.color?.toLowerCase());
      p.analysis.colorHex = m?.hex ?? '#888888';
    }
    p.analysis.defects = p.analysis.defects ?? '';
    p.analysis.careInstructions = p.analysis.careInstructions ?? (p.analysis.fabric ? (FABRIC_CARE[p.analysis.fabric] ?? '') : '');
    p.analysis.usageRestrictions = p.analysis.usageRestrictions ?? '';
    p.analysis.careTips = p.analysis.careTips ?? '';
  }

  return parsed.pieces ?? [];
}

// ---- LLM: sugerir conjunto para viagem ----
export async function suggestTravelOutfit(
  availableGarments: Garment[],
  request: TravelSuggestRequest
): Promise<{ garmentIds: string[]; reason: string }> {
  const zai = await getZAI();

  const compact = availableGarments.map((g) => ({
    id: g.id,
    n: g.name,
    c: g.category,
    co: g.color,
    p: g.pattern,
    f: g.formality,
    s: g.season,
    fa: g.fabric,
    status: g.status,
  }));

  const days = request.startDate && request.endDate
    ? Math.max(1, Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const ctxMeta = request.context ? (TRAVEL_CONTEXTS[request.context] ?? { label: request.context, hint: '' }) : null;

  const prompt = `Você é um consultor de viagens e moda. Monte um conjunto de roupas para levar nesta viagem.

DETALHES DA VIAGEM:
- Destino: ${request.destination}
- Datas: ${request.startDate} a ${request.endDate} (${days} dias)
- Clima previsto: ${request.weather || 'não informado'}
- Meio de transporte: ${request.transport || 'não informado'}
- Contexto: ${ctxMeta ? ctxMeta.label + ' — ' + ctxMeta.hint : request.context || 'geral'}
- Observações: ${request.notes || 'nenhuma'}

PEÇAS DISPONÍVEIS no guarda-roupa (use apenas estas):
${JSON.stringify(compact, null, 2)}

REGRAS:
1. Monte um CONJUNTO para ${days} dia(s) de viagem. Para viagens longas, sugira peças suficientes para os dias (íntimas suficientes, trocas de camisetas, etc).
2. Considere o clima, o contexto (praia/chácara/trabalho/etc) e o transporte.
3. Priorize peças que combinam entre si e que permitem reuso inteligente (calças/casacos podem reusar; íntimas não).
4. Não inclua peças reservadas ou com defeitos relevantes se possível.
5. Para viagens longe de casa, considere que vai precisar trocar de roupa — leve variedade.

Retorne APENAS JSON (sem markdown):
{
  "garmentIds": ["id1", "id2", ...],
  "reason": "explicação em português do porquê desta seleção para esta viagem, considerando clima, contexto e dias"
}`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'Você é um consultor de viagens e estilo. Responda apenas com JSON válido.' },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });

  const content = completion.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('IA não retornou JSON de viagem: ' + content.slice(0, 200));
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('JSON inválido de viagem: ' + jsonMatch[0].slice(0, 200));
  }
}

// ---- LLM: gerar 3 sugestões de combinação ----
export async function suggestOutfits(
  availableGarments: Garment[],
  request: SuggestRequest
): Promise<OutfitSuggestion[]> {
  const zai = await getZAI();

  // Mapear peças para um formato compacto para o LLM
  const compact = availableGarments.map((g) => ({
    id: g.id,
    n: g.name,
    c: g.category,
    co: g.color,
    p: g.pattern,
    f: g.formality,
    s: g.season,
    fa: g.fabric,
    rc: g.reuseCount,
    mr: g.maxReuses,
    lw: g.lastWornAt,
    fav: g.favorite,
  }));

  const eventLabel = request.eventType;
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });

  const prompt = `Você é um stylist pessoal inteligente. Seu trabalho é montar combinações de roupas masculinas (prioritariamente) e femininas que funcionem bem juntas.

CONTEXTO DA SAÍDA:
- Evento: ${eventLabel}
- Horário: ${request.eventTime || 'não especificado'}
- Clima: ${request.weather || 'não especificado'}
- Dia da semana: ${today}
- Observações: ${request.notes || 'nenhuma'}

PEÇAS DISPONÍVEIS (apenas estas, não invente peças):
${JSON.stringify(compact, null, 2)}

REGRAS:
1. Monte EXATAMENTE 3 combinações diferentes (uma mais segura/clássica, uma mais ousada/estilosa, uma mais confortável/prática).
2. Cada combinação deve incluir no mínimo: 1 peça íntima (cueca/calcinha), 1 superior, 1 inferior e 1 calçado. Adicione acessórios/perfume quando combinar.
3. Priorize peças com reuseCount baixo e que não foram usadas recentemente (boa rotação). Evite repetir a mesma peça nas 3 combinações.
4. Leve em conta a formalidade do evento, clima e estação.
5. NUNCA use cuecas/calcinhas/meias que já estão no estado "reusavel" — íntimas sempre devem estar "disponivel".
6. Respeite cores que combinam (neutras combinam entre si; evite muito contraste para casual, ouse para elegante).

Retorne APENAS um JSON (sem markdown) com esta estrutura:
{
  "suggestions": [
    {
      "name": "nome curto do look, ex: 'Básico Urbano'",
      "score": 85,
      "vibe": "uma palavra: classico, ousado, confortavel, elegante, esportivo",
      "reason": "explicação curta em português do porquê essa combinação funciona para este evento",
      "weatherNote": "nota sobre clima se relevante, ou null",
      "garmentIds": ["id1", "id2", "id3", ...]
    },
    ... // 3 objetos
  ]
}`;

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'Você é um stylist expert. Responda apenas com JSON válido, sem markdown nem texto extra.',
      },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });

  const content = completion.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('IA não retornou JSON válido: ' + content.slice(0, 200));
  }

  let parsed: { suggestions: Array<Omit<OutfitSuggestion, 'id' | 'garments'>> };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('JSON inválido da IA: ' + jsonMatch[0].slice(0, 200));
  }

  // Montar objetos completos com dados das peças
  const byId = new Map(availableGarments.map((g) => [g.id, g]));
  const result: OutfitSuggestion[] = (parsed.suggestions ?? []).slice(0, 3).map((s, idx) => ({
    id: `sug-${Date.now()}-${idx}`,
    name: s.name,
    score: s.score ?? 70,
    reason: s.reason ?? '',
    vibe: s.vibe ?? 'classico',
    weatherNote: s.weatherNote ?? undefined,
    garmentIds: s.garmentIds ?? [],
    garments: (s.garmentIds ?? [])
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((g) => ({
        id: g!.id,
        name: g!.name,
        category: g!.category,
        color: g!.color,
        colorHex: g!.colorHex,
        imageData: g!.imageData,
      })),
  }));

  return result;
}

// ---- LLM: dicas de compras + acessórios + perfumes ----
export async function generateShoppingTips(
  allGarments: Garment[],
  recentOutfits: Array<{ garmentIds: string[]; wornAt: string }>
): Promise<Array<Omit<ShoppingTip, 'id' | 'resolved' | 'createdAt'>>> {
  const zai = await getZAI();

  // Contar peças por categoria
  const byCategory: Record<string, number> = {};
  for (const g of allGarments) {
    byCategory[g.category] = (byCategory[g.category] ?? 0) + 1;
  }

  // Contar peças por formalidade
  const byFormality: Record<string, number> = {};
  for (const g of allGarments) {
    byFormality[g.formality] = (byFormality[g.formality] ?? 0) + 1;
  }

  // Contar uso recente (últimas 2 semanas) por peça
  const recentUse: Record<string, number> = {};
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const o of recentOutfits) {
    if (new Date(o.wornAt).getTime() > twoWeeksAgo) {
      for (const id of o.garmentIds) {
        recentUse[id] = (recentUse[id] ?? 0) + 1;
      }
    }
  }

  // Peças favoritas / mais usadas
  const overused = allGarments
    .filter((g) => (recentUse[g.id] ?? 0) >= 3)
    .map((g) => g.name);

  const prompt = `Você é um consultor de moda pessoal. Analise o guarda-roupa do usuário e gere dicas de compras PRÁTICAS e específicas.

ESTATÍSTICAS DO GUARDA-ROUPA:
- Total de peças: ${allGarments.length}
- Por categoria: ${JSON.stringify(byCategory)}
- Por formalidade: ${JSON.stringify(byFormality)}
- Peças sendo MUITO usadas (rotatividade ruim, precisa de reposição): ${overused.join(', ') || 'nenhuma'}

PERFUMES PREFERIDOS DO USUÁRIO:
${PREFERRED_PERFUMES.map((p) => `- ${p.name} (${p.brand}): ${p.vibe}`).join('\n')}

TAREFA: Gere de 4 a 7 dicas de compras úteis. Inclua:
1. Peças FALTANTES (essenciais que ele não tem ou tem poucas - ex: poucas cuecas, sem calça social, etc)
2. Reposições de peças muito usadas (para melhorar rotação)
3. Acessórios que ele ainda não tem mas que dariam mais versatilidade (cinto, relógio, boné)
4. Sugestão de perfume da lista preferida, recomendando qual combina com o guarda-roupa dele
5. Peça curinga que multiplicaria combinações

Retorne APENAS JSON (sem markdown):
{
  "tips": [
    {
      "title": "título curto, ex: 'Comprar 5 cuecas pretas'",
      "category": "categoria relacionada",
      "priority": "alta|media|baixa",
      "reason": "explicação em português do porquê e como vai ajudar",
      "kind": "roupa|acessorio|perfume"
    }
  ]
}`;

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'Você é um consultor de estilo. Responda apenas com JSON válido, sem markdown nem texto extra.',
      },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });

  const content = completion.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('IA não retornou JSON de dicas: ' + content.slice(0, 200));
  }

  let parsed: { tips: Array<Omit<ShoppingTip, 'id' | 'resolved' | 'createdAt'>> };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('JSON inválido de dicas: ' + jsonMatch[0].slice(0, 200));
  }

  return parsed.tips ?? [];
}

// ---- LLM: rotação inteligente — verificar peças subutilizadas ----
export async function analyzeRotation(allGarments: Garment[]): Promise<{
  score: number;
  feedback: string[];
  overused: string[];
  underused: string[];
}> {
  const zai = await getZAI();
  const now = Date.now();

  const stats = allGarments.map((g) => ({
    name: g.name,
    category: g.category,
    timesWorn: g.timesWorn,
    lastWornDays: g.lastWornAt ? Math.floor((now - new Date(g.lastWornAt).getTime()) / (1000 * 60 * 60 * 24)) : null,
  }));

  const prompt = `Analise a rotatividade do guarda-roupa e dê feedback em português.

PEÇAS (com dias desde último uso e vezes usadas):
${JSON.stringify(stats, null, 2)}

Regras:
- Score de 0 a 100 (quanto maior, melhor a rotação)
- "overused": peças usadas mais de 4 vezes e com último uso há menos de 3 dias
- "underused": peças disponíveis há mais de 20 dias sem uso (sem motivo)

Retorne APENAS JSON:
{
  "score": 75,
  "feedback": ["dica 1 curta", "dica 2 curta"],
  "overused": ["nome1"],
  "underused": ["nome1"]
}`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'Responda apenas com JSON válido.' },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });

  const content = completion.choices[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { score: 70, feedback: [], overused: [], underused: [] };

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { score: 70, feedback: [], overused: [], underused: [] };
  }
}

// Re-exportar helpers para uso nos routes
export { defaultMaxReuses, canReuse };

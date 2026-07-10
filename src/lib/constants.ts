// Constantes e taxonomia do guarda-roupa inteligente

export type Category =
  | 'camiseta'
  | 'camisa'
  | 'regata'
  | 'bermuda'
  | 'calca'
  | 'cueca'
  | 'calcinha'
  | 'suter'
  | 'meia'
  | 'tenis'
  | 'sapato'
  | 'chinelo'
  | 'casaco'
  | 'jaqueta'
  | 'blusa'
  | 'acessorio'
  | 'perfume'
  | 'relogio'
  | 'cinto'
  | 'bone';

export type GarmentStatus = 'disponivel' | 'suja' | 'reusavel' | 'lavando';

export type Formality = 'casual' | 'casual-chique' | 'social' | 'esporte' | 'elegante';

export type Gender = 'masculino' | 'feminino' | 'unissex';

export type Season = 'verao' | 'inverno' | 'primavera' | 'outono' | 'todas';

export type EventType = 'casual' | 'trabalho' | 'casual-chique' | 'social' | 'elegante' | 'esporte' | 'casa';

// Categorias de roupas com metadados
export const CATEGORIES: Record<string, {
  label: string;
  emoji: string;
  group: 'superior' | 'inferior' | 'intima' | 'calcado' | 'externa' | 'acessorio' | 'fragrancia';
  // quantas vezes pode reusar antes do cesto (0 = sempre suja)
  defaultMaxReuses: number;
  // se faz parte de um look básico
  essential: boolean;
}> = {
  camiseta:   { label: 'Camiseta', emoji: '👕', group: 'superior',  defaultMaxReuses: 1, essential: true },
  regata:     { label: 'Regata', emoji: '🦺', group: 'superior',  defaultMaxReuses: 1, essential: false },
  camisa:     { label: 'Camisa', emoji: '👔', group: 'superior',  defaultMaxReuses: 2, essential: true },
  blusa:      { label: 'Blusa/Moleton', emoji: '🧶', group: 'superior',  defaultMaxReuses: 3, essential: true },
  bermuda:    { label: 'Bermuda', emoji: '🩳', group: 'inferior',  defaultMaxReuses: 2, essential: true },
  calca:      { label: 'Calça', emoji: '👖', group: 'inferior',  defaultMaxReuses: 4, essential: true },
  cueca:      { label: 'Cueca', emoji: '🩲', group: 'intima',    defaultMaxReuses: 0, essential: true },
  calcinha:   { label: 'Calcinha', emoji: '🩱', group: 'intima',    defaultMaxReuses: 0, essential: true },
  suter:      { label: 'Sutiã', emoji: '👙', group: 'intima',    defaultMaxReuses: 0, essential: true },
  meia:       { label: 'Meia', emoji: '🧦', group: 'intima',    defaultMaxReuses: 0, essential: true },
  tenis:      { label: 'Tênis', emoji: '👟', group: 'calcado',   defaultMaxReuses: 5, essential: true },
  sapato:     { label: 'Sapato', emoji: '👞', group: 'calcado',   defaultMaxReuses: 5, essential: false },
  chinelo:    { label: 'Chinelo', emoji: '🩴', group: 'calcado',   defaultMaxReuses: 5, essential: false },
  casaco:     { label: 'Casaco', emoji: '🧥', group: 'externa',   defaultMaxReuses: 6, essential: true },
  jaqueta:    { label: 'Jaqueta', emoji: '🧥', group: 'externa',   defaultMaxReuses: 6, essential: false },
  acessorio:  { label: 'Acessório', emoji: '👓', group: 'acessorio', defaultMaxReuses: 99, essential: false },
  relogio:    { label: 'Relógio', emoji: '⌚', group: 'acessorio', defaultMaxReuses: 99, essential: false },
  cinto:      { label: 'Cinto', emoji: '➰', group: 'acessorio', defaultMaxReuses: 99, essential: false },
  bone:       { label: 'Boné', emoji: '🧢', group: 'acessorio', defaultMaxReuses: 99, essential: false },
  perfume:    { label: 'Perfume', emoji: '🧴', group: 'fragrancia', defaultMaxReuses: 99, essential: false },
};

export const CATEGORY_GROUPS = {
  superior: { label: 'Tronco Superior', emoji: '👕' },
  inferior: { label: 'Tronco Inferior', emoji: '👖' },
  intima: { label: 'Íntima & Meias', emoji: '🩲' },
  calcado: { label: 'Calçados', emoji: '👟' },
  externa: { label: 'Casacos & Jaquetas', emoji: '🧥' },
  acessorio: { label: 'Acessórios', emoji: '⌚' },
  fragrancia: { label: 'Perfumes', emoji: '🧴' },
} as const;

export const FORMALITIES: Record<Formality, { label: string; emoji: string; level: number }> = {
  casual:        { label: 'Casual', emoji: '😎', level: 1 },
  esporte:       { label: 'Esporte', emoji: '🏃', level: 1 },
  'casual-chique': { label: 'Casual Chique', emoji: '✨', level: 2 },
  social:        { label: 'Social', emoji: '💼', level: 3 },
  elegante:      { label: 'Elegante', emoji: '🎩', level: 4 },
};

export const EVENT_TYPES: Record<EventType, { label: string; emoji: string; formality: Formality; hint: string }> = {
  casual:         { label: 'Casual / Passear', emoji: '😎', formality: 'casual', hint: 'Passeio no shopping, findi com amigos' },
  casa:           { label: 'Ficar em casa', emoji: '🏠', formality: 'casual', hint: 'Conforto acima de tudo' },
  trabalho:       { label: 'Trabalho', emoji: '💼', formality: 'social', hint: 'Expediente, reuniões normais' },
  'casual-chique': { label: 'Encontro casual-chique', emoji: '✨', formality: 'casual-chique', hint: 'Encontro, barzinho, jantar descontraído' },
  social:         { label: 'Evento social', emoji: '🎉', formality: 'social', hint: 'Festa, casamento, cerimônia' },
  elegante:       { label: 'Elegante / Gala', emoji: '🎩', formality: 'elegante', hint: 'Gala, premiação, black tie' },
  esporte:        { label: 'Esporte / Academia', emoji: '🏃', formality: 'esporte', hint: 'Treino, corrida, quadra' },
};

export const STATUS_LABELS: Record<GarmentStatus, { label: string; emoji: string; color: string }> = {
  disponivel: { label: 'Disponível', emoji: '✅', color: 'emerald' },
  reusavel:   { label: 'Usada (pode reusar)', emoji: '🔄', color: 'amber' },
  suja:       { label: 'No cesto (suja)', emoji: '🧺', color: 'rose' },
  lavando:    { label: 'Lavando', emoji: '🫧', color: 'sky' },
};

export const SEASONS: Record<Season, { label: string; emoji: string }> = {
  verao:      { label: 'Verão', emoji: '☀️' },
  inverno:    { label: 'Inverno', emoji: '❄️' },
  primavera:  { label: 'Primavera', emoji: '🌸' },
  outono:     { label: 'Outono', emoji: '🍂' },
  todas:      { label: 'Todas', emoji: '🌤️' },
};

// Paleta de cores comum para roupas
export const COLOR_PALETTE: { name: string; hex: string }[] = [
  { name: 'preto', hex: '#1a1a1a' },
  { name: 'branco', hex: '#f8f8f8' },
  { name: 'cinza', hex: '#9ca3af' },
  { name: 'cinza-escuro', hex: '#4b5563' },
  { name: 'azul-marinho', hex: '#1e3a5f' },
  { name: 'azul', hex: '#3b82f6' },
  { name: 'verde', hex: '#22c55e' },
  { name: 'verde-musgo', hex: '#4d7c0f' },
  { name: 'vermelho', hex: '#dc2626' },
  { name: 'vinho', hex: '#7f1d1d' },
  { name: 'rosa', hex: '#ec4899' },
  { name: 'amarelo', hex: '#eab308' },
  { name: 'laranja', hex: '#f97316' },
  { name: 'marrom', hex: '#92400e' },
  { name: 'bege', hex: '#d4b896' },
  { name: 'creme', hex: '#f5e6c8' },
  { name: 'roxo', hex: '#7c3aed' },
  { name: 'turquesa', hex: '#06b6d4' },
  { name: 'estampado', hex: 'linear-gradient(45deg,#dc2626,#eab308,#22c55e,#3b82f6)' },
  { name: 'multicolor', hex: 'linear-gradient(45deg,#ec4899,#7c3aed,#06b6d4)' },
];

// Perfumes preferidos do usuário (O Boticário)
export const PREFERRED_PERFUMES = [
  { name: 'Coffee Unique', brand: 'O Boticário', vibe: 'amadeirado marcante, exclusivo', season: 'todas' },
  { name: 'Coffee Essencial', brand: 'O Boticário', vibe: 'amadeirado elegante, essencial', season: 'todas' },
  { name: 'Egeo', brand: 'O Boticário', vibe: 'cítrico fresco, jovem', season: 'verao' },
  { name: 'Malbec', brand: 'O Boticário', vibe: 'amadeirado sofisticado, vinho', season: 'inverno' },
  { name: 'Kaiak', brand: 'Natura', vibe: 'aquático fresco', season: 'verao' },
];

// Categorias que NUNCA podem ser reusadas (higiene)
export const NEVER_REUSE_CATEGORIES = ['cueca', 'calcinha', 'suter', 'meia'];

// Categorias que formam um "uniforme" básico (topo + baixo + íntima + calçado)
export const OUTFIT_LAYERS = {
  superior: ['camiseta', 'camisa', 'regata', 'blusa'],
  inferior: ['bermuda', 'calca'],
  intima: ['cueca', 'calcinha', 'suter', 'meia'],
  calcado: ['tenis', 'sapato', 'chinelo'],
  externa: ['casaco', 'jaqueta'],
  acessorio: ['acessorio', 'relogio', 'cinto', 'bone', 'perfume'],
} as const;

// Slots do builder de looks (manual + edição de sugestão da IA)
// multi = pode ter várias peças (acessórios); optional = pode ficar vazio
export interface BuilderSlot {
  key: string;
  label: string;
  emoji: string;
  categories: string[];
  multi: boolean;
  optional: boolean;
}

export const BUILDER_SLOTS: BuilderSlot[] = [
  { key: 'superior',  label: 'Superior',      emoji: '👕', categories: ['camiseta', 'camisa', 'regata', 'blusa'], multi: false, optional: false },
  { key: 'inferior',  label: 'Inferior',      emoji: '👖', categories: ['bermuda', 'calca'],                     multi: false, optional: false },
  { key: 'intima',    label: 'Cueca/Calcinha', emoji: '🩲', categories: ['cueca', 'calcinha', 'suter'],           multi: false, optional: false },
  { key: 'meia',      label: 'Meias',         emoji: '🧦', categories: ['meia'],                                 multi: false, optional: false },
  { key: 'calcado',   label: 'Calçado',       emoji: '👟', categories: ['tenis', 'sapato', 'chinelo'],            multi: false, optional: false },
  { key: 'externa',   label: 'Casaco',        emoji: '🧥', categories: ['casaco', 'jaqueta'],                     multi: false, optional: true  },
  { key: 'acessorio', label: 'Acessórios',    emoji: '⌚', categories: ['acessorio', 'relogio', 'cinto', 'bone'], multi: true,  optional: true  },
  { key: 'perfume',   label: 'Perfume',       emoji: '🧴', categories: ['perfume'],                               multi: false, optional: true  },
];


// Helper: calcular maxReuses padrão por categoria
export function defaultMaxReuses(category: string): number {
  return CATEGORIES[category]?.defaultMaxReuses ?? 1;
}

// Helper: verificar se categoria pode ser reusada
export function canReuse(category: string): boolean {
  return !NEVER_REUSE_CATEGORIES.includes(category);
}

// Tipos compartilhados entre frontend e backend

import type { Category, Formality, GarmentStatus, Gender, Season, EventType } from './constants';

export interface Garment {
  id: string;
  name: string;
  category: Category | string;
  subcategory: string | null;
  color: string | null;
  colorHex: string | null;
  pattern: string | null;
  fabric: string | null;
  season: Season | string;
  formality: Formality | string;
  gender: Gender | string;
  status: GarmentStatus | string;
  maxReuses: number;
  timesWorn: number;
  reuseCount: number;
  lastWornAt: string | null;
  imageData: string;
  backImage: string | null;
  brand: string | null;
  notes: string | null;
  favorite: boolean;
  careInstructions: string | null;
  usageRestrictions: string | null;
  defects: string | null;
  careTips: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  score: number;
  reason: string;
  garmentIds: string[];
  garments: Array<{
    id: string;
    name: string;
    category: string;
    color: string | null;
    colorHex: string | null;
    imageData: string;
  }>;
  vibe: string;
  weatherNote?: string;
}

export interface SuggestRequest {
  eventType: EventType | string;
  eventTime?: string;
  notes?: string;
  weather?: string;
  avoidRecentDays?: number;
}

export interface AnalyzeResult {
  name: string;
  category: string;
  subcategory: string | null;
  color: string;
  colorHex: string;
  pattern: string;
  fabric: string;
  season: string;
  formality: string;
  gender: string;
  brand: string | null;
  description: string;
  /// defeitos detectados pela IA (texto livre) ou string vazia
  defects: string;
  /// instruções de lavagem sugeridas
  careInstructions: string;
  /// restrições de uso
  usageRestrictions: string;
  /// dicas de salvar/conservar a peça
  careTips: string;
}

/// Resultado da análise de foto de pessoa vestida (lote)
export interface WornOutfitPiece {
  analysis: AnalyzeResult;
  /// recorte sugerido (descrição da região da foto)
  region: string;
}

export interface ShoppingTip {
  id: string;
  title: string;
  category: string;
  priority: 'baixa' | 'media' | 'alta';
  reason: string | null;
  kind: 'roupa' | 'acessorio' | 'perfume';
  resolved: boolean;
  createdAt: string;
}

export interface Stats {
  total: number;
  disponivel: number;
  suja: number;
  reusavel: number;
  lavando: number;
  byCategory: Array<{ category: string; count: number }>;
  byFormality: Array<{ formality: string; count: number }>;
  mostWorn: Array<{ name: string; timesWorn: number; category: string }>;
  leastWorn: Array<{ name: string; timesWorn: number; category: string; lastWornAt: string | null }>;
  missingEssentials: string[];
  rotationScore: number;
  laundryAlert: boolean;
}

/// Conjunto reservado para evento futuro
export interface ReservedSet {
  id: string;
  name: string;
  eventType: string;
  eventDate: string;
  eventTime: string | null;
  conditions: string | null;
  garmentIds: string[];
  reason: string | null;
  status: 'reservado' | 'usado' | 'cancelado';
  createdAt: string;
}

/// Plano de viagem
export interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  weather: string | null;
  transport: string | null;
  context: string | null;
  duration: number | null;
  garmentIds: string[];
  reason: string | null;
  notes: string | null;
  status: 'planejada' | 'em-viagem' | 'concluida';
  createdAt: string;
}

/// Foto de modelo para visualização
export interface ModelPhoto {
  id: string;
  label: string | null;
  imageData: string;
  createdAt: string;
}

/// Pedido de sugestão de viagem
export interface TravelSuggestRequest {
  destination: string;
  startDate: string;
  endDate: string;
  weather?: string;
  transport?: string;
  context?: string;
  notes?: string;
}

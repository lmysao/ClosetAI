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
  brand: string | null;
  notes: string | null;
  favorite: boolean;
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

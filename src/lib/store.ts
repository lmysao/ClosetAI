'use client';

// Store Zustand para estado de UI (aba ativa, filtros, modal de detalhe)
import { create } from 'zustand';

export type Section = 'dashboard' | 'wardrobe' | 'outfits' | 'laundry' | 'shopping' | 'stats';

interface UIState {
  section: Section;
  setSection: (s: Section) => void;
  // filtro global do guarda-roupa
  filterCategory: string;
  filterStatus: string;
  setFilterCategory: (c: string) => void;
  setFilterStatus: (s: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  section: 'dashboard',
  setSection: (section) => set({ section }),
  filterCategory: 'all',
  filterStatus: 'all',
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
}));

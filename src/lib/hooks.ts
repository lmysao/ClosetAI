'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Garment, SuggestRequest, OutfitSuggestion } from '@/lib/types';

// ----- Garments -----
export function useGarments(params: { category?: string; status?: string; gender?: string; formality?: string; search?: string } = {}) {
  const sp = new URLSearchParams();
  if (params.category && params.category !== 'all') sp.set('category', params.category);
  if (params.status && params.status !== 'all') sp.set('status', params.status);
  if (params.gender && params.gender !== 'all') sp.set('gender', params.gender);
  if (params.formality && params.formality !== 'all') sp.set('formality', params.formality);
  if (params.search) sp.set('search', params.search);
  const qs = sp.toString();
  return useQuery<{ garments: Garment[] }>({
    queryKey: ['garments', qs],
    queryFn: () => fetch(`/api/garments${qs ? `?${qs}` : ''}`).then((r) => r.json()),
  });
}

export function useAllGarments() {
  return useGarments();
}

export function useCreateGarment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Garment> & { imageData: string; category: string }) => {
      const r = await fetch('/api/garments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Erro ao salvar peça');
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['laundry'] });
    },
  });
}

export function useUpdateGarment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Garment> }) => {
      const r = await fetch(`/api/garments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('Erro ao atualizar peça');
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['laundry'] });
    },
  });
}

export function useDeleteGarment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/garments/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Erro ao remover peça');
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['laundry'] });
      toast.success('Peça removida do guarda-roupa');
    },
  });
}

export function useAnalyzeGarment() {
  return useMutation({
    mutationFn: async (imageData: string) => {
      const r = await fetch('/api/garments/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Erro na análise');
      }
      return r.json() as Promise<{ analysis: import('@/lib/types').AnalyzeResult }>;
    },
  });
}

export function useSeedGarments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (force = false) => {
      const r = await fetch('/api/garments/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Erro ao criar peças demo');
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['laundry'] });
    },
  });
}

// ----- Outfits -----
export function useSuggestOutfits() {
  return useMutation({
    mutationFn: async (req: SuggestRequest) => {
      const r = await fetch('/api/outfits/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Erro ao gerar combinações');
      return data as { suggestions: OutfitSuggestion[] };
    },
  });
}

export function useUseOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { garmentIds: string[]; saveAsUniform?: boolean; uniformName?: string; eventType?: string }) => {
      const r = await fetch('/api/outfits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Erro ao marcar uso');
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['laundry'] });
    },
  });
}

// ----- Laundry -----
export function useLaundry() {
  return useQuery({
    queryKey: ['laundry'],
    queryFn: () => fetch('/api/laundry').then((r) => r.json()),
  });
}

export function useWashGarments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { garmentIds: string[]; action?: 'wash' | 'start-washing' }) => {
      const r = await fetch('/api/laundry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('Erro ao atualizar lavanderia');
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments'] });
      qc.invalidateQueries({ queryKey: ['laundry'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ----- Shopping -----
export function useShoppingTips() {
  return useQuery({
    queryKey: ['shopping'],
    queryFn: () => fetch('/api/shopping').then((r) => r.json()),
  });
}

export function useGenerateShopping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/shopping', { method: 'POST' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Erro ao gerar dicas');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopping'] });
    },
  });
}

export function useResolveTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const r = await fetch(`/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved }),
      });
      if (!r.ok) throw new Error('Erro');
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  });
}

export function useDeleteTip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Erro');
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  });
}

// ----- Stats -----
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then((r) => r.json()),
    refetchInterval: 60 * 1000,
  });
}

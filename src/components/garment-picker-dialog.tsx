'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAllGarments } from '@/lib/hooks';
import { CATEGORIES, NEVER_REUSE_CATEGORIES } from '@/lib/constants';
import type { Garment } from '@/lib/types';
import { useState, useMemo } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Picker de peças por camada.
 * - single: seleciona uma peça (slots não-multi) — clicar substitui
 * - multi: pode adicionar várias (acessórios)
 * - excludeIds: peças já selecionadas em outros slots (não mostrar duplicadas)
 */
export function GarmentPickerDialog({
  open,
  onOpenChange,
  slotLabel,
  slotEmoji,
  categories,
  multi = false,
  excludeIds = [],
  alreadySelectedIds = [],
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slotLabel: string;
  slotEmoji: string;
  categories: string[];
  multi?: boolean;
  excludeIds?: string[];
  alreadySelectedIds?: string[];
  onPick: (garment: Garment) => void;
}) {
  const { data, isLoading } = useAllGarments();
  const [search, setSearch] = useState('');

  const all = data?.garments ?? [];

  // Filtrar: categoria na lista + status disponível/reusável + não está em excludeIds
  // Para íntimas: só disponível (nunca reusável)
  const candidates = useMemo(() => {
    const excluded = new Set([...excludeIds, ...alreadySelectedIds]);
    return all.filter((g) => {
      if (!categories.includes(g.category)) return false;
      if (excluded.has(g.id)) return false;
      // Status: disponível ou reusável
      if (g.status !== 'disponivel' && g.status !== 'reusavel') return false;
      // Íntimas: só disponível
      if (NEVER_REUSE_CATEGORIES.includes(g.category) && g.status !== 'disponivel') return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          (g.color ?? '').toLowerCase().includes(q) ||
          (g.brand ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [all, categories, excludeIds, alreadySelectedIds, search]);

  // Agrupar por categoria para visualização
  const grouped = useMemo(() => {
    const map = new Map<string, Garment[]>();
    for (const g of candidates) {
      if (!map.has(g.category)) map.set(g.category, []);
      map.get(g.category)!.push(g);
    }
    return Array.from(map.entries());
  }, [candidates]);

  const handlePick = (g: Garment) => {
    onPick(g);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{slotEmoji}</span>
            Escolher {slotLabel.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            {multi
              ? 'Toque para adicionar. Você pode combinar vários acessórios.'
              : 'Selecione uma peça para esta camada do look.'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cor ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-medium">Nenhuma peça disponível</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Não há peças dessa camada disponíveis no momento.
                {categories.some((c) => NEVER_REUSE_CATEGORIES.includes(c)) && ' Íntimas precisam estar limpas.'}
                {' '}Tente lavar ou adicionar novas peças.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {grouped.map(([catKey, items]) => {
                const cat = CATEGORIES[catKey];
                return (
                  <div key={catKey}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 sticky top-0 bg-background/95 backdrop-blur py-1">
                      {cat?.emoji} {cat?.label ?? catKey} <span className="text-muted-foreground/60">({items.length})</span>
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {items.map((g) => {
                        const isAlready = alreadySelectedIds.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handlePick(g)}
                            className="group relative text-left rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-sm transition-all"
                          >
                            <div className="aspect-square bg-muted">
                              <img src={g.imageData} alt={g.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="p-1.5">
                              <p className="text-[11px] font-medium leading-tight line-clamp-1">{g.name}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {g.color && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                    <span
                                      className="inline-block w-2 h-2 rounded-full border border-black/10"
                                      style={g.colorHex?.startsWith('#') && g.colorHex !== '#multicolor' ? { backgroundColor: g.colorHex } : undefined}
                                    />
                                    {g.color}
                                  </span>
                                )}
                                {g.status === 'reusavel' && (
                                  <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-500/90 text-white border-0">🔄 {g.reuseCount}/{g.maxReuses}</Badge>
                                )}
                              </div>
                            </div>
                            {isAlready && (
                              <div className="absolute top-1 right-1 rounded-full bg-primary text-primary-foreground p-0.5 shadow">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1.5" /> Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

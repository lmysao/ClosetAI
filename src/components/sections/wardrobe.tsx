'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGarments, useSeedGarments } from '@/lib/hooks';
import { CATEGORIES, CATEGORY_GROUPS, STATUS_LABELS } from '@/lib/constants';
import { GarmentCard } from '@/components/garment-card';
import { GarmentDetailSheet } from '@/components/garment-detail-sheet';
import { AddGarmentDialog } from '@/components/add-garment-dialog';
import type { Garment } from '@/lib/types';
import { Plus, Search, Sparkles, Shirt, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function Wardrobe() {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [gender, setGender] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Garment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<string | undefined>(undefined);

  const { data, isLoading } = useGarments({ category, status, gender, search });
  const garments = data?.garments ?? [];
  const seedMut = useSeedGarments();

  const grouped = useMemo(() => {
    const map = new Map<string, Garment[]>();
    for (const g of garments) {
      const cat = CATEGORIES[g.category];
      const group = cat?.group ?? 'acessorio';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(g);
    }
    return map;
  }, [garments]);

  const openDetail = (g: Garment) => {
    setSelected(g);
    setDetailOpen(true);
  };

  const openAdd = (cat?: string) => {
    setAddCategory(cat);
    setAddOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header + ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary" /> Guarda-Roupa
          </h2>
          <p className="text-sm text-muted-foreground">
            {garments.length} {garments.length === 1 ? 'peça' : 'peças'}
            {garments.length === 0 && ' · adicione suas roupas para começar'}
          </p>
        </div>
        <div className="flex gap-2">
          {garments.length === 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => seedMut.mutate(false, {
                onSuccess: (d) => toast.success(d.message || 'Peças demo criadas!'),
                onError: (e) => toast.error(e.message),
              })}
              disabled={seedMut.isPending}
            >
              {seedMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
              Peças demo
            </Button>
          )}
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar peça..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40 h-9"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">Todas categorias</SelectItem>
                {Object.entries(CATEGORY_GROUPS).map(([gkey, gval]) => (
                  <div key={gkey}>
                    <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{gval.emoji} {gval.label}</p>
                    {Object.entries(CATEGORIES)
                      .filter(([, c]) => c.group === gkey)
                      .map(([key, c]) => (
                        <SelectItem key={key} value={key}>{c.emoji} {c.label}</SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-full sm:w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos gêneros</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="unissex">Unissex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : garments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Shirt className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium">Nenhuma peça encontrada</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {search || category !== 'all' || status !== 'all'
                ? 'Tente ajustar os filtros.'
                : 'Adicione sua primeira peça tirando uma foto.'}
            </p>
            <Button onClick={() => openAdd()}>
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar peça
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Agrupado por categoria */}
          {grouped.size > 0 && (Object.keys(CATEGORY_GROUPS) as Array<keyof typeof CATEGORY_GROUPS>).map((gkey) => {
            const items = grouped.get(gkey);
            if (!items || items.length === 0) return null;
            const groupMeta = CATEGORY_GROUPS[gkey];
            return (
              <div key={gkey}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                    <span>{groupMeta.emoji}</span> {groupMeta.label}
                    <Badge variant="secondary" className="ml-1 text-[10px]">{items.length}</Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {items.map((g) => (
                    <GarmentCard key={g.id} garment={g} onClick={() => openDetail(g)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GarmentDetailSheet
        garment={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <AddGarmentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultCategory={addCategory}
      />
    </div>
  );
}

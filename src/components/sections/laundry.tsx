'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLaundry, useWashGarments } from '@/lib/hooks';
import { CATEGORIES, NEVER_REUSE_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Droplets, RefreshCw, Check, Loader2, Trash2, ShowerHead, Package, RotateCw, AlertTriangle,
} from 'lucide-react';
import type { Garment } from '@/lib/types';

export function Laundry() {
  const { data, isLoading } = useLaundry();
  const washMut = useWashGarments();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const suja = data?.suja ?? [];
  const reusavel = data?.reusavel ?? [];
  const lavando = data?.lavando ?? [];
  const recent = data?.recentWashes ?? [];

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAllSuja = () => {
    if (selected.size === suja.length && suja.every((g) => selected.has(g.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(suja.map((g) => g.id)));
    }
  };

  const washSelected = () => {
    if (selected.size === 0) {
      toast.error('Selecione peças para marcar como lavadas');
      return;
    }
    const ids = Array.from(selected);
    washMut.mutate(
      { garmentIds: ids },
      {
        onSuccess: () => {
          toast.success(`${ids.length} ${ids.length === 1 ? 'peça lavada' : 'peças lavadas'}! Voltaram pro estoque. ✅`);
          setSelected(new Set());
        },
      }
    );
  };

  const washAllSuja = () => {
    if (suja.length === 0) return;
    washMut.mutate(
      { garmentIds: suja.map((g) => g.id) },
      {
        onSuccess: () => toast.success(`Todas as ${suja.length} peças sujas foram lavadas! 🧺✨`),
      }
    );
  };

  const startWashing = (id: string) => {
    washMut.mutate(
      { garmentIds: [id], action: 'start-washing' },
      { onSuccess: () => toast.success('Peça marcada como "lavando" 🫧') }
    );
  };

  const washSingle = (id: string) => {
    washMut.mutate(
      { garmentIds: [id] },
      { onSuccess: () => toast.success('Peça lavada! Disponível novamente ✅') }
    );
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShowerHead className="h-5 w-5 text-primary" /> Lavanderia
          </h2>
          <p className="text-sm text-muted-foreground">Gerencie cesto de sujas, reusáveis e lavagem</p>
        </div>
        {suja.length > 0 && (
          <Button variant="secondary" size="sm" onClick={washAllSuja} disabled={washMut.isPending}>
            <Droplets className="h-4 w-4 mr-1.5" />
            Lavar tudo ({suja.length})
          </Button>
        )}
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{suja.length}</p>
            <p className="text-xs text-muted-foreground">🧺 No cesto</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{reusavel.length}</p>
            <p className="text-xs text-muted-foreground">🔄 Reusáveis</p>
          </CardContent>
        </Card>
        <Card className="border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 dark:border-sky-900">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{lavando.length}</p>
            <p className="text-xs text-muted-foreground">🫧 Lavando</p>
          </CardContent>
        </Card>
      </div>

      {/* Cesto de sujas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">🧺</span> Cesto de roupas sujas
              </CardTitle>
              <CardDescription className="mt-0.5">
                {suja.length === 0 ? 'Tudo limpo!' : `${suja.length} ${suja.length === 1 ? 'peça' : 'peças'} aguardando lavagem`}
              </CardDescription>
            </div>
            {suja.length > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAllSuja}>
                {selected.size === suja.length && suja.length > 0 ? 'Desmarcar' : 'Selecionar todas'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : suja.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-sm text-muted-foreground">Cesto vazio. Que organização!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-3 max-h-96 overflow-y-auto custom-scroll pr-1">
                {suja.map((g) => (
                  <LaundryItem
                    key={g.id}
                    garment={g}
                    selected={selected.has(g.id)}
                    onToggle={() => toggleSelect(g.id)}
                    actionLabel="Lavar"
                    onAction={() => washSingle(g.id)}
                    secondaryLabel="Lavando"
                    onSecondary={() => startWashing(g.id)}
                  />
                ))}
              </div>
              {selected.size > 0 && (
                <Button onClick={washSelected} disabled={washMut.isPending} className="w-full">
                  {washMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Droplets className="h-4 w-4 mr-1.5" />}
                  Marcar {selected.size} {selected.size === 1 ? 'peça como lavada' : 'peças como lavadas'}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reusáveis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">🔄</span> Usadas — pode usar de novo
          </CardTitle>
          <CardDescription className="mt-0.5">
            {reusavel.length === 0
              ? 'Nenhuma peça reusável no momento.'
              : `${reusavel.length} ${reusavel.length === 1 ? 'peça que ainda pode' : 'peças que ainda podem'} ser usadas antes de ir pro cesto`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reusavel.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Camisas, bermudas e calças que você usou aparecerão aqui enquanto ainda podem ser reusadas.
              <br />
              <span className="text-xs">Cuecas, calcinhas e meias vão direto pro cesto.</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-80 overflow-y-auto custom-scroll pr-1">
              {reusavel.map((g) => (
                <LaundryItem
                  key={g.id}
                  garment={g}
                  showReuseCount
                  actionLabel="Lavar"
                  onAction={() => washSingle(g.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lavando */}
      {lavando.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">🫧</span> Na máquina
            </CardTitle>
            <CardDescription>Marque como prontas quando secarem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {lavando.map((g) => (
                <LaundryItem
                  key={g.id}
                  garment={g}
                  actionLabel="Secou!"
                  onAction={() => washSingle(g.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de íntimas */}
      {suja.filter((g) => NEVER_REUSE_CATEGORIES.includes(g.category)).length >= 3 && (
        <Card className="border-amber-300 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">Íntimas acabando!</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                Você tem {suja.filter((g) => NEVER_REUSE_CATEGORIES.includes(g.category)).length} peças íntimas no cesto.
                Considere lavar urgente ou comprar mais — é bom ter estoque.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      {recent.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" /> Histórico de lavagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
              {recent.map((w) => {
                const ids = JSON.parse(w.garmentIds) as string[];
                return (
                  <div key={w.id} className="flex items-center gap-2 text-sm py-1.5 border-b last:border-0">
                    <Droplets className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span className="flex-1">
                      Lavou {ids.length} {ids.length === 1 ? 'peça' : 'peças'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(w.washedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LaundryItem({
  garment,
  selected,
  onToggle,
  showReuseCount,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: {
  garment: Garment;
  selected?: boolean;
  onToggle?: () => void;
  showReuseCount?: boolean;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const cat = CATEGORIES[garment.category];
  return (
    <div className={`group relative rounded-lg overflow-hidden border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}>
      <div className="aspect-square bg-muted relative" onClick={onToggle}>
        <img src={garment.imageData} alt={garment.name} className="w-full h-full object-cover" />
        {selected && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <div className="rounded-full bg-primary text-primary-foreground p-1.5">
              <Check className="h-4 w-4" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
          <p className="text-[9px] text-white font-medium leading-tight line-clamp-1">
            {cat?.emoji} {garment.name}
          </p>
        </div>
        {showReuseCount && (
          <div className="absolute top-1 right-1">
            <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500/90 text-white border-0">
              {garment.reuseCount}/{garment.maxReuses}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex gap-1 p-1">
        <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={onAction}>
          <Droplets className="h-3 w-3" /> {actionLabel}
        </Button>
        {onSecondary && (
          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

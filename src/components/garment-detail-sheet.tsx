'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES, STATUS_LABELS, FORMALITIES, SEASONS, defaultMaxReuses } from '@/lib/constants';
import type { Garment } from '@/lib/types';
import { useDeleteGarment, useUpdateGarment, useWashGarments } from '@/lib/hooks';
import { toast } from 'sonner';
import {
  Trash2, Heart, Droplets, RefreshCw, Shirt, Calendar, Tag, Palette, Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function GarmentDetailSheet({
  garment,
  open,
  onOpenChange,
}: {
  garment: Garment | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const updateMut = useUpdateGarment();
  const deleteMut = useDeleteGarment();
  const washMut = useWashGarments();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!garment) return null;

  const cat = CATEGORIES[garment.category];
  const status = STATUS_LABELS[garment.status as keyof typeof STATUS_LABELS] ?? STATUS_LABELS.disponivel;
  const formality = FORMALITIES[garment.formality as keyof typeof FORMALITIES];
  const season = SEASONS[garment.season as keyof typeof SEASONS] ?? SEASONS.todas;

  const toggleFavorite = () => {
    updateMut.mutate({ id: garment.id, data: { favorite: !garment.favorite } });
    toast.success(garment.favorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  const moveToDirty = () => {
    updateMut.mutate({
      id: garment.id,
      data: { status: 'suja', reuseCount: 0 },
    });
    toast.success('Movida para o cesto de roupas sujas');
  };

  const markWashed = () => {
    washMut.mutate(
      { garmentIds: [garment.id] },
      {
        onSuccess: () => toast.success('Marcada como lavada — disponível novamente!'),
      }
    );
  };

  const handleDelete = () => {
    deleteMut.mutate(garment.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto custom-scroll">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-left">
              <span className="text-2xl">{cat?.emoji ?? '👕'}</span>
              <span className="flex-1">{garment.name}</span>
            </SheetTitle>
            <SheetDescription className="text-left">
              {cat?.label} {garment.subcategory ? `· ${garment.subcategory}` : ''}
              {garment.brand ? ` · ${garment.brand}` : ''}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
              <img src={garment.imageData} alt={garment.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold shadow">
                  {status.emoji} {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats de uso */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{garment.timesWorn}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Usos</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {garment.status === 'reusavel' ? `${garment.reuseCount}/${garment.maxReuses}` : `${garment.maxReuses}`}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Reuso máx.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {garment.lastWornAt
                  ? new Date(garment.lastWornAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Último uso</p>
            </div>
          </div>

          {/* Atributos */}
          <div className="mt-4 space-y-2.5">
            <AttrRow icon={<Palette className="h-4 w-4" />} label="Cor">
              <Badge variant="outline" className="font-normal">
                <span
                  className="inline-block w-3 h-3 rounded-full mr-1.5 border border-black/10"
                  style={garment.colorHex?.startsWith('#') && garment.colorHex !== '#multicolor' ? { backgroundColor: garment.colorHex } : undefined}
                />
                {garment.color ?? '—'}
              </Badge>
            </AttrRow>
            <AttrRow icon={<Sparkles className="h-4 w-4" />} label="Formalidade">
              <Badge variant="secondary" className="font-normal">{formality?.emoji} {formality?.label ?? '—'}</Badge>
            </AttrRow>
            <AttrRow icon={<Shirt className="h-4 w-4" />} label="Tecido">
              <span className="text-sm">{garment.fabric ?? '—'}</span>
            </AttrRow>
            <AttrRow icon={<Tag className="h-4 w-4" />} label="Padrão">
              <span className="text-sm capitalize">{garment.pattern ?? '—'}</span>
            </AttrRow>
            <AttrRow icon={<Calendar className="h-4 w-4" />} label="Estação">
              <span className="text-sm">{season.emoji} {season.label}</span>
            </AttrRow>
          </div>

          {garment.notes && (
            <div className="mt-4">
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground italic">"{garment.notes}"</p>
            </div>
          )}

          <SheetFooter className="mt-6 flex-col gap-2 sm:flex-col">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={toggleFavorite} disabled={updateMut.isPending}>
                <Heart className={`h-4 w-4 mr-1.5 ${garment.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                {garment.favorite ? 'Favorita' : 'Favoritar'}
              </Button>
              {garment.status === 'disponivel' && (
                <Button variant="outline" size="sm" onClick={moveToDirty} disabled={updateMut.isPending}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Mandar pro cesto
                </Button>
              )}
              {(garment.status === 'reusavel' || garment.status === 'suja' || garment.status === 'lavando') && (
                <Button variant="outline" size="sm" onClick={markWashed} disabled={washMut.isPending}>
                  <Droplets className="h-4 w-4 mr-1.5" />
                  Marcar lavada
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remover do guarda-roupa
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover "{garment.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A peça sairá do seu guarda-roupa e do histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AttrRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon} {label}
      </span>
      {children}
    </div>
  );
}

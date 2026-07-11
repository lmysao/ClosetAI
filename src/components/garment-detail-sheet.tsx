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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, STATUS_LABELS, FORMALITIES, SEASONS, defaultMaxReuses } from '@/lib/constants';
import type { Garment } from '@/lib/types';
import { useDeleteGarment, useUpdateGarment, useWashGarments } from '@/lib/hooks';
import { toast } from 'sonner';
import {
  Trash2, Heart, Droplets, RefreshCw, Shirt, Calendar, Tag, Palette, Sparkles,
  Pencil, Save, X, AlertTriangle, RotateCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [editCare, setEditCare] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Resetar flip ao trocar de peça
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlipped(false);
  }, [garment?.id]);

  // Campos editáveis do modo "Editar cuidados"
  const [editDefects, setEditDefects] = useState('');
  const [editCareInstructions, setEditCareInstructions] = useState('');
  const [editUsageRestrictions, setEditUsageRestrictions] = useState('');
  const [editCareTips, setEditCareTips] = useState('');

  if (!garment) return null;

  const cat = CATEGORIES[garment.category];
  const status = STATUS_LABELS[garment.status as keyof typeof STATUS_LABELS] ?? STATUS_LABELS.disponivel;
  const formality = FORMALITIES[garment.formality as keyof typeof FORMALITIES];
  const season = SEASONS[garment.season as keyof typeof SEASONS] ?? SEASONS.todas;

  const hasDefects = (garment.defects ?? '').trim() !== '';
  const hasCare = (garment.careInstructions ?? '').trim() !== '';
  const hasRestrictions = (garment.usageRestrictions ?? '').trim() !== '';
  const hasTips = (garment.careTips ?? '').trim() !== '';
  const hasAnyCare = hasDefects || hasCare || hasRestrictions || hasTips || !!garment.backImage;

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

  const enterEditMode = () => {
    setEditDefects(garment.defects ?? '');
    setEditCareInstructions(garment.careInstructions ?? '');
    setEditUsageRestrictions(garment.usageRestrictions ?? '');
    setEditCareTips(garment.careTips ?? '');
    setEditCare(true);
  };

  const cancelEdit = () => {
    setEditCare(false);
  };

  const saveEdit = () => {
    updateMut.mutate(
      {
        id: garment.id,
        data: {
          defects: editDefects.trim() || null,
          careInstructions: editCareInstructions.trim() || null,
          usageRestrictions: editUsageRestrictions.trim() || null,
          careTips: editCareTips.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Cuidados atualizados');
          setEditCare(false);
        },
        onError: (e) => toast.error('Erro ao salvar: ' + e.message),
      }
    );
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
            <div
              className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted select-none"
              style={{ perspective: '1200px' }}
            >
              {/* Card que vira */}
              <div
                className="relative w-full h-full transition-transform duration-500 ease-out cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
                onClick={() => garment.backImage && setFlipped((f) => !f)}
                title={garment.backImage ? 'Toque para virar a peça' : undefined}
              >
                {/* Frente */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <img src={garment.imageData} alt={garment.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold shadow">
                      {status.emoji} {status.label}
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow">
                    Frente
                  </span>
                  {garment.backImage && (
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-medium shadow animate-pulse">
                      <RotateCw className="h-3 w-3" /> Toque para ver o verso
                    </span>
                  )}
                </div>

                {/* Verso (só renderiza se existir) */}
                {garment.backImage && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <img src={garment.backImage} alt={`${garment.name} — verso`} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow">
                      Verso
                    </span>
                    <Badge variant="secondary" className="absolute bottom-3 left-1/2 -translate-x-1/2 font-normal text-[10px]">
                      📷 toque para voltar à frente
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            {/* Indicador de páginas (dots) quando tem verso */}
            {garment.backImage && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className={`h-1.5 rounded-full transition-all ${!flipped ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40'}`}
                  aria-label="Ver frente"
                />
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className={`h-1.5 rounded-full transition-all ${flipped ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40'}`}
                  aria-label="Ver verso"
                />
              </div>
            )}
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

          {/* Cuidados & defeitos */}
          <div className="mt-4">
            <Separator className="my-3" />
            <div className="flex items-center justify-between mb-2">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Cuidados & defeitos
              </h4>
              {editCare ? (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 px-2 text-xs">
                    <X className="h-3 w-3 mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={saveEdit} disabled={updateMut.isPending} className="h-7 px-2 text-xs">
                    {updateMut.isPending ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                    Salvar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={enterEditMode} className="h-7 px-2 text-xs">
                  <Pencil className="h-3 w-3 mr-1" /> Editar cuidados
                </Button>
              )}
            </div>

            {editCare ? (
              <div className="space-y-2.5 rounded-lg border border-muted-foreground/20 bg-muted/30 p-3">
                <div>
                  <Label htmlFor="edit-defects" className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="h-3 w-3 text-amber-600" /> Defeitos encontrados
                  </Label>
                  <Textarea
                    id="edit-defects"
                    value={editDefects}
                    onChange={(e) => setEditDefects(e.target.value)}
                    placeholder="ex: mancha amarelada perto da gola"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-care" className="text-xs">Instruções de lavagem</Label>
                  <Textarea
                    id="edit-care"
                    value={editCareInstructions}
                    onChange={(e) => setEditCareInstructions(e.target.value)}
                    placeholder="ex: lavar à mão em água fria, não usar alvejante"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-restrict" className="text-xs">Restrições de uso</Label>
                  <Textarea
                    id="edit-restrict"
                    value={editUsageRestrictions}
                    onChange={(e) => setEditUsageRestrictions(e.target.value)}
                    placeholder="ex: não usar em dias de chuva"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tips" className="text-xs">Dicas de conservar</Label>
                  <Textarea
                    id="edit-tips"
                    value={editCareTips}
                    onChange={(e) => setEditCareTips(e.target.value)}
                    placeholder="ex: mancha de gordura sai com detergente"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <CareBox icon="🧺" label="Instruções de lavagem">
                  {hasCare ? (
                    <span className="text-sm">{garment.careInstructions}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Não informado</span>
                  )}
                </CareBox>

                {hasDefects ? (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" /> ⚠️ Defeitos
                    </p>
                    <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">{garment.defects}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <span>✅</span> Defeitos
                    </p>
                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Nenhum defeito ✅</p>
                  </div>
                )}

                <CareBox icon="🚫" label="Restrições de uso">
                  {hasRestrictions ? (
                    <span className="text-sm">{garment.usageRestrictions}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Nenhuma</span>
                  )}
                </CareBox>

                <CareBox icon="💡" label="Dicas de conservar">
                  {hasTips ? (
                    <span className="text-sm">{garment.careTips}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Nenhuma</span>
                  )}
                </CareBox>

                {!hasAnyCare && (
                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    Toque em "Editar cuidados" pra adicionar instruções de lavagem, defeitos ou dicas.
                  </p>
                )}
              </div>
            )}
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

function CareBox({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-muted-foreground/20 bg-muted/40 px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <span aria-hidden>{icon}</span> {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { GarmentPickerDialog } from '@/components/garment-picker-dialog';
import { VisualizeDialog } from '@/components/visualize-dialog';
import { useAllGarments, useUseOutfit } from '@/lib/hooks';
import { BUILDER_SLOTS, CATEGORIES, STATUS_LABELS } from '@/lib/constants';
import type { Garment, EventType } from '@/lib/types';
import { toast } from 'sonner';
import {
  Plus, X, RefreshCw, Check, Loader2, Shirt, Sparkles, Star, AlertCircle, CheckCircle2, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Builder de looks — usado tanto para montar do zero quanto para editar sugestão da IA.
 * - initialIds: peças pré-selecionadas (edição da IA)
 * - onUsed: callback após marcar como usado
 */
export function OutfitBuilder({
  initialIds = [],
  initialName = '',
  eventType = 'casual',
  title = 'Montar look manual',
  description = 'Escolha peça por peça. Você tem controle total.',
  onUsed,
  onCancel,
}: {
  initialIds?: string[];
  initialName?: string;
  eventType?: EventType | string;
  title?: string;
  description?: string;
  onUsed?: () => void;
  onCancel?: () => void;
}) {
  const { data } = useAllGarments();
  const allGarments = data?.garments ?? [];
  const useMut = useUseOutfit();

  // Estado: mapa de slotKey → Garment | Garment[] | null
  const [slots, setSlots] = useState<Record<string, Garment | Garment[] | null>>(() => {
    const init: Record<string, Garment | Garment[] | null> = {};
    for (const s of BUILDER_SLOTS) {
      init[s.key] = s.multi ? [] : null;
    }
    // Preencher com initialIds
    const byId = new Map(allGarments.map((g) => [g.id, g]));
    for (const id of initialIds) {
      const g = byId.get(id);
      if (!g) continue;
      const slot = BUILDER_SLOTS.find((s) => s.categories.includes(g.category));
      if (!slot) continue;
      if (slot.multi) {
        const arr = (init[slot.key] as Garment[]) ?? [];
        if (!arr.find((x) => x.id === g.id)) arr.push(g);
        init[slot.key] = arr;
      } else {
        init[slot.key] = g;
      }
    }
    return init;
  });

  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [saveUniform, setSaveUniform] = useState(false);
  const [uniformName, setUniformName] = useState(initialName);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [visualizeOpen, setVisualizeOpen] = useState(false);
  const [used, setUsed] = useState(false);

  // Lista de IDs já selecionados (para excluir do picker)
  const selectedIds = useMemo(() => {
    const ids: string[] = [];
    for (const s of BUILDER_SLOTS) {
      const v = slots[s.key];
      if (Array.isArray(v)) v.forEach((g) => ids.push(g.id));
      else if (v) ids.push(v.id);
    }
    return ids;
  }, [slots]);

  // Validação: todos os slots obrigatórios preenchidos?
  const missingRequired = BUILDER_SLOTS.filter((s) => {
    if (s.optional) return false;
    const v = slots[s.key];
    return Array.isArray(v) ? v.length === 0 : !v;
  });

  const totalSelected = selectedIds.length;

  const handlePick = (g: Garment) => {
    const slot = BUILDER_SLOTS.find((s) => s.categories.includes(g.category));
    if (!slot) return;
    setSlots((prev) => {
      const next = { ...prev };
      if (slot.multi) {
        const arr = (prev[slot.key] as Garment[]) ?? [];
        if (!arr.find((x) => x.id === g.id)) {
          next[slot.key] = [...arr, g];
        }
      } else {
        next[slot.key] = g;
      }
      return next;
    });
    setPickerSlot(null);
  };

  const handleRemove = (slotKey: string, id?: string) => {
    setSlots((prev) => {
      const next = { ...prev };
      const slot = BUILDER_SLOTS.find((s) => s.key === slotKey)!;
      if (slot.multi) {
        const arr = (prev[slotKey] as Garment[]) ?? [];
        next[slotKey] = arr.filter((g) => g.id !== id);
      } else {
        next[slotKey] = null;
      }
      return next;
    });
  };

  const handleUse = () => {
    if (missingRequired.length > 0) {
      toast.error(`Preencha: ${missingRequired.map((s) => s.label).join(', ')}`);
      return;
    }
    useMut.mutate(
      {
        garmentIds: selectedIds,
        saveAsUniform: saveUniform,
        uniformName: uniformName || `Look personalizado`,
        eventType,
      },
      {
        onSuccess: () => {
          setUsed(true);
          setConfirmOpen(false);
          toast.success(
            saveUniform
              ? `Look "${uniformName || 'personalizado'}" salvo como uniforme e marcado como usado! ✅`
              : 'Look personalizado marcado como usado! Peças atualizadas. ✅'
          );
          onUsed?.();
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const currentPickerSlot = pickerSlot ? BUILDER_SLOTS.find((s) => s.key === pickerSlot) : null;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shirt className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slots */}
        <div className="space-y-2.5">
          {BUILDER_SLOTS.map((slot) => {
            const v = slots[slot.key];
            const items: Garment[] = Array.isArray(v) ? v : v ? [v] : [];
            const filled = items.length > 0;
            const isMissing = missingRequired.some((s) => s.key === slot.key);

            return (
              <div
                key={slot.key}
                className={cn(
                  'rounded-lg border p-2.5 transition-colors',
                  isMissing ? 'border-rose-300 bg-rose-50/40 dark:bg-rose-950/10' : filled ? 'border-primary/30 bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-base">{slot.emoji}</span>
                    {slot.label}
                    {!slot.optional && <span className="text-rose-500">*</span>}
                    {slot.optional && <span className="text-[10px] text-muted-foreground font-normal">(opcional)</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setPickerSlot(slot.key)}
                  >
                    <Plus className="h-3 w-3 mr-0.5" />
                    {filled ? (slot.multi ? 'Adicionar' : 'Trocar') : 'Escolher'}
                  </Button>
                </div>

                {!filled ? (
                  <button
                    type="button"
                    onClick={() => setPickerSlot(slot.key)}
                    className="w-full text-left text-xs text-muted-foreground/70 italic py-2 hover:text-muted-foreground transition-colors"
                  >
                    {isMissing ? `Obrigatório — toque para escolher` : `Vazio — toque para adicionar`}
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((g) => (
                      <div
                        key={g.id}
                        className="group relative flex items-center gap-2 rounded-lg bg-background border pr-2 pl-1 py-1 max-w-full"
                      >
                        <div className="w-9 h-9 rounded-md overflow-hidden bg-muted shrink-0">
                          <img src={g.imageData} alt={g.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-tight line-clamp-1">{g.name}</p>
                          <div className="flex items-center gap-1">
                            {g.color && (
                              <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full border border-black/10"
                                  style={g.colorHex?.startsWith('#') && g.colorHex !== '#multicolor' ? { backgroundColor: g.colorHex } : undefined}
                                />
                                {g.color}
                              </span>
                            )}
                            {g.status === 'reusavel' && (
                              <Badge className="text-[8px] px-1 py-0 h-3 bg-amber-500/90 text-white border-0">🔄 {g.reuseCount}/{g.maxReuses}</Badge>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(slot.key, g.id)}
                          className="rounded-full bg-rose-500/90 hover:bg-rose-600 text-white p-0.5 shadow-sm transition-colors"
                          title="Remover"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Uniforme */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Switch checked={saveUniform} onCheckedChange={setSaveUniform} id="uniform-b" />
          <div className="flex-1">
            <Label htmlFor="uniform-b" className="cursor-pointer flex items-center gap-1.5 font-medium text-sm">
              <Star className="h-3.5 w-3.5" /> Salvar como uniforme
            </Label>
            <p className="text-xs text-muted-foreground">Salva este look personalizado para reusar depois</p>
          </div>
        </div>
        {saveUniform && (
          <div>
            <Label htmlFor="uname-b" className="mb-1.5 block text-sm">Nome do uniforme</Label>
            <Input id="uname-b" value={uniformName} onChange={(e) => setUniformName(e.target.value)} placeholder="Ex: Look academia terça" />
          </div>
        )}

        {/* Avisos e ações */}
        {missingRequired.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-lg p-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Faltam peças obrigatórias: {missingRequired.map((s) => s.label).join(', ')}</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setVisualizeOpen(true)}
            disabled={totalSelected === 0}
            title="Visualizar este look (gera prompt + baixa ZIP para Nano Banana)"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Visualizar
          </Button>
          {used ? (
            <Button variant="secondary" className="flex-1" disabled>
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Look usado!
            </Button>
          ) : (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={missingRequired.length > 0 || useMut.isPending}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Usar este look ({totalSelected} {totalSelected === 1 ? 'peça' : 'peças'})
            </Button>
          )}
        </div>
      </CardContent>

      {/* Picker — sempre montado, controlado via open para evitar perda de state update */}
      <GarmentPickerDialog
        open={!!pickerSlot}
        onOpenChange={(v) => { if (!v) setPickerSlot(null); }}
        slotLabel={currentPickerSlot?.label ?? ''}
        slotEmoji={currentPickerSlot?.emoji ?? '👕'}
        categories={currentPickerSlot?.categories ?? []}
        multi={currentPickerSlot?.multi ?? false}
        excludeIds={[]}
        alreadySelectedIds={selectedIds}
        onPick={handlePick}
      />

      {/* Visualização (gera prompt + baixa ZIP) */}
      <VisualizeDialog
        open={visualizeOpen}
        onOpenChange={setVisualizeOpen}
        garmentIds={selectedIds}
      />

      {/* Confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Confirmar uso do look
            </DialogTitle>
            <DialogDescription>
              {totalSelected} {totalSelected === 1 ? 'peça será marcada como usada' : 'peças serão marcadas como usadas'}.
              {' '}Íntimas vão pro cesto de sujas, as outras ficam reusáveis (conforme reuso máximo).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scroll py-2">
            {BUILDER_SLOTS.map((slot) => {
              const v = slots[slot.key];
              const items: Garment[] = Array.isArray(v) ? v : v ? [v] : [];
              if (items.length === 0) return null;
              return items.map((g) => {
                const status = STATUS_LABELS[g.status as keyof typeof STATUS_LABELS] ?? STATUS_LABELS.disponivel;
                return (
                  <div key={g.id} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-md overflow-hidden bg-muted shrink-0">
                      <img src={g.imageData} alt={g.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="flex-1 truncate">{g.name}</span>
                    <span className="text-[10px] text-muted-foreground">{status.emoji} {status.label}</span>
                  </div>
                );
              });
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleUse} disabled={useMut.isPending}>
              {useMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
              Confirmar e usar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

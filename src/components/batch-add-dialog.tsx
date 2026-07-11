'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useAnalyzeGarment,
  useAnalyzeWornOutfit,
  useCreateGarment,
} from '@/lib/hooks';
import { resizeImage } from '@/lib/image-utils';
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  FORMALITIES,
  defaultMaxReuses,
} from '@/lib/constants';
import type { AnalyzeResult, WornOutfitPiece } from '@/lib/types';
import { toast } from 'sonner';
import {
  Upload,
  Loader2,
  X,
  Check,
  Camera,
  Sparkles,
  Layers,
  Shirt,
  AlertTriangle,
} from 'lucide-react';

// ============================================================
// Tab 1: Multi-photo item state
// ============================================================
type MultiItemStatus = 'analyzing' | 'analyzed' | 'error' | 'saving' | 'saved';

interface MultiItem {
  id: string;
  imageData: string;
  status: MultiItemStatus;
  error?: string;
  analysis?: AnalyzeResult;
  // editable fields (filled from analysis, user can edit)
  name: string;
  category: string;
  color: string;
  colorHex: string;
  formality: string;
}

// ============================================================
// Tab 2: Worn outfit piece item state
// ============================================================
type WornPieceStatus = 'pending' | 'saving' | 'saved' | 'error';

interface WornPieceItem {
  id: string;
  region: string;
  analysis: AnalyzeResult;
  name: string;
  selected: boolean;
  status: WornPieceStatus;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function categoryLabel(cat: string): string {
  return CATEGORIES[cat]?.label ?? cat;
}

function formalityLabel(form: string): string {
  const f = (FORMALITIES as Record<string, { label: string }>)[form];
  return f?.label ?? form;
}

// ============================================================
// Root component
// ============================================================
export function BatchAddDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Adicionar várias peças
          </DialogTitle>
          <DialogDescription>
            Adicione múltiplas peças de uma vez. Escolha entre fotos separadas ou uma foto vestida.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="multi" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="multi">
              <Shirt className="h-3.5 w-3.5" /> Múltiplas fotos
            </TabsTrigger>
            <TabsTrigger value="worn">
              <Camera className="h-3.5 w-3.5" /> Foto vestida
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multi" className="flex-1 min-h-0">
            <MultiPhotosTab onDone={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="worn" className="flex-1 min-h-0">
            <WornOutfitTab onDone={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Tab 1: Múltiplas fotos
// ============================================================
function MultiPhotosTab({ onDone }: { onDone: () => void }) {
  const [items, setItems] = useState<MultiItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeMut = useAnalyzeGarment();
  const createMut = useCreateGarment();

  const analyzedCount = items.filter((i) => i.status === 'analyzed').length;
  const totalAnalyzed = items.filter(
    (i) => i.status === 'analyzed' || i.status === 'saved',
  ).length;

  const handleFiles = useCallback(
    async (files: FileList) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setBusy(true);
      const newItems: MultiItem[] = [];
      for (const file of list) {
        try {
          const resized = await resizeImage(file, 800, 0.82);
          newItems.push({
            id: newId(),
            imageData: resized,
            status: 'analyzing',
            name: '',
            category: 'camiseta',
            color: '',
            colorHex: '#888888',
            formality: 'casual',
          });
        } catch (e) {
          toast.error(
            'Erro ao processar imagem: ' + (e instanceof Error ? e.message : 'falha'),
          );
        }
      }
      if (newItems.length === 0) {
        setBusy(false);
        return;
      }
      setItems((prev) => [...prev, ...newItems]);

      // Analisar em paralelo com allSettled (cada item na mesma ordem de newItems)
      const results = await Promise.allSettled(
        newItems.map((item) =>
          analyzeMut.mutateAsync({ imageData: item.imageData }).then((r) => r.analysis),
        ),
      );

      const updated = newItems.map((item, idx) => {
        const res = results[idx];
        if (res && res.status === 'fulfilled') {
          const a = res.value;
          return {
            ...item,
            status: 'analyzed' as const,
            analysis: a,
            name: a.name,
            category: a.category,
            color: a.color,
            colorHex: a.colorHex,
            formality: a.formality,
          };
        }
        const reason = res && res.status === 'rejected' ? res.reason : null;
        return {
          ...item,
          status: 'error' as const,
          error: reason instanceof Error ? reason.message : 'erro na análise',
        };
      });

      setItems((prev) =>
        prev.map((it) => {
          const u = updated.find((x) => x.id === it.id);
          return u ?? it;
        }),
      );
      setBusy(false);
    },
    [analyzeMut],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const updateItem = (id: string, patch: Partial<MultiItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const buildPayload = (item: MultiItem) => {
    const a = item.analysis;
    return {
      name: item.name.trim() || (a?.name ?? 'Sem nome'),
      category: item.category,
      subcategory: a?.subcategory ?? null,
      color: item.color || null,
      colorHex: item.colorHex || null,
      pattern: a?.pattern ?? null,
      fabric: a?.fabric ?? null,
      season: a?.season ?? 'todas',
      formality: item.formality,
      gender: a?.gender ?? 'masculino',
      brand: a?.brand ?? null,
      notes: null,
      imageData: item.imageData,
      backImage: null,
      defects: (a?.defects ?? '').trim() || null,
      careInstructions: (a?.careInstructions ?? '').trim() || null,
      usageRestrictions: (a?.usageRestrictions ?? '').trim() || null,
      careTips: (a?.careTips ?? '').trim() || null,
    };
  };

  const saveOne = async (item: MultiItem) => {
    if (!item.analysis) return;
    updateItem(item.id, { status: 'saving' });
    try {
      await createMut.mutateAsync(buildPayload(item));
      updateItem(item.id, { status: 'saved' });
      toast.success(`"${item.name}" salva!`);
    } catch (e) {
      updateItem(item.id, {
        status: 'error',
        error: e instanceof Error ? e.message : 'erro ao salvar',
      });
      toast.error('Erro ao salvar: ' + (e instanceof Error ? e.message : ''));
    }
  };

  const saveAll = async () => {
    const pending = items.filter((i) => i.status === 'analyzed');
    if (pending.length === 0) {
      toast.error('Nenhuma peça analisada para salvar');
      return;
    }
    setSaveProgress({ done: 0, total: pending.length });
    let done = 0;
    let ok = 0;
    for (const item of pending) {
      updateItem(item.id, { status: 'saving' });
      try {
        await createMut.mutateAsync(buildPayload(item));
        updateItem(item.id, { status: 'saved' });
        ok++;
      } catch (e) {
        updateItem(item.id, {
          status: 'error',
          error: e instanceof Error ? e.message : 'erro ao salvar',
        });
      }
      done++;
      setSaveProgress({ done, total: pending.length });
    }
    setSaveProgress(null);
    if (ok > 0) {
      toast.success(`${ok} peça${ok > 1 ? 's' : ''} adicionada${ok > 1 ? 's' : ''}! 🎉`);
    }
    if (ok === pending.length) {
      setItems([]);
      onDone();
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-2 min-h-0">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 mr-1.5" />
          )}
          Selecionar fotos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {items.length} foto{items.length > 1 ? 's' : ''} · {analyzedCount} analisada
            {analyzedCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center">
          <Shirt className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Selecione várias fotos de peças. A IA vai analisar cada uma em paralelo.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Você pode revisar e editar nome, categoria, cor e formalidade antes de salvar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto custom-scroll pr-1">
          {items.map((item) => (
            <MultiItemCard
              key={item.id}
              item={item}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
              onSave={() => saveOne(item)}
            />
          ))}
        </div>
      )}

      {saveProgress && (
        <div className="space-y-1.5">
          <Progress value={(saveProgress.done / saveProgress.total) * 100} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Salvando... {saveProgress.done}/{saveProgress.total}
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t mt-1">
          <span className="text-xs text-muted-foreground">
            {totalAnalyzed}/{items.length} prontas para salvar
          </span>
          <Button
            type="button"
            onClick={saveAll}
            disabled={analyzedCount === 0 || busy || saveProgress !== null || createMut.isPending}
            size="sm"
          >
            {saveProgress !== null || createMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 mr-1.5" />
            )}
            Salvar todas ({analyzedCount})
          </Button>
        </div>
      )}
    </div>
  );
}

function MultiItemCard({
  item,
  onUpdate,
  onRemove,
  onSave,
}: {
  item: MultiItem;
  onUpdate: (patch: Partial<MultiItem>) => void;
  onRemove: () => void;
  onSave: () => void;
}) {
  const hasDefects = !!item.analysis?.defects?.trim();
  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 rounded-full bg-background/90 backdrop-blur p-1.5 shadow hover:bg-background text-rose-600"
        aria-label="Remover"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="relative aspect-square w-full bg-muted">
        <img
          src={item.imageData}
          alt={item.name || 'peça'}
          className="w-full h-full object-cover"
        />
        {item.status === 'analyzing' && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-1.5">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Analisando...
            </p>
          </div>
        )}
        {item.status === 'saved' && (
          <div className="absolute inset-0 bg-emerald-600/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-1">
            <Check className="h-7 w-7" />
            <p className="text-xs font-semibold">Salva!</p>
          </div>
        )}
        {item.status === 'error' && (
          <div className="absolute inset-0 bg-rose-600/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-1 px-2 text-center">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-[11px] font-medium line-clamp-3">{item.error || 'Erro'}</p>
          </div>
        )}
        {hasDefects && item.status === 'analyzed' && (
          <span className="absolute bottom-2 left-2">
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800">
              <AlertTriangle className="h-3 w-3 mr-1" /> com defeito
            </Badge>
          </span>
        )}
      </div>

      <div className="p-2.5 space-y-2">
        {item.status === 'analyzed' ? (
          <>
            <Input
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Nome da peça"
              className="h-8 text-sm"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <Select value={item.category} onValueChange={(v) => onUpdate({ category: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Object.entries(CATEGORY_GROUPS).map(([gkey, gval]) => (
                    <div key={gkey}>
                      <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                        {gval.emoji} {gval.label}
                      </p>
                      {Object.entries(CATEGORIES)
                        .filter(([, c]) => c.group === gkey)
                        .map(([key, c]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            {c.emoji} {c.label}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Select value={item.formality} onValueChange={(v) => onUpdate({ formality: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMALITIES).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">
                      {v.emoji} {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: item.colorHex || '#888888' }}
                aria-hidden
              />
              <span className="text-xs text-muted-foreground flex-1 truncate">
                {item.color || '—'}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 px-2 text-xs"
                onClick={onSave}
                disabled={item.status === 'saving' || item.status === 'saved'}
              >
                {item.status === 'saving' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Salvar
              </Button>
            </div>
          </>
        ) : item.status === 'saved' ? (
          <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <Check className="h-3 w-3" /> {item.name}
          </p>
        ) : item.status === 'error' ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs"
            onClick={onRemove}
          >
            <X className="h-3 w-3 mr-1" /> Remover
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground italic">Aguardando análise...</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: Foto vestida
// ============================================================
function WornOutfitTab({ onDone }: { onDone: () => void }) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pieces, setPieces] = useState<WornPieceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMut = useAnalyzeWornOutfit();
  const createMut = useCreateGarment();

  const handleFile = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const resized = await resizeImage(file, 1000, 0.82);
        setImageData(resized);
        setPieces([]);
        setAnalyzing(true);
        analyzeMut.mutate(resized, {
          onSuccess: (data) => {
            const mapped: WornPieceItem[] = (data.pieces ?? []).map(
              (p: WornOutfitPiece) => ({
                id: newId(),
                region: p.region,
                analysis: p.analysis,
                name: p.analysis.name,
                selected: true,
                status: 'pending' as const,
              }),
            );
            setPieces(mapped);
            if (mapped.length === 0) {
              toast.error('Não consegui identificar peças nesta foto.');
            } else {
              toast.success(`${mapped.length} peças detectadas!`);
            }
          },
          onError: (e) => {
            toast.error('Erro na análise: ' + e.message);
          },
          onSettled: () => setAnalyzing(false),
        });
      } catch (e) {
        toast.error('Erro ao processar imagem: ' + (e instanceof Error ? e.message : ''));
      } finally {
        setBusy(false);
      }
    },
    [analyzeMut],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const updatePiece = (id: string, patch: Partial<WornPieceItem>) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const selectedCount = pieces.filter((p) => p.selected).length;

  const saveSelected = async () => {
    if (!imageData) {
      toast.error('Adicione uma foto primeiro');
      return;
    }
    const selected = pieces.filter((p) => p.selected && p.status !== 'saved');
    if (selected.length === 0) {
      toast.error('Selecione ao menos uma peça');
      return;
    }
    setSaveProgress({ done: 0, total: selected.length });
    let done = 0;
    let ok = 0;
    for (const piece of selected) {
      updatePiece(piece.id, { status: 'saving' });
      try {
        await createMut.mutateAsync({
          name: piece.name.trim() || piece.analysis.name,
          category: piece.analysis.category,
          subcategory: piece.analysis.subcategory ?? null,
          color: piece.analysis.color || null,
          colorHex: piece.analysis.colorHex || null,
          pattern: piece.analysis.pattern ?? null,
          fabric: piece.analysis.fabric ?? null,
          season: piece.analysis.season ?? 'todas',
          formality: piece.analysis.formality,
          gender: piece.analysis.gender ?? 'masculino',
          brand: piece.analysis.brand ?? null,
          notes: `Região detectada: ${piece.region}`,
          imageData,
          backImage: null,
          defects: (piece.analysis.defects ?? '').trim() || null,
          careInstructions: (piece.analysis.careInstructions ?? '').trim() || null,
          usageRestrictions: (piece.analysis.usageRestrictions ?? '').trim() || null,
          careTips: (piece.analysis.careTips ?? '').trim() || null,
        });
        updatePiece(piece.id, { status: 'saved' });
        ok++;
      } catch (e) {
        updatePiece(piece.id, { status: 'error' });
        toast.error(
          'Erro ao salvar "' + piece.name + '": ' + (e instanceof Error ? e.message : ''),
        );
      }
      done++;
      setSaveProgress({ done, total: selected.length });
    }
    setSaveProgress(null);
    if (ok > 0) {
      toast.success(`${ok} peça${ok > 1 ? 's' : ''} adicionada${ok > 1 ? 's' : ''}! 🎉`);
    }
    if (ok === selected.length) {
      setImageData(null);
      setPieces([]);
      onDone();
    }
  };

  const reset = () => {
    setImageData(null);
    setPieces([]);
  };

  return (
    <div className="flex flex-col gap-3 pt-2 min-h-0">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy || analyzing}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 mr-1.5" />
          )}
          {imageData ? 'Trocar foto' : 'Selecionar foto vestida'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        {imageData && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-rose-600 hover:text-rose-700"
          >
            <X className="h-3.5 w-3.5 mr-1.5" /> Limpar
          </Button>
        )}
        {pieces.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {pieces.length} peças · {selectedCount} selecionadas
          </span>
        )}
      </div>

      {!imageData ? (
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center">
          <Camera className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Envie uma foto de você (ou alguém) vestindo as peças.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            A IA detecta cada peça separadamente (tronco superior, inferior, etc.) e adiciona todas no guarda-roupa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto custom-scroll pr-1">
          {/* Photo */}
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted">
            <img
              src={imageData}
              alt="foto vestida"
              className="w-full h-full object-cover"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="h-7 w-7 animate-spin" />
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Detectando peças...
                </p>
              </div>
            )}
          </div>

          {/* Pieces list */}
          <div className="space-y-2">
            {pieces.length === 0 && !analyzing && (
              <div className="rounded-lg border border-dashed border-muted-foreground/20 p-4 text-center text-sm text-muted-foreground">
                Nenhuma peça detectada ainda.
              </div>
            )}
            {pieces.map((piece) => (
              <WornPieceCard
                key={piece.id}
                piece={piece}
                onUpdate={(patch) => updatePiece(piece.id, patch)}
              />
            ))}
          </div>
        </div>
      )}

      {saveProgress && (
        <div className="space-y-1.5">
          <Progress value={(saveProgress.done / saveProgress.total) * 100} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Salvando... {saveProgress.done}/{saveProgress.total}
          </p>
        </div>
      )}

      {imageData && pieces.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t mt-1">
          <span className="text-xs text-muted-foreground">
            {selectedCount}/{pieces.length} selecionadas
          </span>
          <Button
            type="button"
            onClick={saveSelected}
            disabled={
              selectedCount === 0 || analyzing || saveProgress !== null || createMut.isPending
            }
            size="sm"
          >
            {saveProgress !== null || createMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 mr-1.5" />
            )}
            Salvar peças selecionadas ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  );
}

function WornPieceCard({
  piece,
  onUpdate,
}: {
  piece: WornPieceItem;
  onUpdate: (patch: Partial<WornPieceItem>) => void;
}) {
  const hasDefects = !!piece.analysis.defects?.trim();
  return (
    <div
      className={`rounded-lg border bg-card p-2.5 transition-opacity ${
        piece.selected ? 'border-border' : 'border-border/50 opacity-60'
      } ${piece.status === 'saved' ? 'ring-1 ring-emerald-500/40' : ''}`}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={piece.selected}
          onCheckedChange={(v) => onUpdate({ selected: v === true })}
          className="mt-1"
          aria-label="Incluir peça"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-normal capitalize">
              {piece.region}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {categoryLabel(piece.analysis.category)}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-normal">
              {formalityLabel(piece.analysis.formality)}
            </Badge>
            {hasDefects && (
              <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> defeito
              </Badge>
            )}
            {piece.status === 'saved' && (
              <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800">
                <Check className="h-2.5 w-2.5 mr-0.5" /> salva
              </Badge>
            )}
            {piece.status === 'saving' && (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            )}
            {piece.status === 'error' && (
              <Badge className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-800">
                erro
              </Badge>
            )}
          </div>

          <Input
            value={piece.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Nome da peça"
            className="h-7 text-xs"
            disabled={piece.status === 'saving' || piece.status === 'saved'}
          />

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ backgroundColor: piece.analysis.colorHex || '#888' }}
              aria-hidden
            />
            <span>{piece.analysis.color || '—'}</span>
            {piece.analysis.fabric && (
              <>
                <span className="opacity-50">·</span>
                <span className="capitalize">{piece.analysis.fabric}</span>
              </>
            )}
            <span className="ml-auto text-[10px]">
              reuso {defaultMaxReuses(piece.analysis.category)}x
            </span>
          </div>

          {hasDefects && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 line-clamp-2">
              ⚠️ {piece.analysis.defects}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

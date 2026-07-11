'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAllGarments,
  useReservedSets,
  useCreateReserved,
  useUpdateReserved,
  useDeleteReserved,
  useUseOutfit,
} from '@/lib/hooks';
import { EVENT_TYPES, CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Garment, ReservedSet } from '@/lib/types';
import { toast } from 'sonner';
import {
  CalendarClock, Check, Loader2, Trash2, X, Shirt, BookmarkCheck, History,
  CalendarDays, Clock, Cloud, ChevronDown,
} from 'lucide-react';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const statusBadgeMap: Record<ReservedSet['status'], { label: string; className: string }> = {
  reservado: { label: 'Reservado', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  usado: { label: 'Usado', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  cancelado: { label: 'Cancelado', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
};

function GarmentThumb({ garment }: { garment: Garment }) {
  const cat = CATEGORIES[garment.category];
  return (
    <div
      className="relative w-12 h-12 rounded-md overflow-hidden border border-border shrink-0"
      title={`${cat?.emoji ?? ''} ${garment.name}`}
    >
      <img
        src={garment.imageData}
        alt={garment.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function ReservedSetCard({
  set,
  garmentMap,
  onUse,
  onCancel,
  onDelete,
  usePending,
  updatePending,
  deletePending,
}: {
  set: ReservedSet;
  garmentMap: Map<string, Garment>;
  onUse: (set: ReservedSet) => void;
  onCancel: (set: ReservedSet) => void;
  onDelete: (set: ReservedSet) => void;
  usePending: boolean;
  updatePending: boolean;
  deletePending: boolean;
}) {
  const ev = EVENT_TYPES[set.eventType];
  const items = set.garmentIds
    .map((id) => garmentMap.get(id))
    .filter((g): g is Garment => !!g);
  const statusBadge = statusBadgeMap[set.status];
  const isReservado = set.status === 'reservado';

  return (
    <Card className={cn('overflow-hidden transition-shadow', !isReservado && 'opacity-80')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              <span className="text-lg">{ev?.emoji ?? '📌'}</span>
              <span className="line-clamp-1">{set.name}</span>
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {formatDate(set.eventDate)}
              </span>
              {set.eventTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {set.eventTime}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn('shrink-0 text-[10px]', statusBadge.className)}>
            {statusBadge.label}
          </Badge>
        </div>
        {set.conditions && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
            <Cloud className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{set.conditions}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Thumbnails */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">
            {items.length} {items.length === 1 ? 'peça' : 'peças'}:
          </span>
          {items.slice(0, 6).map((g) => (
            <GarmentThumb key={g.id} garment={g} />
          ))}
          {items.length > 6 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted rounded-md px-2 py-1.5">
              +{items.length - 6}
            </span>
          )}
          {items.length === 0 && (
            <span className="text-xs text-muted-foreground italic">peças não encontradas</span>
          )}
        </div>

        {set.reason && (
          <p className="text-xs text-muted-foreground italic leading-relaxed">{set.reason}</p>
        )}

        {isReservado && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => onUse(set)}
                disabled={usePending || updatePending}
              >
                {usePending || updatePending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                )}
                Usar conjunto
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancel(set)}
                disabled={updatePending}
              >
                {updatePending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5 mr-1.5" />
                )}
                Cancelar reserva
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={() => onDelete(set)}
                disabled={deletePending}
              >
                {deletePending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                Excluir
              </Button>
            </div>
          </>
        )}

        {!isReservado && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              onClick={() => onDelete(set)}
              disabled={deletePending}
            >
              {deletePending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Excluir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Reserve() {
  // Form state
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<string>('casual');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [conditions, setConditions] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // History collapse
  const [historyOpen, setHistoryOpen] = useState(false);

  // Data
  const { data: garmentsData } = useAllGarments();
  const { data: reservedData, isLoading: reservedLoading } = useReservedSets();

  // Mutations
  const createMut = useCreateReserved();
  const updateMut = useUpdateReserved();
  const deleteMut = useDeleteReserved();
  const useOutfitMut = useUseOutfit();

  const allGarments = garmentsData?.garments ?? [];
  const garmentMap = useMemo(() => {
    const m = new Map<string, Garment>();
    for (const g of allGarments) m.set(g.id, g);
    return m;
  }, [allGarments]);

  const availableGarments = useMemo(
    () => allGarments.filter((g) => g.status === 'disponivel' || g.status === 'reusavel'),
    [allGarments]
  );

  const allReserved = (reservedData?.reserved ?? []) as ReservedSet[];
  const ativos = allReserved.filter((r) => r.status === 'reservado');
  const historico = allReserved.filter((r) => r.status !== 'reservado');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit =
    name.trim().length > 0 && eventDate.length > 0 && selectedIds.size > 0 && !createMut.isPending;

  const resetForm = () => {
    setName('');
    setEventType('casual');
    setEventDate('');
    setEventTime('');
    setConditions('');
    setSelectedIds(new Set());
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMut.mutate(
      {
        name: name.trim(),
        eventType,
        eventDate,
        eventTime: eventTime || undefined,
        conditions: conditions.trim() || undefined,
        garmentIds: Array.from(selectedIds),
      },
      {
        onSuccess: () => {
          toast.success('Conjunto reservado! Essas peças não serão sugeridas em outras combinações.');
          resetForm();
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleUseSet = (set: ReservedSet) => {
    if (set.garmentIds.length === 0) {
      toast.error('Este conjunto não tem peças para marcar como usadas.');
      return;
    }
    useOutfitMut.mutate(
      { garmentIds: set.garmentIds, eventType: set.eventType },
      {
        onSuccess: () => {
          updateMut.mutate(
            { id: set.id, data: { status: 'usado' } },
            {
              onSuccess: () =>
                toast.success('Conjunto usado! Peças liberadas e marcadas como usadas.'),
              onError: (e) => toast.error(e.message),
            }
          );
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleCancelSet = (set: ReservedSet) => {
    updateMut.mutate(
      { id: set.id, data: { status: 'cancelado' } },
      {
        onSuccess: () => toast.success('Reserva cancelada — peças liberadas.'),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleDeleteSet = (set: ReservedSet) => {
    deleteMut.mutate(set.id, {
      onSuccess: () => toast.success('Reserva excluída.'),
      onError: (e) => toast.error(e.message),
    });
  };

  const anyPending =
    createMut.isPending ||
    updateMut.isPending ||
    deleteMut.isPending ||
    useOutfitMut.isPending;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookmarkCheck className="h-5 w-5 text-primary" /> Reservar
        </h2>
        <p className="text-sm text-muted-foreground">
          Separe peças para eventos futuros. As peças reservadas não entram em outras combinações.
        </p>
      </div>

      {/* Part A: Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" /> Reservar novo conjunto
          </CardTitle>
          <CardDescription>Selecione peças e defina o evento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Garment picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-1.5">
                <Shirt className="h-3.5 w-3.5" /> Peças para reservar
              </Label>
              <Badge variant="secondary" className="text-[10px]">
                {selectedIds.size} {selectedIds.size === 1 ? 'peça selecionada' : 'peças selecionadas'}
              </Badge>
            </div>
            {availableGarments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                Nenhuma peça disponível para reservar.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto custom-scroll pr-1">
                {availableGarments.map((g) => {
                  const selected = selectedIds.has(g.id);
                  const cat = CATEGORIES[g.category];
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleSelect(g.id)}
                      className={cn(
                        'relative rounded-lg overflow-hidden border-2 transition-all aspect-square group',
                        selected
                          ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                          : 'border-transparent hover:border-primary/40'
                      )}
                      aria-pressed={selected}
                    >
                      <img
                        src={g.imageData}
                        alt={g.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Selected check */}
                      {selected && (
                        <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      {/* Name label */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-1 py-1">
                        <p className="text-[9px] text-white font-medium leading-tight line-clamp-1">
                          {cat?.emoji ?? '👕'} {g.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Form fields */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="rsv-name" className="mb-1.5 block">
                Nome do conjunto <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="rsv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Casamento do João"
              />
            </div>

            <div>
              <Label htmlFor="rsv-type" className="mb-1.5 block">
                Tipo de evento
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="rsv-type">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([key, ev]) => (
                    <SelectItem key={key} value={key}>
                      <span className="mr-1">{ev.emoji}</span> {ev.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {EVENT_TYPES[eventType]?.hint}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="rsv-date" className="mb-1.5 block">
                  Data do evento <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="rsv-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rsv-time" className="mb-1.5 block">Hora</Label>
                <Input
                  id="rsv-time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="rsv-cond" className="mb-1.5 block">
                Condições/observações
              </Label>
              <Textarea
                id="rsv-cond"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="ex: ao ar livre, frio à noite"
                rows={2}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full" size="lg">
            {createMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Reservando...
              </>
            ) : (
              <>
                <BookmarkCheck className="h-4 w-4 mr-1.5" /> Reservar conjunto
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Part B: List of reserved sets */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <CalendarClock className="h-4 w-4 text-primary" /> Conjuntos reservados
        </h3>

        {reservedLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : ativos.length === 0 && historico.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <BookmarkCheck className="h-7 w-7 text-primary" />
              </div>
              <p className="font-medium">Nenhum conjunto reservado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reserve peças para um evento futuro acima.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ativos.map((set) => (
              <ReservedSetCard
                key={set.id}
                set={set}
                garmentMap={garmentMap}
                onUse={handleUseSet}
                onCancel={handleCancelSet}
                onDelete={handleDeleteSet}
                usePending={useOutfitMut.isPending}
                updatePending={updateMut.isPending}
                deletePending={deleteMut.isPending}
              />
            ))}

            {historico.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  <History className="h-4 w-4" />
                  Histórico ({historico.length})
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform ml-auto',
                      historyOpen && 'rotate-180'
                    )}
                  />
                </button>
                {historyOpen && (
                  <div className="space-y-3 mt-3">
                    {historico.map((set) => (
                      <ReservedSetCard
                        key={set.id}
                        set={set}
                        garmentMap={garmentMap}
                        onUse={handleUseSet}
                        onCancel={handleCancelSet}
                        onDelete={handleDeleteSet}
                        usePending={useOutfitMut.isPending}
                        updatePending={updateMut.isPending}
                        deletePending={deleteMut.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {anyPending && (
        <p className="sr-only" aria-live="polite">
          Processando...
        </p>
      )}
    </div>
  );
}

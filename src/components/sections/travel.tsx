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
import { GarmentCard } from '@/components/garment-card';
import {
  useAllGarments,
  useTravelPlans,
  useSuggestTravel,
  useCreateTravel,
  useUpdateTravel,
  useDeleteTravel,
  useUseOutfit,
} from '@/lib/hooks';
import { TRAVEL_CONTEXTS, TRANSPORT_TYPES, CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Garment, TravelPlan } from '@/lib/types';
import { toast } from 'sonner';
import {
  Plane, MapPin, Loader2, Trash2, X, Sparkles, Check, CalendarDays,
  Cloud, Compass, NotebookPen, PlaneTakeoff, Flag, Shirt, Lightbulb,
} from 'lucide-react';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function calcDuration(start: string, end: string): number {
  try {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const d = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, d);
  } catch {
    return 1;
  }
}

const statusBadgeMap: Record<TravelPlan['status'], { label: string; className: string }> = {
  planejada: { label: 'Planejada', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  'em-viagem': { label: 'Em viagem', className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  concluida: { label: 'Concluída', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
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

function TravelCard({
  plan,
  garmentMap,
  onMarkTraveling,
  onConclude,
  onUsePieces,
  onDelete,
  updatePending,
  deletePending,
  usePending,
}: {
  plan: TravelPlan;
  garmentMap: Map<string, Garment>;
  onMarkTraveling: (plan: TravelPlan) => void;
  onConclude: (plan: TravelPlan) => void;
  onUsePieces: (plan: TravelPlan) => void;
  onDelete: (plan: TravelPlan) => void;
  updatePending: boolean;
  deletePending: boolean;
  usePending: boolean;
}) {
  const ctx = plan.context ? TRAVEL_CONTEXTS[plan.context] : null;
  const transport = plan.transport ? TRANSPORT_TYPES[plan.transport] : null;
  const items = plan.garmentIds
    .map((id) => garmentMap.get(id))
    .filter((g): g is Garment => !!g);
  const statusBadge = statusBadgeMap[plan.status];
  const duration = plan.duration ?? calcDuration(plan.startDate, plan.endDate);
  const canAct = plan.status === 'planejada' || plan.status === 'em-viagem';

  return (
    <Card className={cn('overflow-hidden transition-shadow', plan.status === 'concluida' && 'opacity-80')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              <span className="text-lg">{ctx?.emoji ?? '🧳'}</span>
              <span className="line-clamp-1">{plan.destination}</span>
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {duration} {duration === 1 ? 'dia' : 'dias'}
              </span>
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn('shrink-0 text-[10px]', statusBadge.className)}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Meta row */}
        <div className="flex flex-wrap gap-2 text-xs">
          {plan.weather && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              <Cloud className="h-3 w-3 mr-1" /> {plan.weather}
            </Badge>
          )}
          {transport && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              <span className="mr-1">{transport.emoji}</span> {transport.label}
            </Badge>
          )}
          {ctx && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              <span className="mr-1">{ctx.emoji}</span> {ctx.label}
            </Badge>
          )}
        </div>

        {/* Notes */}
        {plan.notes && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <NotebookPen className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{plan.notes}</span>
          </div>
        )}

        {/* Reason */}
        {plan.reason && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs text-foreground/80 leading-relaxed">
            {plan.reason}
          </div>
        )}

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
            <span className="text-xs text-muted-foreground italic">sem peças</span>
          )}
        </div>

        {canAct && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => onUsePieces(plan)}
                disabled={usePending || items.length === 0}
              >
                {usePending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                )}
                Usar peças
              </Button>

              {plan.status === 'planejada' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkTraveling(plan)}
                  disabled={updatePending}
                >
                  {updatePending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <PlaneTakeoff className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Marcar em viagem
                </Button>
              )}

              {plan.status === 'em-viagem' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onConclude(plan)}
                  disabled={updatePending}
                >
                  {updatePending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Concluir
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto"
                onClick={() => onDelete(plan)}
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

        {plan.status === 'concluida' && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={() => onDelete(plan)}
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
      </CardContent>
    </Card>
  );
}

export function Travel() {
  // Form state
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weather, setWeather] = useState('');
  const [transport, setTransport] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Suggestion state
  const [suggestion, setSuggestion] = useState<{ garmentIds: string[]; reason: string } | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Data
  const { data: garmentsData } = useAllGarments();
  const { data: travelData, isLoading: travelLoading } = useTravelPlans();

  // Mutations
  const suggestMut = useSuggestTravel();
  const createMut = useCreateTravel();
  const updateMut = useUpdateTravel();
  const deleteMut = useDeleteTravel();
  const useOutfitMut = useUseOutfit();

  const allGarments = garmentsData?.garments ?? [];
  const garmentMap = useMemo(() => {
    const m = new Map<string, Garment>();
    for (const g of allGarments) m.set(g.id, g);
    return m;
  }, [allGarments]);

  const allTravels = (travelData?.travels ?? []) as TravelPlan[];

  const canSuggest =
    destination.trim().length > 0 &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    !suggestMut.isPending;

  const canSavePlan = suggestion !== null && !createMut.isPending;

  const resetForm = () => {
    setDestination('');
    setStartDate('');
    setEndDate('');
    setWeather('');
    setTransport('');
    setContext('');
    setNotes('');
  };

  const handleSuggest = () => {
    if (!canSuggest) return;
    suggestMut.mutate(
      {
        destination: destination.trim(),
        startDate,
        endDate,
        weather: weather.trim() || undefined,
        transport: transport || undefined,
        context: context || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setSuggestion(data);
          setRemovedIds(new Set());
          if (data.garmentIds.length === 0) {
            toast.info('A IA não conseguiu sugerir peças. Tente ajustar o destino ou datas.');
          } else {
            toast.success(`${data.garmentIds.length} peças sugeridas para sua viagem! ✨`);
          }
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleRemoveSuggestionGarment = (id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleDiscardSuggestion = () => {
    setSuggestion(null);
    setRemovedIds(new Set());
  };

  const handleSaveTravel = () => {
    if (!suggestion) return;
    const finalGarmentIds = suggestion.garmentIds.filter((id) => !removedIds.has(id));
    createMut.mutate(
      {
        destination: destination.trim(),
        startDate,
        endDate,
        weather: weather.trim() || undefined,
        transport: transport || undefined,
        context: context || undefined,
        notes: notes.trim() || undefined,
        garmentIds: finalGarmentIds,
        reason: suggestion.reason,
      },
      {
        onSuccess: () => {
          toast.success('Plano de viagem salvo! As peças selecionadas ficam separadas para sua viagem.');
          handleDiscardSuggestion();
          resetForm();
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleMarkTraveling = (plan: TravelPlan) => {
    updateMut.mutate(
      { id: plan.id, data: { status: 'em-viagem' } },
      {
        onSuccess: () => toast.success('Viagem iniciada! Boa viagem ✈️'),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleConclude = (plan: TravelPlan) => {
    updateMut.mutate(
      { id: plan.id, data: { status: 'concluida' } },
      {
        onSuccess: () => toast.success('Viagem concluída! Bem-vindo de volta 🏠'),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleUsePieces = (plan: TravelPlan) => {
    if (plan.garmentIds.length === 0) {
      toast.error('Esta viagem não tem peças para marcar como usadas.');
      return;
    }
    useOutfitMut.mutate(
      { garmentIds: plan.garmentIds, eventType: 'casual' },
      {
        onSuccess: () => toast.success('Peças da viagem marcadas como usadas.'),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleDelete = (plan: TravelPlan) => {
    deleteMut.mutate(plan.id, {
      onSuccess: () => toast.success('Plano de viagem excluído.'),
      onError: (e) => toast.error(e.message),
    });
  };

  const suggestedGarments = useMemo(() => {
    if (!suggestion) return [];
    return suggestion.garmentIds
      .filter((id) => !removedIds.has(id))
      .map((id) => garmentMap.get(id))
      .filter((g): g is Garment => !!g);
  }, [suggestion, removedIds, garmentMap]);

  const anyPending =
    suggestMut.isPending ||
    createMut.isPending ||
    updateMut.isPending ||
    deleteMut.isPending ||
    useOutfitMut.isPending;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" /> Viagens
        </h2>
        <p className="text-sm text-muted-foreground">
          Planeje looks para viagens. A IA sugere um conjunto completo com base no destino e clima.
        </p>
      </div>

      {/* Part A: Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Planejar viagem
          </CardTitle>
          <CardDescription>Detalhe sua viagem para a IA montar o conjunto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tv-dest" className="mb-1.5 block">
              Destino <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="tv-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="ex: Praia de Maresias, SP"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tv-start" className="mb-1.5 block">
                Data de ida <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="tv-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tv-end" className="mb-1.5 block">
                Data de volta <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="tv-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tv-weather" className="mb-1.5 block flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" /> Clima previsto
            </Label>
            <Input
              id="tv-weather"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="ex: frio 12°C, possibilidade de chuva"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tv-transport" className="mb-1.5 block flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" /> Meio de transporte
              </Label>
              <Select value={transport} onValueChange={setTransport}>
                <SelectTrigger id="tv-transport">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSPORT_TYPES).map(([key, t]) => (
                    <SelectItem key={key} value={key}>
                      <span className="mr-1">{t.emoji}</span> {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tv-ctx" className="mb-1.5 block flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Contexto
              </Label>
              <Select value={context} onValueChange={setContext}>
                <SelectTrigger id="tv-ctx">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRAVEL_CONTEXTS).map(([key, c]) => (
                    <SelectItem key={key} value={key}>
                      <span className="mr-1">{c.emoji}</span> {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {context && (
                <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                  <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                  {TRAVEL_CONTEXTS[context]?.hint}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="tv-notes" className="mb-1.5 block flex items-center gap-1.5">
              <NotebookPen className="h-3.5 w-3.5" /> Observações
            </Label>
            <Textarea
              id="tv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: vou visitar família, tem piscina, levar roupa de treino"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSuggest}
            disabled={!canSuggest}
            className="w-full"
            size="lg"
          >
            {suggestMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> A IA está montando seu conjunto de viagem...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" /> Sugerir conjunto com IA
              </>
            )}
          </Button>

          {/* Suggestion result */}
          {suggestion && (
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3 animate-fade-in-up">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-1">Sugestão da IA</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{suggestion.reason}</p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Shirt className="h-3.5 w-3.5" /> Peças sugeridas
                  </Label>
                  <Badge variant="secondary" className="text-[10px]">
                    {suggestedGarments.length} {suggestedGarments.length === 1 ? 'peça' : 'peças'}
                  </Badge>
                </div>
                {suggestedGarments.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                    Todas as peças foram removidas. Adicione pelo menos uma para salvar.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto custom-scroll pr-1">
                    {suggestedGarments.map((g) => (
                      <div key={g.id} className="relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveSuggestionGarment(g.id)}
                          className="absolute top-1 right-1 z-10 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition-colors"
                          aria-label={`Remover ${g.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <GarmentCard garment={g} compact />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  onClick={handleSaveTravel}
                  disabled={!canSavePlan || suggestedGarments.length === 0}
                  className="flex-1 min-w-[160px]"
                >
                  {createMut.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  Salvar plano de viagem
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDiscardSuggestion}
                  disabled={createMut.isPending}
                >
                  <X className="h-4 w-4 mr-1.5" /> Descartar sugestão
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Part B: Travel list */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Plane className="h-4 w-4 text-primary" /> Minhas viagens
        </h3>

        {travelLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : allTravels.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Plane className="h-7 w-7 text-primary" />
              </div>
              <p className="font-medium">Nenhuma viagem planejada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use o formulário acima para a IA sugerir um conjunto.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allTravels.map((plan) => (
              <TravelCard
                key={plan.id}
                plan={plan}
                garmentMap={garmentMap}
                onMarkTraveling={handleMarkTraveling}
                onConclude={handleConclude}
                onUsePieces={handleUsePieces}
                onDelete={handleDelete}
                updatePending={updateMut.isPending}
                deletePending={deleteMut.isPending}
                usePending={useOutfitMut.isPending}
              />
            ))}
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

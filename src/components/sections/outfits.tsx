'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSuggestOutfits, useUseOutfit, useStats } from '@/lib/hooks';
import { EVENT_TYPES, CATEGORIES } from '@/lib/constants';
import type { EventType, OutfitSuggestion } from '@/lib/types';
import { toast } from 'sonner';
import {
  Wand2, Loader2, Sparkles, Check, Clock, Cloud, Shirt, CheckCircle2, Star, ArrowRight,
} from 'lucide-react';

const vibeColors: Record<string, string> = {
  classico: 'bg-primary/10 text-primary border-primary/30',
  ousado: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  confortavel: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  elegante: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  esportivo: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
};

export function Outfits() {
  const [eventType, setEventType] = useState<EventType>('casual');
  const [eventTime, setEventTime] = useState('');
  const [weather, setWeather] = useState('');
  const [notes, setNotes] = useState('');
  const [saveUniform, setSaveUniform] = useState(false);
  const [uniformName, setUniformName] = useState('');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [usedSuggestion, setUsedSuggestion] = useState<string | null>(null);

  const suggestMut = useSuggestOutfits();
  const useMut = useUseOutfit();
  const { data: statsData } = useStats();

  const handleGenerate = () => {
    suggestMut.mutate(
      { eventType, eventTime, weather, notes },
      {
        onSuccess: (data) => {
          setSuggestions(data.suggestions);
          setUsedSuggestion(null);
          if (data.suggestions.length === 0) {
            toast.info('A IA não conseguiu montar combinações. Adicione mais peças.');
          } else {
            toast.success(`${data.suggestions.length} combinações geradas! ✨`);
          }
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleUse = (sug: OutfitSuggestion) => {
    useMut.mutate(
      {
        garmentIds: sug.garmentIds,
        saveAsUniform: saveUniform,
        uniformName: uniformName || sug.name,
        eventType,
      },
      {
        onSuccess: () => {
          setUsedSuggestion(sug.id);
          toast.success(
            saveUniform
              ? `Look "${uniformName || sug.name}" salvo como uniforme! 👔`
              : 'Look marcado como usado! Peças atualizadas. ✅'
          );
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const canGenerate = statsData?.stats && statsData.stats.disponivel + statsData.stats.reusavel >= 4;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" /> Combinar com IA
        </h2>
        <p className="text-sm text-muted-foreground">
          Diga onde vai e quando. A IA monta 3 looks diferentes das suas peças.
        </p>
      </div>

      {/* Formulário de evento */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalhes da saída</CardTitle>
          <CardDescription>Quanto mais contexto, melhor a sugestão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de evento */}
          <div>
            <Label className="mb-2 block">Onde você vai?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(EVENT_TYPES) as Array<[EventType, typeof EVENT_TYPES[EventType]]>).map(([key, ev]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEventType(key)}
                  className={`flex flex-col items-start gap-0.5 rounded-lg border p-2.5 text-left transition-all ${
                    eventType === key
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-xl">{ev.emoji}</span>
                  <span className="text-xs font-medium leading-tight">{ev.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{EVENT_TYPES[eventType].hint}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="time" className="mb-1.5 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Horário
              </Label>
              <Input id="time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weather" className="mb-1.5 block flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5" /> Clima (opcional)
              </Label>
              <Input id="weather" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="Ex: frio, 18°C, chuvoso" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="mb-1.5 block">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: encontro romântico, quero impressionar; almoço de família..."
              rows={2}
            />
          </div>

          {/* Salvar como uniforme */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Switch checked={saveUniform} onCheckedChange={setSaveUniform} id="uniform" />
            <div className="flex-1">
              <Label htmlFor="uniform" className="cursor-pointer flex items-center gap-1.5 font-medium">
                <Star className="h-3.5 w-3.5" /> Salvar como uniforme
              </Label>
              <p className="text-xs text-muted-foreground">Salva o look para reusar em ocasiões parecidas</p>
            </div>
          </div>
          {saveUniform && (
            <div>
              <Label htmlFor="uname" className="mb-1.5 block">Nome do uniforme</Label>
              <Input id="uname" value={uniformName} onChange={(e) => setUniformName(e.target.value)} placeholder="Ex: Look trabalho segunda-feira" />
            </div>
          )}

          <Button onClick={handleGenerate} disabled={suggestMut.isPending || !canGenerate} className="w-full" size="lg">
            {suggestMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> A IA está montando combinações...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" /> Gerar 3 combinações
              </>
            )}
          </Button>
          {!canGenerate && (
            <p className="text-xs text-amber-600 text-center">
              Você precisa de pelo menos 4 peças disponíveis. Atual: {statsData?.stats?.disponivel ?? 0} disponíveis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">3 combinações para {EVENT_TYPES[eventType].label.toLowerCase()}</h3>
          </div>

          {suggestions.map((sug, idx) => (
            <Card key={sug.id} className="overflow-hidden animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-lg">{idx === 0 ? '🎯' : idx === 1 ? '🔥' : '🛋️'}</span>
                      {sug.name}
                    </CardTitle>
                    <CardDescription className="mt-1 leading-relaxed">{sug.reason}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className="font-bold">{sug.score}/100</Badge>
                    <Badge variant="outline" className={`capitalize ${vibeColors[sug.vibe] ?? 'border-border'}`}>
                      {sug.vibe}
                    </Badge>
                  </div>
                </div>
                {sug.weatherNote && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Cloud className="h-3 w-3" /> {sug.weatherNote}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {/* Peças do look */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                  {sug.garments.map((g) => {
                    const cat = CATEGORIES[g.category];
                    return (
                      <div key={g.id} className="group relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={g.imageData} alt={g.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                          <p className="text-[9px] text-white font-medium leading-tight line-clamp-1">
                            {cat?.emoji} {cat?.label ?? g.category}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  {usedSuggestion === sug.id ? (
                    <Button variant="secondary" className="flex-1" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                      Combinação usada!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUse(sug)}
                      disabled={useMut.isPending}
                      className="flex-1"
                    >
                      {useMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                      Usar este look
                    </Button>
                  )}
                </div>
                {usedSuggestion === sug.id && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    As peças foram movidas para "usadas". Íntimas foram pro cesto, as outras podem reusar.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vazio inicial */}
      {suggestions.length === 0 && !suggestMut.isPending && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Shirt className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium">Pronto para montar seu look?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha os detalhes acima e a IA vai criar 3 opções diferentes pra você.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

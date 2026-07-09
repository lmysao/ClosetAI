'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useShoppingTips,
  useGenerateShopping,
  useResolveTip,
  useDeleteTip,
} from '@/lib/hooks';
import { PREFERRED_PERFUMES, CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  ShoppingBag, Sparkles, Loader2, Check, Trash2, Coffee, Watch, Shirt, RefreshCw, AlertCircle,
} from 'lucide-react';
import type { ShoppingTip } from '@/lib/types';

const priorityMap: Record<string, { label: string; color: string }> = {
  alta: { label: 'Alta prioridade', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
  media: { label: 'Média', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  baixa: { label: 'Baixa', color: 'bg-sky-500/15 text-sky-600 border-sky-500/30' },
};

const kindIcons: Record<string, React.ReactNode> = {
  roupa: <Shirt className="h-4 w-4" />,
  acessorio: <Watch className="h-4 w-4" />,
  perfume: <Coffee className="h-4 w-4" />,
};

export function Shopping() {
  const { data, isLoading } = useShoppingTips();
  const genMut = useGenerateShopping();
  const resolveMut = useResolveTip();
  const deleteMut = useDeleteTip();

  const tips = (data?.tips ?? []) as ShoppingTip[];
  const active = tips.filter((t) => !t.resolved);
  const resolved = tips.filter((t) => t.resolved);

  const handleGenerate = () => {
    genMut.mutate(undefined, {
      onSuccess: (d) => toast.success(`${d.tips?.length ?? 0} dicas geradas pela IA! ✨`),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" /> Dicas de Compra
          </h2>
          <p className="text-sm text-muted-foreground">
            A IA analisa seu guarda-roupa e sugere o que vale comprar
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={genMut.isPending} size="sm">
          {genMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
          {tips.length === 0 ? 'Gerar dicas com IA' : 'Atualizar dicas'}
        </Button>
      </div>

      {/* Perfumes preferidos */}
      <Card className="border-primary/20 bg-gradient-to-br from-secondary/60 to-accent/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Coffee className="h-4 w-4 text-primary" /> Seus perfumes preferidos
          </CardTitle>
          <CardDescription>O Boticário e outras marcas que você curte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {PREFERRED_PERFUMES.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-lg bg-background/60 backdrop-blur p-2.5">
                <div className="rounded-full bg-primary/15 p-2 shrink-0">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.vibe}</p>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize shrink-0">{p.season}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas ativas */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium">Sem dicas ainda</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Clique em "Gerar dicas com IA" e ela vai analisar seu guarda-roupa: peças faltando,
              reposições, acessórios e qual perfume combina com você.
            </p>
            <Button onClick={handleGenerate} disabled={genMut.isPending}>
              <Sparkles className="h-4 w-4 mr-1.5" />
              {genMut.isPending ? 'Analisando...' : 'Analisar guarda-roupa'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {active.map((tip) => {
            const cat = CATEGORIES[tip.category];
            const prio = priorityMap[tip.priority] ?? priorityMap.media;
            return (
              <Card key={tip.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    {kindIcons[tip.kind] ?? <ShoppingBag className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold leading-tight">{tip.title}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${prio.color}`}>
                        {prio.label}
                      </Badge>
                    </div>
                    {tip.reason && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.reason}</p>
                    )}
                    {cat && (
                      <div className="mt-1.5">
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {cat.emoji} {cat.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => resolveMut.mutate({ id: tip.id, resolved: true }, {
                        onSuccess: () => toast.success('Marcado como comprado! 🛍️'),
                      })}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-muted-foreground hover:text-rose-600"
                      onClick={() => deleteMut.mutate(tip.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolvidas */}
      {resolved.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" /> Já comprou ({resolved.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
              {resolved.map((tip) => (
                <div key={tip.id} className="flex items-center gap-2 text-sm py-1.5 border-b last:border-0">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="flex-1 line-through text-muted-foreground">{tip.title}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-muted-foreground"
                    onClick={() => deleteMut.mutate(tip.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso */}
      <Card className="border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 dark:border-sky-900">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-sky-900 dark:text-sky-100">Como a IA decide?</p>
            <p className="text-sky-700 dark:text-sky-300 mt-0.5 leading-relaxed">
              Ela olha quantas peças você tem por categoria (ex: poucas cuecas?), peças sendo muito
              usadas (precisa de reposição pra melhorar a rotação), acessórios que dariam mais
              versatilidade e qual perfume combina com seu estilo. Atualize depois de comprar pra
              manter as dicas relevantes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

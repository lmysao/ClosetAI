'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStats, useSeedGarments, useAllGarments } from '@/lib/hooks';
import { useUIStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import { GarmentCard } from '@/components/garment-card';
import {
  Shirt, Sparkles, AlertTriangle, TrendingUp, Droplets, Package, Wand2, ArrowRight, Coffee,
} from 'lucide-react';
import { toast } from 'sonner';

export function Dashboard() {
  const { data: statsData } = useStats();
  const { data: garmentsData } = useAllGarments();
  const setSection = useUIStore((s) => s.setSection);
  const seedMut = useSeedGarments();

  const stats = statsData?.stats;
  const garments = garmentsData?.garments ?? [];

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = stats.total === 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-secondary">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">👔</span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Bem-vindo ao seu <span className="text-primary">ClosetAI</span>
                </h1>
              </div>
              <p className="text-muted-foreground max-w-lg">
                {isEmpty
                  ? 'Comece adicionando suas roupas ou criando peças demo para experimentar todas as funcionalidades.'
                  : 'Tire o máximo do seu guarda-roupa com combinações inteligentes, rotação otimizada e dicas de compra.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={() => setSection('outfits')} disabled={isEmpty}>
                  <Wand2 className="h-4 w-4 mr-1.5" />
                  Gerar combinações
                </Button>
                {isEmpty ? (
                  <Button
                    variant="secondary"
                    onClick={() => seedMut.mutate(false, {
                      onSuccess: (d) => toast.success(d.message || 'Peças demo criadas! 🎉'),
                      onError: (e) => toast.error(e.message),
                    })}
                    disabled={seedMut.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    {seedMut.isPending ? 'Criando...' : 'Criar peças demo'}
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => setSection('wardrobe')}>
                    <Shirt className="h-4 w-4 mr-1.5" />
                    Ver guarda-roupa
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-3 lg:flex-col">
              <StatPill icon={<Package className="h-4 w-4" />} label="Total" value={stats.total} />
              <StatPill icon={<span className="text-base">✅</span>} label="Disponíveis" value={stats.disponivel} tone="emerald" />
              <StatPill icon={<Droplets className="h-4 w-4" />} label="Sujas" value={stats.suja} tone="rose" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {stats.laundryAlert && !isEmpty && (
        <Card className="border-amber-300 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="rounded-full bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Hora de lavar roupa! 🧺
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                Você tem {stats.suja} {stats.suja === 1 ? 'peça suja' : 'peças sujas'} no cesto.
                {stats.disponivel < 5 && ' Suas peças disponíveis estão acabando.'}
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setSection('laundry')}>
                Ir para a lavanderia
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de métricas */}
      {!isEmpty && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Rotação"
            value={`${stats.rotationScore}%`}
            hint="peças usadas últimas 2 sem."
            progress={stats.rotationScore}
          />
          <MetricCard
            icon={<span className="text-xl">🔄</span>}
            label="Reusáveis"
            value={stats.reusavel}
            hint="podem usar de novo"
          />
          <MetricCard
            icon={<span className="text-xl">✨</span>}
            label="Formalidades"
            value={stats.byFormality.length}
            hint="estilos diferentes"
          />
          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Faltando"
            value={stats.missingEssentials.length}
            hint="essenciais em falta"
            tone={stats.missingEssentials.length > 0 ? 'warn' : 'ok'}
            onClick={stats.missingEssentials.length > 0 ? () => setSection('shopping') : undefined}
          />
        </div>
      )}

      {/* Peças favoritas + recentes */}
      {!isEmpty && garments.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span>❤️</span> Favoritas
              </CardTitle>
              <CardDescription>Suas peças marcadas como favoritas</CardDescription>
            </CardHeader>
            <CardContent>
              {garments.filter((g) => g.favorite).length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Marque peças como favoritas tocando no coração.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {garments.filter((g) => g.favorite).slice(0, 8).map((g) => (
                    <GarmentCard key={g.id} garment={g} compact />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span>⏰</span> Hora de reaproveitar
              </CardTitle>
              <CardDescription>Peças disponíveis há mais tempo sem uso</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.leastWorn.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Sem dados ainda.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll pr-1">
                  {stats.leastWorn.map((g, i) => {
                    const cat = CATEGORIES[g.category];
                    const days = g.lastWornAt
                      ? Math.floor((Date.now() - new Date(g.lastWornAt).getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="text-xl">{cat?.emoji ?? '👕'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{g.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {g.timesWorn === 0 ? 'Nunca usada' : `Usada ${g.timesWorn}x`}
                            {days !== null && ` · há ${days}d`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-normal">{cat?.label ?? g.category}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição por categoria */}
      {!isEmpty && stats.byCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shirt className="h-4 w-4" /> Distribuição do guarda-roupa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.byCategory.slice(0, 8).map((c) => {
                const cat = CATEGORIES[c.category];
                const pct = stats.total > 0 ? (c.count / stats.total) * 100 : 0;
                return (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="text-lg w-6">{cat?.emoji ?? '👕'}</span>
                    <span className="text-sm w-24 truncate">{cat?.label ?? c.category}</span>
                    <div className="flex-1">
                      <Progress value={pct} className="h-2" />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{c.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perfume preferido em destaque */}
      {!isEmpty && (
        <Card className="border-primary/20 bg-gradient-to-br from-secondary/60 to-accent/40">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-primary/15 p-3">
              <Coffee className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Perfume do dia</p>
              <p className="font-semibold text-lg">Coffee Unique — O Boticário</p>
              <p className="text-sm text-muted-foreground">Amadeirado marcante e exclusivo. Combina com looks casuais-chique e sociais.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSection('shopping')}>
              Ver dicas
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatPill({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: 'emerald' | 'rose' }) {
  const toneClass = tone === 'emerald'
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
    : tone === 'rose'
    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
    : 'bg-background/80 text-foreground';
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 backdrop-blur ${toneClass}`}>
      {icon}
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
      </div>
    </div>
  );
}

function MetricCard({
  icon, label, value, hint, progress, tone, onClick,
}: {
  icon: React.ReactNode; label: string; value: string | number; hint?: string;
  progress?: number; tone?: 'warn' | 'ok'; onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`rounded-lg p-1.5 ${tone === 'warn' ? 'bg-amber-500/15 text-amber-600' : 'bg-primary/10 text-primary'}`}>
            {icon}
          </span>
          {tone === 'warn' && <span className="text-xs text-amber-600 font-medium">atenção</span>}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</p>}
        {progress !== undefined && <Progress value={progress} className="h-1.5 mt-2" />}
      </CardContent>
    </Card>
  );
}

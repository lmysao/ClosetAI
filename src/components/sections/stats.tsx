'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStats } from '@/lib/hooks';
import { CATEGORIES, FORMALITIES } from '@/lib/constants';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { TrendingUp, Award, Clock, Sparkles, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#b45309', '#92400e', '#d97706', '#eab308', '#a16207', '#78350f', '#f59e0b', '#854d0e'];

export function Stats() {
  const { data } = useStats();
  const stats = data?.stats;

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-muted/40 animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center">
          <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Sem dados ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Adicione peças e use o sistema para ver estatísticas.</p>
        </CardContent>
      </Card>
    );
  }

  const catData = stats.byCategory.map((c) => ({
    name: CATEGORIES[c.category]?.label ?? c.category,
    emoji: CATEGORIES[c.category]?.emoji ?? '👕',
    value: c.count,
  }));

  const formalityData = stats.byFormality.map((f) => ({
    name: FORMALITIES[f.formality as keyof typeof FORMALITIES]?.label ?? f.formality,
    value: f.count,
  }));

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Estatísticas
        </h2>
        <p className="text-sm text-muted-foreground">Conheça seu guarda-roupa em números</p>
      </div>

      {/* Score de rotação */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-accent/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Score de rotação
              </p>
              <p className="text-4xl font-bold text-primary">{stats.rotationScore}<span className="text-lg text-muted-foreground">/100</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {stats.rotationScore >= 70 ? 'Excelente! 🎉' : stats.rotationScore >= 40 ? 'Dá pra melhorar 📈' : 'Rotatividade baixa ⚠️'}
              </p>
              <p className="text-xs text-muted-foreground">peças usadas últimas 2 semanas</p>
            </div>
          </div>
          <Progress value={stats.rotationScore} className="h-2.5" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Por categoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>📊</span> Peças por categoria
            </CardTitle>
            <CardDescription>Distribuição do seu guarda-roupa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(180,83,9,0.08)' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Por formalidade */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4" /> Por formalidade
            </CardTitle>
            <CardDescription>Estilos que você tem disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {formalityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mais e menos usadas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" /> Mais usadas
            </CardTitle>
            <CardDescription>Suas peças favoritas na prática</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.mostWorn.length === 0 || stats.mostWorn[0].timesWorn === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Use o sistema para gerar ranking.</p>
            ) : (
              <div className="space-y-2">
                {stats.mostWorn.map((g, i) => {
                  const cat = CATEGORIES[g.category];
                  const max = stats.mostWorn[0].timesWorn || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}º</span>
                      <span className="text-lg">{cat?.emoji ?? '👕'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.name}</p>
                        <Progress value={(g.timesWorn / max) * 100} className="h-1.5 mt-1" />
                      </div>
                      <span className="text-sm font-bold text-primary w-8 text-right">{g.timesWorn}x</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Esquecidas no armário
            </CardTitle>
            <CardDescription>Peças disponíveis há mais tempo sem uso</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.leastWorn.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados ainda.</p>
            ) : (
              <div className="space-y-2">
                {stats.leastWorn.map((g, i) => {
                  const cat = CATEGORIES[g.category];
                  const days = g.lastWornAt
                    ? Math.floor((Date.now() - new Date(g.lastWornAt).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-lg">{cat?.emoji ?? '👕'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.timesWorn === 0 ? 'Nunca usada' : `Usada ${g.timesWorn}x`}
                          {days !== null && ` · há ${days} dias`}
                        </p>
                      </div>
                      {days !== null && days > 30 && (
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">
                          esquecida
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status geral das peças</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatusBox label="Disponíveis" value={stats.disponivel} emoji="✅" color="emerald" />
            <StatusBox label="Reusáveis" value={stats.reusavel} emoji="🔄" color="amber" />
            <StatusBox label="No cesto" value={stats.suja} emoji="🧺" color="rose" />
            <StatusBox label="Lavando" value={stats.lavando} emoji="🫧" color="sky" />
          </div>
        </CardContent>
      </Card>

      {/* Essenciais faltando */}
      {stats.missingEssentials.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-100">
              ⚠️ Essenciais em falta
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Quantidade ideal para ter de cada categoria essencial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {stats.missingEssentials.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-100">
                  <span className="text-amber-500">•</span>
                  {m}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBox({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  };
  return (
    <div className={`rounded-xl p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xl">{emoji}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

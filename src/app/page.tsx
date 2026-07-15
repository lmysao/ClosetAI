'use client';

import { useState, useEffect } from 'react';
import { useUIStore, type Section } from '@/lib/store';
import { Dashboard } from '@/components/sections/dashboard';
import { Wardrobe } from '@/components/sections/wardrobe';
import { Outfits } from '@/components/sections/outfits';
import { Laundry } from '@/components/sections/laundry';
import { Shopping } from '@/components/sections/shopping';
import { Stats } from '@/components/sections/stats';
import { Reserve } from '@/components/sections/reserve';
import { Travel } from '@/components/sections/travel';
import { AddGarmentDialog } from '@/components/add-garment-dialog';
import { BatchAddDialog } from '@/components/batch-add-dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useStats, useReservedSets } from '@/lib/hooks';
import {
  LayoutDashboard, Shirt, Wand2, ShowerHead, ShoppingBag, BarChart3,
  Plus, Sun, Moon, Heart, Layers, Plane, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV: Array<{ id: Section; label: string; icon: React.ComponentType<{ className?: string }>; emoji: string }> = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard, emoji: '🏠' },
  { id: 'wardrobe', label: 'Guarda-Roupa', icon: Shirt, emoji: '👔' },
  { id: 'outfits', label: 'Combinar', icon: Wand2, emoji: '✨' },
  { id: 'laundry', label: 'Lavanderia', icon: ShowerHead, emoji: '🧺' },
  { id: 'reserve', label: 'Reservas', icon: Layers, emoji: '📌' },
  { id: 'travel', label: 'Viagens', icon: Plane, emoji: '🧳' },
  { id: 'shopping', label: 'Compras', icon: ShoppingBag, emoji: '🛍️' },
  { id: 'stats', label: 'Stats', icon: BarChart3, emoji: '📊' },
];

export default function Home() {
  const section = useUIStore((s) => s.section);
  const setSection = useUIStore((s) => s.setSection);
  const [addOpen, setAddOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: statsData } = useStats();
  const { data: reservedData } = useReservedSets();

  // next-themes precisa saber quando montou pra evitar mismatch de hidratação
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // badge de alerta na lavanderia
  const laundryBadge = statsData?.stats?.laundryAlert ? statsData.stats.suja : 0;
  // badge de reservas ativas
  const reserveBadge = (reservedData?.reserved ?? []).filter((r) => r.status === 'reservado').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
              C
            </div>
            <div className="hidden sm:block">
              <p className="font-bold leading-none text-sm">ClosetAI</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">seu guarda-roupa inteligente</p>
            </div>
          </div>

          {/* Nav centralizada (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.id === 'laundry' && laundryBadge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {laundryBadge}
                    </span>
                  )}
                  {item.id === 'reserve' && reserveBadge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {reserveBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBatchOpen(true)} className="h-9 hidden sm:inline-flex" title="Adicionar várias peças de uma vez">
              <Layers className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden md:inline">Em lote</span>
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)} className="h-9">
              <Plus className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Adicionar peça</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Layout: sidebar (lg) + main */}
      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-56 border-r bg-sidebar/50 p-3 sticky top-14 self-start h-[calc(100vh-3.5rem)]">
          <div className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={cn(
                    'relative w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'laundry' && laundryBadge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {laundryBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto rounded-lg bg-primary/5 p-3 border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <p className="text-xs font-semibold">Dica do dia</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Rotatividade é tudo. Tente não repetir a mesma camisa 2 dias seguidos — a IA ajuda com isso! ✨
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-3 sm:px-4 lg:px-6 py-4 pb-24 lg:pb-8 max-w-6xl mx-auto w-full">
          {section === 'dashboard' && <Dashboard />}
          {section === 'wardrobe' && <Wardrobe />}
          {section === 'outfits' && <Outfits />}
          {section === 'laundry' && <Laundry />}
          {section === 'reserve' && <Reserve />}
          {section === 'travel' && <Travel />}
          {section === 'shopping' && <Shopping />}
          {section === 'stats' && <Stats />}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-8 h-16">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.id === 'laundry' && laundryBadge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center">
                      {laundryBadge}
                    </span>
                  )}
                  {item.id === 'reserve' && reserveBadge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[8px] font-bold rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center">
                      {reserveBadge}
                    </span>
                  )}
                </div>
                <span className="leading-none">{item.label}</span>
                {active && <span className="absolute top-0 inset-x-3 h-0.5 bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t bg-secondary/40 py-3 px-4 hidden lg:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-primary">ClosetAI</span>
            · feito com IA pra você arrumar sempre
          </p>
          <p className="flex items-center gap-3">
            <span>🤖 VLM + LLM</span>
            <span>· Next.js 16</span>
          </p>
        </div>
      </footer>

      <AddGarmentDialog open={addOpen} onOpenChange={setAddOpen} />
      <BatchAddDialog open={batchOpen} onOpenChange={setBatchOpen} />
    </div>
  );
}

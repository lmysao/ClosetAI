'use client';

import { CATEGORIES, STATUS_LABELS, FORMALITIES } from '@/lib/constants';
import type { Garment } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Heart, RotateCw } from 'lucide-react';

const statusColorMap: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
};

export function GarmentCard({
  garment,
  onClick,
  compact = false,
}: {
  garment: Garment;
  onClick?: () => void;
  compact?: boolean;
}) {
  const cat = CATEGORIES[garment.category];
  const status = STATUS_LABELS[garment.status as keyof typeof STATUS_LABELS] ?? STATUS_LABELS.disponivel;
  const formality = FORMALITIES[garment.formality as keyof typeof FORMALITIES];

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
        compact ? 'p-0' : 'p-2'
      )}
    >
      <div className={cn('relative bg-muted/40 rounded-md overflow-hidden', compact ? 'aspect-square' : 'aspect-square mb-2')}>
        <img
          src={garment.imageData}
          alt={garment.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* badges no canto */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {garment.favorite && (
            <span className="inline-flex items-center justify-center rounded-full bg-rose-500/90 text-white p-1 shadow-sm">
              <Heart className="h-3 w-3 fill-current" />
            </span>
          )}
          {garment.status === 'reusavel' && (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500/90 text-white p-1 shadow-sm" title="Pode reusar">
              <RotateCw className="h-3 w-3" />
            </span>
          )}
        </div>
        <div className="absolute bottom-1.5 left-1.5">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm', statusColorMap[status.color])}>
            {status.emoji} {status.label}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="space-y-1 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{cat?.emoji ?? '👕'}</span>
            <p className="text-xs font-medium leading-tight line-clamp-1">{garment.name}</p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {garment.color && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1 border border-black/10"
                  style={garment.colorHex?.startsWith('#') && garment.colorHex !== '#multicolor' ? { backgroundColor: garment.colorHex } : undefined}
                />
                {garment.color}
              </Badge>
            )}
            {formality && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                {formality.emoji} {formality.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Usada {garment.timesWorn}x</span>
            {garment.reuseCount > 0 && garment.status === 'reusavel' && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Reuso {garment.reuseCount}/{garment.maxReuses}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

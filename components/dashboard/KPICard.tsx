import React from 'react';
import { Card, CardContent } from '../ui/card';
import { IconMap } from '../../lib/icons';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  iconName: string;
}

export function KPICard({ label, value, trend, trendType, iconName }: KPICardProps) {
  const Icon = IconMap[iconName] || Minus;

  return (
    <Card className="erp-card overflow-hidden group hover:border-primary/30 transition-all duration-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 group-hover:text-primary/60 transition-colors">
              {label}
            </p>
            <h3 className="text-3xl font-black tracking-tight text-foreground tabular-nums opacity-90">
              {value}
            </h3>

            {trend !== undefined && (
              <div className="flex items-center gap-1.5 pt-2.5">
                <div className={cn(
                  "flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-colors",
                  trendType === 'up'
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : trendType === 'down'
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-muted/30 text-muted-foreground border-border/40"
                )}>
                  {trendType === 'up' && <TrendingUp size={10} strokeWidth={3} />}
                  {trendType === 'down' && <TrendingDown size={10} strokeWidth={3} />}
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                  vs period
                </span>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-2xl bg-muted/10 border border-border/50 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group-hover:bg-primary/5 group-hover:border-primary/20 transition-all text-primary/60">
            <Icon size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

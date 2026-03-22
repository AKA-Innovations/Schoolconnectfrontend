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
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>

            {trend !== undefined && (
              <div className="flex items-center mt-2">
                {trendType === 'up' && <TrendingUp size={14} className="text-secondary mr-1" />}
                {trendType === 'down' && <TrendingDown size={14} className="text-destructive mr-1" />}
                {trendType === 'neutral' && <Minus size={14} className="text-muted-foreground mr-1" />}
                <span className={cn(
                  "text-xs font-medium",
                  trendType === 'up' ? "text-secondary" : trendType === 'down' ? "text-destructive" : "text-muted-foreground"
                )}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
                <span className="text-[10px] text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

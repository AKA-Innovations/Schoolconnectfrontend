import React from 'react';
import { KPICard } from './KPICard';
import { Skeleton } from '../ui/skeleton';

interface StatsRowProps {
  stats?: {
    label: string;
    value: string | number;
    trend?: number;
    trendType?: 'up' | 'down' | 'neutral';
    iconName: string;
  }[];
  isLoading?: boolean;
}

export function StatsRow({ stats, isLoading }: StatsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats?.map((stat, idx) => (
        <KPICard key={idx} {...stat} />
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

interface ClassSummaryItem {
  className: string;
  sectionCount: number;
  subjectCount: number;
  teacherCount: number;
  covered: boolean;
}

interface OverviewTabProps {
  isLoading: boolean;
  classSummary: ClassSummaryItem[];
  classSections: any[];
  onClassClick: (className: string) => void;
}

export function OverviewTab({ isLoading, classSummary, classSections, onClassClick }: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="erp-card border-none bg-white/40">
            <CardContent className="p-6">
              <div className="h-28 animate-pulse bg-slate-50 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (classSummary.length === 0) {
    return (
      <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
        <CardContent className="p-12 text-center">
          <GraduationCap className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-muted-foreground">No classes have been configured yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classSummary.map((cls) => (
        <Card
          key={cls.className}
          onClick={() => onClassClick(cls.className)}
          className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.01] cursor-pointer transition-all duration-500 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">{cls.className}</h3>
              {cls.covered ? (
                <Badge className="rounded-lg bg-emerald-100 text-emerald-700 border-0 text-[10px] font-bold">
                  Fully Mapped
                </Badge>
              ) : (
                <Badge className="rounded-lg bg-amber-100 text-amber-700 border-0 text-[10px] font-bold">
                  Incomplete
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Sections', value: cls.sectionCount },
                { label: 'Subjects', value: cls.subjectCount },
                { label: 'Teachers', value: cls.teacherCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-50/80 rounded-xl py-2.5 group-hover:bg-primary/5 transition-colors"
                >
                  <p className="text-base font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {classSections
                .filter((cs) => cs.className === cls.className)
                .map((cs) => (
                  <Badge key={cs.id} variant="outline" className="text-[10px] rounded-md">
                    {cs.sectionName}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

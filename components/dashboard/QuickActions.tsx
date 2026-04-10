import React from 'react';
import { Button } from '../ui/button';
import { LucideIcon, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Action {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface QuickActionsProps {
  actions: Action[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="erp-card bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-6 px-6">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
          Control Panel
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2.5 pb-6 px-6">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant="secondary"
            className="justify-between group h-11 px-4 rounded-xl bg-background/50 border border-border/40 hover:bg-background hover:border-primary/20 transition-all duration-500 shadow-sm"
            onClick={action.onClick}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-muted/10 group-hover:bg-primary/5 flex items-center justify-center mr-3.5 border border-border/30 group-hover:border-primary/20 transition-all">
                <action.icon size={14} strokeWidth={2.5} className="text-muted-foreground/60 group-hover:text-primary/70 transition-colors" />
              </div>
              <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground group-hover:translate-x-0.5 transition-all">{action.label}</span>
            </div>
            <Plus size={14} strokeWidth={3} className="text-muted-foreground/20 group-hover:text-primary transition-all group-hover:rotate-90" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

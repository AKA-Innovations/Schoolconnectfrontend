import React from 'react';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {actions.map((action, idx) => (
          <Button 
            key={idx} 
            variant={action.variant || 'outline'} 
            className="justify-start shadow-sm"
            onClick={action.onClick}
          >
            <action.icon size={18} className="mr-3" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

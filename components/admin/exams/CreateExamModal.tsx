'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCreateExam } from '@/services/exam/mutations';
import { transformExamCreationToPayloads } from '@/services/exam/transformers';
import { AlertCircle } from 'lucide-react';

const AVAILABLE_TYPES = ['Theory', 'Practical', 'Viva', 'Internal', 'Oral'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: string;
}

export function CreateExamModal({ isOpen, onClose, session }: Props) {
  const [examName, setExamName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Theory']);
  
  const createExamMutation = useCreateExam();

  if (!isOpen) return null;

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (!examName || selectedTypes.length === 0) return;

    const payloads = transformExamCreationToPayloads(session, examName, selectedTypes);
    
    try {
      // Create all exam rows in parallel based on selected components
      await Promise.all(payloads.map(payload => createExamMutation.mutateAsync(payload)));
      
      setExamName('');
      setSelectedTypes(['Theory']);
      onClose();
    } catch (error) {
      console.error('Failed to create exams', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg p-4">
      <Card className="w-full max-w-md rounded-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-xl font-bold tracking-tight">Create New Exam</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="examName" className="font-semibold text-foreground">Exam Name</Label>
            <Input
              id="examName"
              placeholder="e.g., First Term, Half Yearly"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-foreground">Exam Components</Label>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Select all components applicable for this exam
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {AVAILABLE_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/5">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleToggleType(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-medium cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
        <CardFooter className="border-t border-border/50 p-6 flex justify-end gap-3 bg-muted/5 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
            disabled={createExamMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-xl bg-primary hover:bg-primary/90"
            disabled={!examName || selectedTypes.length === 0 || createExamMutation.isPending}
          >
            {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

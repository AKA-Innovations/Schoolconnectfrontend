'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateExam } from '@/services/exam/mutations';
import { useExamTypes } from '@/services/exam/queries';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/datepicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: string;
  onSuccess?: () => void;
}

export function CreateExamModal({ isOpen, onClose, session, onSuccess }: Props) {
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState<string>('UNIT_TEST');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comment, setComment] = useState('');
  
  const createExamMutation = useCreateExam();
  const { data: fetchedExamTypes } = useExamTypes();

  const typesArray = React.useMemo(() => {
    return Array.isArray(fetchedExamTypes) 
      ? fetchedExamTypes 
      : (fetchedExamTypes as any)?.items || [];
  }, [fetchedExamTypes]);

  // Sync active examType to first element in user defined list if available
  React.useEffect(() => {
    if (typesArray.length > 0 && !examType) {
      setExamType(typesArray[0].name);
    } else if (typesArray.length > 0 && !typesArray.some((t: any) => t.name === examType)) {
      setExamType(typesArray[0].name);
    }
  }, [typesArray, examType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    try {
      await createExamMutation.mutateAsync({
        session,
        examName: examName.trim(),
        examType: examType as any,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        comment: comment.trim() || undefined,
      });
      
      toast.success('Exam session created successfully');
      setExamName('');
      setStartDate('');
      setEndDate('');
      setComment('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create exam session');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="rounded-2xl border border-border shadow-lg bg-card animate-in zoom-in-95 duration-200">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-xl font-bold tracking-tight">Create New Exam Session</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="examName" className="font-semibold text-foreground text-xs uppercase tracking-wider">Exam Name</Label>
              <Input
                id="examName"
                placeholder="e.g., First Term, Annual Examination"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-foreground text-xs uppercase tracking-wider">Exam Category</Label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {typesArray.map((t: any) => (
                  <option key={t.id} value={t.name}>{t.name.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-semibold text-foreground text-xs uppercase tracking-wider">Start Date</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select Start Date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-semibold text-foreground text-xs uppercase tracking-wider">End Date</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select End Date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="font-semibold text-foreground text-xs uppercase tracking-wider">Comments</Label>
              <Input
                id="comment"
                placeholder="Optional notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

          </CardContent>
          <CardFooter className="border-t border-border/50 p-6 flex justify-end gap-3 bg-muted/5 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-primary hover:bg-primary/90"
              disabled={createExamMutation.isPending}
            >
              {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

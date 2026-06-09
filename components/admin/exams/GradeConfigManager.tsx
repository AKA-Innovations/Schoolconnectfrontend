'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGradeConfig } from '@/services/exam/queries';
import { useConfigureGrades, useDeleteGrade } from '@/services/exam/mutations';
import { Plus, Trash2, RefreshCw, Save, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { GradeMstrItemDto } from '@/types/exam.types';

interface Props {
  session: string;
}

export function GradeConfigManager({ session }: Props) {
  const { data: gradesData = [], isLoading, refetch, isFetching } = useGradeConfig(session);
  const configureMutation = useConfigureGrades();
  const deleteMutation = useDeleteGrade();

  const [grades, setGrades] = useState<GradeMstrItemDto[]>([]);

  useEffect(() => {
    if (gradesData.length > 0) {
      setGrades(
        gradesData.map(g => ({
          gradeName: g.gradeName,
          minPercentage: g.minPercentage,
          maxPercentage: g.maxPercentage,
          gradePoint: g.gradePoint,
          remarks: g.remarks || '',
        }))
      );
    } else {
      setGrades([
        { gradeName: 'A1', minPercentage: 91, maxPercentage: 100, gradePoint: 10, remarks: 'Outstanding' },
        { gradeName: 'A2', minPercentage: 81, maxPercentage: 90, gradePoint: 9, remarks: 'Excellent' },
        { gradeName: 'B1', minPercentage: 71, maxPercentage: 80, gradePoint: 8, remarks: 'Very Good' },
        { gradeName: 'B2', minPercentage: 61, maxPercentage: 70, gradePoint: 7, remarks: 'Good' },
        { gradeName: 'C1', minPercentage: 51, maxPercentage: 60, gradePoint: 6, remarks: 'Satisfactory' },
        { gradeName: 'C2', minPercentage: 41, maxPercentage: 50, gradePoint: 5, remarks: 'Passable' },
        { gradeName: 'D', minPercentage: 33, maxPercentage: 40, gradePoint: 4, remarks: 'Needs Improvement' },
        { gradeName: 'E', minPercentage: 0, maxPercentage: 32, gradePoint: 0, remarks: 'Failed' },
      ]);
    }
  }, [gradesData]);

  const handleAddField = () => {
    setGrades(prev => [
      ...prev,
      { gradeName: '', minPercentage: 0, maxPercentage: 100, gradePoint: 0, remarks: '' },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setGrades(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof GradeMstrItemDto, value: any) => {
    setGrades(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    // Validate grades range integrity
    for (const g of grades) {
      if (!g.gradeName.trim()) {
        toast.error('Grade name is required');
        return;
      }
      if (g.minPercentage < 0 || g.maxPercentage > 100 || g.minPercentage > g.maxPercentage) {
        toast.error(`Invalid percentage range for grade ${g.gradeName}`);
        return;
      }
    }

    try {
      await configureMutation.mutateAsync({
        session,
        grades,
      });
      toast.success('Grade configuration updated successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to configure grades');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Grade Scale Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Establish percentage ranges and equivalent grade labels used in report cards for {session}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="rounded-xl h-10 w-10 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl bg-primary hover:bg-primary/90 gap-2"
            disabled={configureMutation.isPending}
          >
            <Save className="h-4 w-4" />
            Save Grade Scheme
          </Button>
        </div>
      </div>

      {/* Visual Grade Band Scale */}
      <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6">
        <h3 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wider">Visual Grade Scale</h3>
        <div className="relative h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex border border-border">
          {grades
            .sort((a, b) => b.minPercentage - a.minPercentage)
            .map((g, index) => {
              const width = g.maxPercentage - g.minPercentage;
              if (width <= 0) return null;
              // Generate simple color variation
              const colors = [
                'bg-emerald-500/80 text-emerald-950',
                'bg-teal-500/80 text-teal-950',
                'bg-cyan-500/80 text-cyan-950',
                'bg-sky-500/80 text-sky-950',
                'bg-blue-500/80 text-blue-950',
                'bg-indigo-500/80 text-indigo-950',
                'bg-amber-500/80 text-amber-950',
                'bg-rose-500/80 text-rose-950',
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={index}
                  style={{ width: `${width}%` }}
                  className={`h-full flex items-center justify-center text-xs font-bold ${color}`}
                  title={`${g.gradeName}: ${g.minPercentage}% - ${g.maxPercentage}%`}
                >
                  {g.gradeName}
                </div>
              );
            })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Visual scale represents the relative width of each grade band percentage range.
        </p>
      </Card>

      {/* Table Editor */}
      <Card className="rounded-2xl border border-border/80 shadow-sm bg-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">Grade Definitions</CardTitle>
              <CardDescription className="text-xs">Edit minimum and maximum percentages for each grade.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddField} className="rounded-lg gap-2 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Grade Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading grade scale...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="p-4 px-6 w-24">Grade</th>
                    <th className="p-4 w-32">Min %</th>
                    <th className="p-4 w-32">Max %</th>
                    <th className="p-4 w-32">Grade Point</th>
                    <th className="p-4">Remarks</th>
                    <th className="p-4 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {grades.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/5 transition-colors">
                      <td className="p-3 px-6">
                        <Input
                          value={item.gradeName}
                          onChange={(e) => handleFieldChange(index, 'gradeName', e.target.value)}
                          className="h-9 rounded-lg font-bold text-center"
                          placeholder="Label"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.minPercentage}
                          onChange={(e) => handleFieldChange(index, 'minPercentage', Number(e.target.value))}
                          className="h-9 rounded-lg"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.maxPercentage}
                          onChange={(e) => handleFieldChange(index, 'maxPercentage', Number(e.target.value))}
                          className="h-9 rounded-lg"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.gradePoint ?? 0}
                          onChange={(e) => handleFieldChange(index, 'gradePoint', Number(e.target.value))}
                          className="h-9 rounded-lg"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={item.remarks}
                          onChange={(e) => handleFieldChange(index, 'remarks', e.target.value)}
                          className="h-9 rounded-lg"
                          placeholder="e.g. Excellent"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveField(index)}
                          className="rounded-lg h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

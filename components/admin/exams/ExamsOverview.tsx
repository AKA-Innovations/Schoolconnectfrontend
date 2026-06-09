'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExams } from '@/services/exam/queries';
import { useUpdateExam, useDeleteExam } from '@/services/exam/mutations';
import { Plus, RefreshCw, AlertCircle, Calendar, Trash2, Globe, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateExamModal } from './CreateExamModal';
import { ExamMaster } from '@/types/exam.types';
import { toast } from 'sonner';

interface Props {
  session: string;
}

export function ExamsOverview({ session }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: exams = [], isLoading, isFetching, refetch } = useExams(session);
  const deleteMutation = useDeleteExam();
  const updateMutation = useUpdateExam();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam? All associated configurations, schedules, and marks will be lost.')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Exam deleted successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleTogglePublish = async (exam: ExamMaster) => {
    try {
      await updateMutation.mutateAsync({
        id: exam.id,
        data: { isPublished: !exam.isPublished }
      });
      toast.success(`Exam results ${!exam.isPublished ? 'published' : 'unpublished'} successfully`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update publication status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exam Master</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage main academic exams and components for the session {session}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="rounded-xl h-10 w-10 shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button 
            className="rounded-xl bg-primary hover:bg-primary/90 gap-2" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Exam Session
          </Button>
        </div>
      </div>

      {/* List */}
      <Card className="rounded-2xl border border-border/80 shadow-sm overflow-hidden bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold">Configured Exams</CardTitle>
          <CardDescription className="text-xs">
            {exams.length} examinations registered in academic year {session}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p>No exams found for session {session}. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {exams.map((exam: any) => (
                <Card key={exam.id} className="rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${exam.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <CardHeader className="pb-3 px-5 pt-5">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                      {exam.examName}
                      <Badge variant="outline" className="text-[10px] uppercase font-bold rounded-lg tracking-wider">
                        {exam.examType}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3" />
                      {exam.startDate ? new Date(exam.startDate).toLocaleDateString() : 'TBD'} - {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : 'TBD'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {exam.isPublished ? (
                          <span className="text-xs text-green-600 flex items-center gap-1 font-semibold">
                            <Globe className="h-3.5 w-3.5" /> Published
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 flex items-center gap-1 font-semibold">
                            <Lock className="h-3.5 w-3.5" /> Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(exam)}
                          className={cn(
                            "rounded-lg text-xs h-8 px-2.5",
                            exam.isPublished ? "hover:bg-amber-50 hover:text-amber-600 text-muted-foreground" : "hover:bg-green-50 hover:text-green-600 text-muted-foreground"
                          )}
                          title={exam.isPublished ? "Unpublish results" : "Publish results"}
                        >
                          {exam.isPublished ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exam.id)}
                          className="rounded-lg text-xs h-8 px-2.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateExamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        session={session}
        onSuccess={refetch}
      />
    </div>
  );
}

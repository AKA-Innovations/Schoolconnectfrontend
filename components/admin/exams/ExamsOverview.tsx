'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExams } from '@/services/exam/queries';
import { groupExamsByName } from '@/services/exam/transformers';
import { Plus, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateExamModal } from './CreateExamModal';
import { ExamGroup } from '@/types/exam.types';

export function ExamsOverview() {
  const [session, setSession] = useState('2026-27'); // In a real app, this comes from context
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useExams(session);

  const exams = data || [];
  const groupedExams: ExamGroup[] = groupExamsByName(exams);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Exam Master</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage school exams and components for {session}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="rounded-xl h-10 w-10"
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button 
            className="rounded-xl bg-primary hover:bg-primary/90 gap-2" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Exam
          </Button>
        </div>
      </div>

      {/* Exams List */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Exam Sessions</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            {groupedExams.length} exam groups found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading exams...</p>
            </div>
          ) : groupedExams.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground">No exams found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {groupedExams.map((group, index) => (
                <Card key={index} className="rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center justify-between">
                      {group.examName}
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Components</p>
                        <div className="flex flex-wrap gap-2">
                          {group.types.map(exam => (
                            <Badge key={exam.id} variant="secondary" className="bg-primary/10 text-primary border-0">
                              {exam.examType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50 flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                          Archive
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
      />
    </div>
  );
}

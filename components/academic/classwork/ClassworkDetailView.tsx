'use client';

import React from 'react';
import { ArrowLeft, Calendar, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/dateUtils';
import type { Classwork } from '@/services/academic/types';
import { useSubjectTopics } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';

interface Props {
  classwork: Classwork & {
    className?: string;
    sectionName?: string;
    subjectName?: string;
    chapterName?: string;
    topicName?: string;
    teacherName?: string;
  };
  onBack: () => void;
}

export function ClassworkDetailView({ classwork, onBack }: Props) {
  const { data: topics = [] } = useSubjectTopics(
    classwork.chapterId || undefined,
    classwork.subjectId || undefined,
    classwork.session || CURRENT_SESSION
  );

  const matchedTopic = topics.find(t => t.id === classwork.topicId);
  const topicName = matchedTopic?.topicName || (classwork.topicId ? `Topic #${classwork.topicId}` : undefined);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={18} /> Back to Classwork List
      </Button>

      {/* Header card */}
      <Card className="rounded-[2rem]">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Classwork Details</CardTitle>
                {classwork.subjectName && (
                  <Badge className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wide">
                    {classwork.subjectName}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {classwork.className && (
                  <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
                    Grade {classwork.className}-{classwork.sectionName || ''}
                  </Badge>
                )}
                {classwork.chapterName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <BookOpen size={14} className="text-slate-400" />
                    <span className="font-medium">Chapter: {classwork.chapterName}</span>
                  </div>
                )}
                {topicName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <BookOpen size={14} className="text-slate-400" />
                    <span className="font-medium">Topic: {topicName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Conducted On: {formatDate(new Date(classwork.conductedOn), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User size={14} className="text-slate-400" />
                  <span>Teacher: {classwork.teacherName || classwork.teacherId?.slice(0, 8) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description / What was covered</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{classwork.description || 'No description provided.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

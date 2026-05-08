'use client';

import React from 'react';
import { ArrowLeft, Calendar, User, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { useHomeworkDocuments, useHomeworkSubmissions } from '@/hooks/useAcademic';
import { formatDate } from '@/lib/dateUtils';
import type { Homework } from '@/services/academic/types';

interface Props {
  homework: Homework;
  onBack: () => void;
}

export function HomeworkDetailView({ homework, onBack }: Props) {
  const { data: documents, isLoading: docsLoading } = useHomeworkDocuments(homework.id);
  const { data: submissions, isLoading: subsLoading } = useHomeworkSubmissions(homework.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={18} /> Back to Homework List
      </Button>

      {/* Header card */}
      <Card className="rounded-[2rem]">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl">{homework.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">
                  {homework.className} – {homework.sectionName}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={14} />{formatDate(new Date(homework.dueDate), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User size={14} />{homework.assignedBy.slice(0, 8)}…
                </div>
              </div>
            </div>
            <StatusBadge status={new Date(homework.dueDate) < new Date() ? 'overdue' : 'active'} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{homework.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Documents */}
        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={18} className="text-teal-500" /> Documents ({documents?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
            ) : !documents?.length ? (
              <p className="text-sm text-slate-400 py-8 text-center">No documents uploaded</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <FileText size={18} className="text-teal-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{doc.documentUrl.split('/').pop()}</p>
                      <p className="text-[10px] text-slate-400">Student: {doc.studentId.slice(0, 8)}…</p>
                    </div>
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Download size={14} /></Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User size={18} className="text-blue-500" /> Submissions ({submissions?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
            ) : !submissions?.length ? (
              <p className="text-sm text-slate-400 py-8 text-center">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {sub.studentId.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700">Student: {sub.studentId.slice(0, 8)}…</p>
                      {sub.remarks && <p className="text-[10px] text-slate-400 truncate">{sub.remarks}</p>}
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

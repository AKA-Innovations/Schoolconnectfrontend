'use client';

import React, { useMemo, useState } from 'react';
import { Edit, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AcademicTable, type ColumnDef } from '../shared/AcademicTable';
import { StatusBadge } from '../shared/StatusBadge';
import { useChapterProgress } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';
import type { SubjectChapter } from '@/services/academic/types';
import { useAuthStore } from '@/store/authStore';

interface Props {
  chapters: SubjectChapter[];
  classSectionId?: number;
  isLoading: boolean;
  onEdit: (ch: SubjectChapter) => void;
}

function ChapterProgressRow({ 
  chapter, 
  classSectionId, 
  onEdit 
}: { 
  chapter: SubjectChapter; 
  classSectionId?: number;
  onEdit: (ch: SubjectChapter) => void;
}) {
  const { data: progress } = useChapterProgress(chapter.id, classSectionId, CURRENT_SESSION);
  const [isExpanded, setIsExpanded] = useState(false);
  const role = useAuthStore((s) => s.role);
  const canEdit = role === 'teacher' || role === 'subject_coordinator';

  const displayProgress = useMemo(() => {
    if (!progress) return null;
    
    const topics = progress.topics || [];
    const topicsCount = topics.length;
    
    let completionPercentage = progress.completionPercentage;
    if ((completionPercentage === undefined || completionPercentage === null || completionPercentage === 0) && topicsCount > 0) {
      const total = topics.reduce((acc, t) => acc + (t.completionPercentage || 0), 0);
      completionPercentage = Math.round(total / topicsCount);
    }

    let status = progress.status;
    if (!status && topicsCount > 0) {
      const allCompleted = topics.every(t => t.status === 'completed' || t.completionPercentage === 100);
      const allNotStarted = topics.every(t => t.status === 'not_started' || (t.completionPercentage || 0) === 0);
      if (allCompleted) {
        status = 'completed';
      } else if (allNotStarted) {
        status = 'not_started';
      } else {
        status = 'IN_PROGRESS';
      }
    } else if (!status) {
      status = 'not_started';
    }

    return {
      ...progress,
      completionPercentage: completionPercentage || 0,
      status,
      topicsCount
    };
  }, [progress]);

  return (
    <tr className="border-b border-border/30 hover:bg-muted/5 transition-colors group">
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1">
          <div 
            className="flex items-center gap-2 cursor-pointer group/title" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {displayProgress?.topics && displayProgress.topics.length > 0 ? (
              isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
            ) : <div className="w-3.5" />}
            <span className="font-bold text-slate-900 group-hover/title:text-teal-600 transition-colors">{chapter.chapterName}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight ml-5">Sequence #{chapter.sequenceNo}</span>
          
          {/* Topic Progress List - Collapsible */}
          {isExpanded && displayProgress?.topics && displayProgress.topics.length > 0 && (
            <div className="mt-2 ml-5 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {displayProgress.topics.map((topic) => (
                <div key={topic.topicId} className="flex items-center justify-between gap-4 p-1.5 rounded-lg bg-slate-50/50 border border-slate-100/50">
                  <span className="text-[10px] font-medium text-slate-600 truncate max-w-[150px]" title={topic.topicName}>
                    {topic.topicName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-400"
                        style={{ width: `${topic.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{topic.completionPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        {displayProgress ? (
           <div className="flex flex-col items-center gap-1">
             <span className="text-xs font-bold text-slate-700">{displayProgress.completionPercentage || 0}%</span>
             <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-teal-500 rounded-full transition-all duration-500"
                 style={{ width: `${displayProgress.completionPercentage || 0}%` }}
               />
             </div>
           </div>
        ) : (
          <span className="text-xs text-slate-400">Loading...</span>
        )}
      </td>
      <td className="py-4 px-6">
        {displayProgress ? (
          <StatusBadge status={displayProgress.status} />
        ) : (
          <Badge variant="outline" className="text-[10px] text-slate-300">Pending</Badge>
        )}
      </td>
      <td className="py-4 px-6">
        {displayProgress ? (
          <span className="text-xs text-slate-500">{displayProgress.topicsCount || 0} Topics</span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>
      {canEdit && (
        <td className="py-4 px-6 text-right">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md opacity-0 group-hover:opacity-100 transition-all"
            onClick={() => onEdit(chapter)}
          >
            <Edit size={16} className="text-slate-400" />
          </Button>
        </td>
      )}
    </tr>
  );
}

export const ChapterProgressTable = React.memo(function ChapterProgressTable({ 
  chapters, 
  classSectionId,
  isLoading, 
  onEdit 
}: Props) {
  const role = useAuthStore((s) => s.role);
  const canEdit = role === 'teacher' || role === 'subject_coordinator';

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center bg-white rounded-3xl shadow-sm">
        <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl shadow-sm border border-dashed border-slate-200">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-200" />
        <p className="text-sm font-bold text-slate-400">No chapters found for this subject.</p>
        <p className="text-xs text-slate-300 mt-1">Configure syllabus in the Curriculum section.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Chapter</th>
            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Progress</th>
            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Coverage</th>
            {canEdit && <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {chapters.map((ch) => (
            <ChapterProgressRow 
              key={ch.id} 
              chapter={ch} 
              classSectionId={classSectionId} 
              onEdit={onEdit} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

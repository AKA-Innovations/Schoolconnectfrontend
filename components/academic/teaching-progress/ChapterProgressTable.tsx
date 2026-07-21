'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { useChapterProgress, useCreateProgress, useUpdateProgress } from '@/hooks/useAcademic';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';
import type { SubjectChapter } from '@/services/academic/types';
import { useAuthStore } from '@/store/authStore';

interface Props {
  chapters: SubjectChapter[];
  classSectionId?: number;
  isLoading: boolean;
  canEdit?: boolean;
}

function InlineTopicProgressItem({
  topic,
  chapterId,
  classSectionId,
  subjectId,
  canEdit
}: {
  topic: any;
  chapterId: number;
  classSectionId?: number;
  subjectId?: number;
  canEdit: boolean;
}) {
  const [percentage, setPercentage] = useState(topic.completionPercentage || 0);
  const [status, setStatus] = useState(topic.status || 'not_started');

  const createMutation = useCreateProgress();
  const updateMutation = useUpdateProgress();

  useEffect(() => {
    setPercentage(topic.completionPercentage || 0);
    setStatus(topic.status || 'not_started');
  }, [topic.completionPercentage, topic.status]);

  const handleSave = async (newPct: number, newStatus: string) => {
    if (!classSectionId || !subjectId) return;

    try {
      if (topic.id) {
        await updateMutation.mutateAsync({
          id: topic.id,
          data: {
            status: newStatus,
            completionPercentage: newPct,
            ...(newStatus === 'completed' ? { completedOn: new Date().toISOString() } : {}),
          }
        });
      } else {
        await createMutation.mutateAsync({
          session: CURRENT_SESSION,
          classSectionId,
          subjectId,
          chapterId,
          topicId: topic.topicId,
          status: newStatus,
          completionPercentage: newPct,
        });
      }
      toast.success(`Updated progress for "${topic.topicName}"`);
    } catch (err: any) {
      toast.error('Failed to update topic progress');
    }
  };

  const trackStyle = {
    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
  };

  if (!canEdit) {
    return (
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-xs font-semibold text-slate-700">{topic.topicName}</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600" style={{ width: `${percentage}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{percentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 w-full hover:bg-slate-100/40 transition-colors">
      <span className="text-xs font-bold text-slate-800 md:w-1/3 truncate" title={topic.topicName}>
        {topic.topicName}
      </span>
      <div className="flex-1 flex items-center gap-4 min-w-[280px]">
        {/* Solid filled Range Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => {
            const val = Number(e.target.value);
            setPercentage(val);
            setStatus(val === 100 ? 'completed' : val > 0 ? 'IN_PROGRESS' : 'not_started');
          }}
          onMouseUp={() => handleSave(percentage, status)}
          onTouchEnd={() => handleSave(percentage, status)}
          style={trackStyle}
          className="flex-1 accent-teal-600 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
        />
        <span className="text-xs font-bold text-teal-600 w-10 text-right">{percentage}%</span>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => {
            const nextStatus = e.target.value;
            const nextPct = nextStatus === 'completed' ? 100 : nextStatus === 'not_started' ? 0 : percentage || 50;
            setStatus(nextStatus);
            setPercentage(nextPct);
            handleSave(nextPct, nextStatus);
          }}
          className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
        >
          <option value="not_started">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}

function ChapterProgressRow({ 
  chapter, 
  classSectionId,
  canEdit: canEditProp
}: { 
  chapter: SubjectChapter; 
  classSectionId?: number;
  canEdit?: boolean;
}) {
  const { data: progress } = useChapterProgress(chapter.id, classSectionId, CURRENT_SESSION);
  const [isExpanded, setIsExpanded] = useState(false);
  const role = useAuthStore((s) => s.role);
  const canEdit = canEditProp !== undefined ? canEditProp : (role === 'teacher' || role === 'subject_coordinator');

  const createMutation = useCreateProgress();
  const updateMutation = useUpdateProgress();

  const [chapterPct, setChapterPct] = useState(0);
  const [chapterStatus, setChapterStatus] = useState('not_started');

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

  useEffect(() => {
    if (displayProgress) {
      setChapterPct(displayProgress.completionPercentage || 0);
      setChapterStatus(displayProgress.status || 'not_started');
    }
  }, [displayProgress]);

  const handleSaveChapter = async (newPct: number, newStatus: string) => {
    if (!classSectionId) return;
    const subjectId = Number(chapter.subjectId);

    try {
      if (progress && progress.id) {
        await updateMutation.mutateAsync({
          id: progress.id,
          data: {
            status: newStatus,
            completionPercentage: newPct,
            ...(newStatus === 'completed' ? { completedOn: new Date().toISOString() } : {}),
          }
        });
      } else {
        await createMutation.mutateAsync({
          session: CURRENT_SESSION,
          classSectionId,
          subjectId,
          chapterId: chapter.id,
          status: newStatus,
          completionPercentage: newPct,
        });
      }
      toast.success(`Updated progress for chapter "${chapter.chapterName}"`);
    } catch (err: any) {
      toast.error('Failed to update chapter progress');
    }
  };

  const hasTopics = displayProgress?.topics && displayProgress.topics.length > 0;

  const trackStyle = {
    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${chapterPct}%, #e2e8f0 ${chapterPct}%, #e2e8f0 100%)`
  };

  return (
    <>
      <tr className="border-b border-border/30 hover:bg-muted/5 transition-colors group">
        <td className="py-4 px-6">
          <div className="flex flex-col gap-1">
            <div 
              className="flex items-center gap-2 cursor-pointer group/title" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {hasTopics ? (
                isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
              ) : <div className="w-3.5" />}
              <span className="font-bold text-slate-900 group-hover/title:text-teal-600 transition-colors">{chapter.chapterName}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight ml-5">Sequence #{chapter.sequenceNo}</span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-end gap-4">
            {displayProgress ? (
              canEdit && !hasTopics ? (
                <div className="flex items-center gap-4 min-w-[280px] w-1/2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chapterPct}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setChapterPct(val);
                      setChapterStatus(val === 100 ? 'completed' : val > 0 ? 'IN_PROGRESS' : 'not_started');
                    }}
                    onMouseUp={() => handleSaveChapter(chapterPct, chapterStatus)}
                    onTouchEnd={() => handleSaveChapter(chapterPct, chapterStatus)}
                    style={trackStyle}
                    className="flex-1 accent-teal-600 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
                  />
                  <span className="text-xs font-bold text-teal-600 w-10 text-right">{chapterPct}%</span>

                  <select
                    value={chapterStatus}
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      const nextPct = nextStatus === 'completed' ? 100 : nextStatus === 'not_started' ? 0 : chapterPct || 50;
                      setChapterStatus(nextStatus);
                      setChapterPct(nextPct);
                      handleSaveChapter(nextPct, nextStatus);
                    }}
                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 pr-4">
                  <span className="text-sm font-bold text-teal-600">{displayProgress.completionPercentage || 0}% Completed</span>
                </div>
              )
            ) : (
              <span className="text-xs text-slate-400">Loading...</span>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded sub-topics spanning all columns */}
      {isExpanded && hasTopics && (
        <tr className="bg-slate-50/40">
          <td colSpan={2} className="py-3 pl-12 pr-6 border-b border-border/20">
            <div className="space-y-2 w-full animate-in fade-in slide-in-from-top-1 duration-200">
              {displayProgress?.topics?.map((topic) => (
                <InlineTopicProgressItem
                  key={topic.topicId}
                  topic={topic}
                  chapterId={chapter.id}
                  classSectionId={classSectionId}
                  subjectId={Number(chapter.subjectId)}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export const ChapterProgressTable = React.memo(function ChapterProgressTable({ 
  chapters, 
  classSectionId,
  isLoading,
  canEdit
}: Props) {
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
            <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right pr-12">Progress & Status</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((ch) => (
            <ChapterProgressRow 
              key={ch.id} 
              chapter={ch} 
              classSectionId={classSectionId} 
              canEdit={canEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

'use client';

import React from 'react';
import { BookOpen, Tag } from 'lucide-react';
import { useSubjectChapters, useSubjectTopics } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';

interface ChapterTopicTagProps {
  subjectId?: number | string;
  chapterId?: number | string | null;
  topicId?: number | string | null;
  chapterName?: string;
  topicName?: string;
  className?: string;
  showIcon?: boolean;
}

export const ChapterTopicTag = React.memo(function ChapterTopicTag({
  subjectId,
  chapterId,
  topicId,
  chapterName: propChapterName,
  topicName: propTopicName,
  className = '',
  showIcon = true,
}: ChapterTopicTagProps) {
  // Fetch chapters if chapterId is present and propChapterName is not provided
  const shouldFetchChapters = !!subjectId && !!chapterId && !propChapterName;
  const { data: chapters = [] } = useSubjectChapters(
    shouldFetchChapters ? subjectId : undefined,
    CURRENT_SESSION
  );

  // Fetch topics if topicId and chapterId are present and propTopicName is not provided
  const shouldFetchTopics = !!subjectId && !!chapterId && !!topicId && !propTopicName;
  const { data: topics = [] } = useSubjectTopics(
    shouldFetchTopics ? chapterId : undefined,
    shouldFetchTopics ? subjectId : undefined,
    CURRENT_SESSION
  );

  const chapterName = propChapterName || (
    chapterId
      ? chapters.find((c) => String(c.id) === String(chapterId))?.chapterName
      : undefined
  );

  const topicName = propTopicName || (
    topicId
      ? topics.find((t) => String(t.id) === String(topicId))?.topicName
      : undefined
  );

  if (!chapterId && !topicId && !chapterName && !topicName) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {(chapterName || chapterId) && (
        <span className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200/60">
          {showIcon && <BookOpen className="h-3 w-3 text-teal-600 shrink-0" />}
          <span className="truncate max-w-[160px]">Ch: {chapterName || `Chapter #${chapterId}`}</span>
        </span>
      )}
      {(topicName || topicId) && (
        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md text-[11px] font-medium border border-teal-100">
          {showIcon && <Tag className="h-3 w-3 text-teal-600 shrink-0" />}
          <span className="truncate max-w-[160px]">Topic: {topicName || `Topic #${topicId}`}</span>
        </span>
      )}
    </div>
  );
});

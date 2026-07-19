'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateProgress, useUpdateProgress, useSubjectChapters, useSubjectTopics, useChapterProgress, useTeachingProgressList } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import type { TeachingProgress } from '@/services/academic/types';

interface FormValues {
  status: string;
  completionPercentage: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editItem: TeachingProgress | null;
  onSuccess: () => void;
  prefill?: {
    className: string;
    sectionName: string;
    subjectName: string;
    subjectId: string; // mapping ID (display name)
    classSectionId: number;
    subjectDtlsId: number;
  };
}

export const ProgressFormModal = React.memo(function ProgressFormModal({
  open, onOpenChange, editItem, onSuccess, prefill
}: Props) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateProgress();
  const updateMutation = useUpdateProgress();
  const isEditing = !!editItem && editItem.id !== 0;

  // ── Local state for dependent dropdowns ──
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  // The subjectDtlsId is used to load chapters from backend
  const subjectId = prefill?.subjectDtlsId;
  const classSectionId = prefill?.classSectionId;

  // ── Load chapters for the subject ──
  const { data: chapters = [], isLoading: loadingChapters } = useSubjectChapters(
    subjectId,
    CURRENT_SESSION
  );

  // ── Load topics for selected chapter ──
  const { data: topics = [], isLoading: loadingTopics } = useSubjectTopics(
    selectedChapterId || undefined,
    subjectId,
    CURRENT_SESSION
  );

  const { data: currentProgress } = useChapterProgress(
    selectedChapterId || undefined,
    classSectionId,
    CURRENT_SESSION
  );

  const { data: rawProgressList = [] } = useTeachingProgressList(
    user?.role === 'teacher' ? user.id : undefined
  );

  const { register, handleSubmit, reset, setValue, getValues, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      status: 'not_started',
      completionPercentage: 0
    }
  });

  const watchedStatus = watch('status');
  const [topicsProgressState, setTopicsProgressState] = useState<Record<string, { status: string; completionPercentage: number; id?: number }>>({});
  const lastInitializedChapterId = React.useRef<string>('');

  // Initialize topics progress state when chapter/topics change
  useEffect(() => {
    if (!isEditing && selectedChapterId) {
      if (lastInitializedChapterId.current === selectedChapterId && Object.keys(topicsProgressState).length > 0) {
        return; // Already initialized for this chapter, keep user changes
      }

      const initialState: typeof topicsProgressState = {};
      topics.forEach((topic) => {
        const foundMatch = rawProgressList.find(p => 
          p.classSectionId === classSectionId &&
          p.subjectId === subjectId &&
          String(p.chapterId) === selectedChapterId &&
          String(p.topicId) === String(topic.id)
        );

        if (foundMatch) {
          initialState[topic.id] = {
            id: foundMatch.id,
            status: foundMatch.status,
            completionPercentage: foundMatch.completionPercentage || 0,
          };
        } else {
          initialState[topic.id] = {
            status: 'not_started',
            completionPercentage: 0,
          };
        }
      });

      if (topics.length > 0) {
        setTopicsProgressState(initialState);
        lastInitializedChapterId.current = selectedChapterId;
      }
    } else {
      if (Object.keys(topicsProgressState).length > 0) {
        setTopicsProgressState({});
      }
      lastInitializedChapterId.current = '';
    }
  }, [selectedChapterId, topics, rawProgressList, classSectionId, subjectId, isEditing, topicsProgressState]);
  const lastSyncedKey = React.useRef<string>('');

  // Reset dropdowns when modal opens/closes or prefill changes
  useEffect(() => {
    if (editItem) {
      reset({
        status: editItem.status,
        completionPercentage: editItem.completionPercentage || 0,
      });
      setSelectedChapterId(editItem.chapterId ? String(editItem.chapterId) : '');
      setSelectedTopicId(editItem.topicId ? String(editItem.topicId) : '');
      lastSyncedKey.current = '';
      lastInitializedChapterId.current = '';
    } else if (open) {
      reset({
        status: 'not_started',
        completionPercentage: 0,
      });
      setSelectedChapterId('');
      setSelectedTopicId('');
      lastSyncedKey.current = '';
      lastInitializedChapterId.current = '';
    }
  }, [editItem, reset, open]);

  // Update form when chapter/topic selection changes based on rawProgressList or currentProgress fallback
  useEffect(() => {
    if (!isEditing && selectedChapterId) {
      const syncKey = `${selectedChapterId}-${selectedTopicId}`;
      if (lastSyncedKey.current === syncKey) {
        return; // Already synced this chapter/topic, do not overwrite user edits
      }

      const foundMatch = rawProgressList.find(p => 
        p.classSectionId === classSectionId &&
        p.subjectId === subjectId &&
        String(p.chapterId) === selectedChapterId &&
        (selectedTopicId ? String(p.topicId) === selectedTopicId : !p.topicId)
      );

      let targetPct = 0;
      let targetStatus = 'not_started';

      if (foundMatch) {
        targetPct = foundMatch.completionPercentage || 0;
        targetStatus = foundMatch.status || 'not_started';
      } else {
        // Fallback to currentProgress calculation if no raw match is loaded yet but we have it from chapter aggregates
        if (!selectedTopicId && currentProgress) {
          targetPct = currentProgress.completionPercentage || 0;
          targetStatus = currentProgress.status || 'not_started';
        } else if (selectedTopicId && currentProgress?.topics) {
          const topicProgress = currentProgress.topics.find(t => String(t.topicId) === selectedTopicId);
          if (topicProgress) {
            targetPct = topicProgress.completionPercentage || 0;
            targetStatus = topicProgress.status || 'not_started';
          }
        }
      }

      if (getValues('completionPercentage') !== targetPct) {
        setValue('completionPercentage', targetPct);
      }
      if (getValues('status') !== targetStatus) {
        setValue('status', targetStatus);
      }
      lastSyncedKey.current = syncKey;
    }
  }, [isEditing, selectedChapterId, selectedTopicId, rawProgressList, currentProgress, classSectionId, subjectId, setValue, getValues]);

  // Reset topic when chapter changes
  useEffect(() => {
    if (!isEditing) {
      setSelectedTopicId('');
    }
  }, [selectedChapterId, isEditing]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormValues) => {
    if (!classSectionId || !subjectId) {
      console.error('Missing required IDs for progress update:', {
        classSectionId,
        subjectId,
        prefill: !!prefill,
        isEditing
      });
      toast.error('Unable to resolve class/subject identifiers.');
      return;
    }

    // BULK MODE: If selected chapter has topics and not single-editing, save all topics at once
    if (!isEditing && selectedChapterId && topics.length > 0) {
      setIsSubmitting(true);
      try {
        const promises = topics.map(async (topic) => {
          const state = topicsProgressState[topic.id];
          if (!state) return;

          if (state.id) {
            // Update existing topic progress
            return updateMutation.mutateAsync({
              id: state.id,
              data: {
                status: state.status,
                completionPercentage: state.completionPercentage,
                ...(state.status === 'completed' ? { completedOn: new Date().toISOString() } : {}),
              }
            });
          } else {
            // Create new topic progress
            return createMutation.mutateAsync({
              session: CURRENT_SESSION,
              classSectionId: classSectionId,
              subjectId: subjectId,
              chapterId: Number(selectedChapterId),
              topicId: topic.id,
              status: state.status,
              completionPercentage: state.completionPercentage || 0,
            });
          }
        });
        await Promise.all(promises);
        toast.success('Successfully saved all topics progress');
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to save topics progress');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isEditing) {
      updateMutation.mutate(
        {
          id: editItem.id,
          data: {
            status: values.status,
            completionPercentage: values.completionPercentage,
            ...(values.status === 'completed' ? { completedOn: new Date().toISOString() } : {}),
          }
        },
        { onSuccess }
      );
    } else {
      if (!selectedChapterId) {
        toast.error('Please select a chapter.');
        return;
      }

      // Check if progress already exists for this topic/chapter using the rawProgressList source of truth
      let existingProgressId: number | undefined;
      const foundMatch = rawProgressList.find(p => 
        p.classSectionId === classSectionId &&
        p.subjectId === subjectId &&
        String(p.chapterId) === selectedChapterId &&
        (selectedTopicId ? String(p.topicId) === selectedTopicId : !p.topicId)
      );
      if (foundMatch && foundMatch.id) {
        existingProgressId = foundMatch.id;
      }

      // Fallback/alternative check using currentProgress query which has topic-level ids
      if (!existingProgressId && currentProgress) {
        if (selectedTopicId && currentProgress.topics) {
          const topicProgress = currentProgress.topics.find(t => String(t.topicId) === selectedTopicId);
          if (topicProgress && topicProgress.id) {
            existingProgressId = topicProgress.id;
          }
        } else if (!selectedTopicId && currentProgress.id) {
          existingProgressId = currentProgress.id;
        }
      }

      if (existingProgressId) {
        // Progress already exists — update instead of creating a duplicate
        updateMutation.mutate(
          {
            id: existingProgressId,
            data: {
              status: values.status,
              completionPercentage: values.completionPercentage,
              ...(values.status === 'completed' ? { completedOn: new Date().toISOString() } : {}),
            },
          },
          { onSuccess }
        );
      } else {
        createMutation.mutate(
          {
            session: CURRENT_SESSION,
            classSectionId: classSectionId,
            subjectId: subjectId,
            chapterId: Number(selectedChapterId),
            topicId: selectedTopicId ? Number(selectedTopicId) : undefined,
            status: values.status,
            completionPercentage: values.completionPercentage || 0,
          },
          { onSuccess }
        );
      }
    }
  };

  // Detect if we'll be updating existing progress (for UI feedback)
  const hasExistingProgress = useMemo(() => {
    if (isEditing) return false;
    const foundMatch = rawProgressList.find(p => 
      p.classSectionId === classSectionId &&
      p.subjectId === subjectId &&
      String(p.chapterId) === selectedChapterId &&
      (selectedTopicId ? String(p.topicId) === selectedTopicId : !p.topicId)
    );
    if (foundMatch && foundMatch.id) return true;

    if (currentProgress) {
      if (selectedTopicId && currentProgress.topics) {
        const topicProgress = currentProgress.topics.find(t => String(t.topicId) === selectedTopicId);
        if (topicProgress && topicProgress.id) {
          return true;
        }
      } else if (!selectedTopicId && currentProgress.id) {
        return true;
      }
    }
    return false;
  }, [isEditing, rawProgressList, classSectionId, subjectId, selectedChapterId, selectedTopicId, currentProgress]);

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing || hasExistingProgress ? 'Update Progress' : 'Log Progress'}</DialogTitle>
          {prefill && !isEditing && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50">
              Logging for: <span className="font-bold text-foreground">Class {prefill.className}-{prefill.sectionName}</span> | <span className="font-bold text-foreground">{prefill.subjectName}</span>
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <FormField label="Chapter" required>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                disabled={loadingChapters}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="">
                  {loadingChapters ? 'Loading chapters...' : '— Select Chapter —'}
                </option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={String(ch.id)}>
                    {ch.sequenceNo}. {ch.chapterName}
                  </option>
                ))}
                {!loadingChapters && chapters.length === 0 && (
                  <option disabled>No chapters found</option>
                )}
              </select>
            </FormField>
          )}

          {!isEditing && selectedChapterId && topics.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 border border-border/50 rounded-xl p-4 bg-muted/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Topics Progress Sliders</p>
              {topics.map((topic) => {
                const state = topicsProgressState[topic.id] || { status: 'not_started', completionPercentage: 0 };
                return (
                  <div key={topic.id} className="space-y-2 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{topic.sequenceNo}. {topic.topicName}</span>
                      <select
                        value={state.status}
                        onChange={(e) => {
                          const statusVal = e.target.value;
                          setTopicsProgressState(prev => ({
                            ...prev,
                            [topic.id]: {
                              ...prev[topic.id],
                              status: statusVal,
                              completionPercentage: statusVal === 'completed' ? 100 : statusVal === 'not_started' ? 0 : prev[topic.id]?.completionPercentage || 50
                            }
                          }));
                        }}
                        className="h-8 px-2 bg-background border border-input rounded-lg text-xs"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={state.completionPercentage} 
                        onChange={(e) => {
                          const pctVal = Number(e.target.value);
                          setTopicsProgressState(prev => ({
                            ...prev,
                            [topic.id]: {
                              ...prev[topic.id],
                              completionPercentage: pctVal,
                              status: pctVal === 100 ? 'completed' : pctVal > 0 ? 'IN_PROGRESS' : 'not_started'
                            }
                          }));
                        }}
                        disabled={state.status === 'completed'}
                        className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-xs font-bold text-indigo-600 w-8 text-right">{state.completionPercentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {!isEditing && (
                <FormField label="Topic (optional)">
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={!selectedChapterId || loadingTopics}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    <option value="">
                      {loadingTopics ? 'Loading topics...' : !selectedChapterId ? 'Select chapter first' : '— Select Topic —'}
                    </option>
                    {topics.map((tp) => (
                      <option key={tp.id} value={String(tp.id)}>
                        {tp.sequenceNo}. {tp.topicName}
                      </option>
                    ))}
                    {!loadingTopics && selectedChapterId && topics.length === 0 && (
                      <option disabled>No topics found</option>
                    )}
                  </select>
                </FormField>
              )}
              <div className="grid grid-cols-2 gap-4">
                 <FormField label="Status" error={errors.status?.message} required>
                   <select 
                     {...register('status', { 
                       required: 'Required',
                       onChange: (e) => {
                         if (e.target.value === 'completed') {
                           setValue('completionPercentage', 100);
                         }
                       }
                     })} 
                     className="field"
                   >
                     <option value="not_started">Not Started</option>
                     <option value="IN_PROGRESS">In Progress</option>
                     <option value="completed">Completed</option>
                   </select>
                 </FormField>
                <FormField label="Completion %" error={errors.completionPercentage?.message} required>
                   <input 
                     {...register('completionPercentage', { required: 'Required', valueAsNumber: true, min: 0, max: 100 })} 
                     type="number" 
                     className={`field ${watchedStatus === 'completed' ? 'opacity-75 bg-muted cursor-not-allowed' : ''}`}
                     readOnly={watchedStatus === 'completed'}
                   />
                </FormField>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : (isEditing || hasExistingProgress) ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

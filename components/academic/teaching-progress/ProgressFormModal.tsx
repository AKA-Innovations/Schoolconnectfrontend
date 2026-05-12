'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateProgress, useUpdateProgress, useSubjectChapters, useSubjectTopics, useChapterProgress } from '@/hooks/useAcademic';
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      status: 'not_started',
      completionPercentage: 0
    }
  });

  // Reset dropdowns when modal opens/closes or prefill changes
  useEffect(() => {
    if (editItem) {
      reset({
        status: editItem.status,
        completionPercentage: editItem.completionPercentage || 0,
      });
      setSelectedChapterId(editItem.chapterId ? String(editItem.chapterId) : '');
      setSelectedTopicId(editItem.topicId ? String(editItem.topicId) : '');
    } else if (open) {
      reset({
        status: 'not_started',
        completionPercentage: 0,
      });
      setSelectedChapterId('');
      setSelectedTopicId('');
    }
  }, [editItem, reset, open]);

  // Update form when chapter progress is fetched (default if no topic selected)
  useEffect(() => {
    if (!isEditing && currentProgress && !selectedTopicId) {
      setValue('completionPercentage', currentProgress.completionPercentage || 0);
      setValue('status', currentProgress.status || 'not_started');
    }
  }, [currentProgress, isEditing, setValue, selectedTopicId]);

  // Update form when topic selection changes
  useEffect(() => {
    if (!isEditing && currentProgress?.topics && selectedTopicId) {
      const topicProgress = currentProgress.topics.find(t => String(t.topicId) === selectedTopicId);
      if (topicProgress) {
        setValue('completionPercentage', topicProgress.completionPercentage || 0);
        setValue('status', topicProgress.status || 'not_started');
      } else {
        setValue('completionPercentage', 0);
        setValue('status', 'not_started');
      }
    }
  }, [selectedTopicId, currentProgress, isEditing, setValue]);

  // Reset topic when chapter changes
  useEffect(() => {
    if (!isEditing) {
      setSelectedTopicId('');
    }
  }, [selectedChapterId, isEditing]);

  const onSubmit = (values: FormValues) => {
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

    if (isEditing) {
      updateMutation.mutate(
        {
          id: editItem.id,
          data: {
            status: values.status,
            completionPercentage: values.completionPercentage,
          }
        },
        { onSuccess }
      );
    } else {
      if (!selectedChapterId) {
        toast.error('Please select a chapter.');
        return;
      }

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
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Update Progress' : 'Log Progress'}</DialogTitle>
          {prefill && !isEditing && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50">
              Logging for: <span className="font-bold text-foreground">Class {prefill.className}-{prefill.sectionName}</span> | <span className="font-bold text-foreground">{prefill.subjectName}</span>
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              {/* Chapter dropdown */}
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

              {/* Topic dropdown */}
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
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status" error={errors.status?.message} required>
              <select {...register('status', { required: 'Required' })} className="field">
                <option value="not_started">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>
            <FormField label="Completion %" error={errors.completionPercentage?.message} required>
              <input {...register('completionPercentage', { required: 'Required', valueAsNumber: true, min: 0, max: 100 })} type="number" className="field" />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : isEditing ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateClasswork, useUpdateClasswork } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { formatDate } from '@/lib/dateUtils';
import { AssignmentSelector } from '../shared/AssignmentSelector';
import { ChapterSelect } from '../shared/ChapterSelect';
import { TopicSelect } from '../shared/TopicSelect';
import type { Classwork } from '@/services/academic/types';

interface FormValues {
  assignmentKey: string; // "className|sectionName|mappingId"
  chapterId: string;
  topicId: string;
  description: string;
  conductedOn: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editItem: Classwork | null;
  onSuccess: () => void;
  prefill?: {
    className: string;
    sectionName: string;
    subjectId: string; // mapping ID
    classSectionId: number;
    subjectDtlsId: number;
  };
}

export const ClassworkFormModal = React.memo(function ClassworkFormModal({
  open, onOpenChange, editItem, onSuccess, prefill,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateClasswork();
  const updateMutation = useUpdateClasswork();
  const isEditing = !!editItem;

  const [selectedClassName, setSelectedClassName] = useState<string | undefined>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(); // Mapping ID
  const [selectedClassSectionId, setSelectedClassSectionId] = useState<number | undefined>();
  const [selectedSubjectDtlsId, setSelectedSubjectDtlsId] = useState<number | undefined>();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      assignmentKey: '',
      chapterId: '',
      topicId: '',
      description: '',
      conductedOn: formatDate(new Date(), 'yyyy-MM-dd'),
    },
  });

  const assignmentKey = watch('assignmentKey');
  const chapterId = watch('chapterId');

  useEffect(() => {
    if (editItem) {
      reset({
        assignmentKey: '', // We don't change assignment on edit for now
        chapterId: editItem.chapterId ? String(editItem.chapterId) : '',
        topicId: editItem.topicId ? String(editItem.topicId) : '',
        description: editItem.description,
        conductedOn: formatDate(new Date(editItem.conductedOn), 'yyyy-MM-dd'),
      });
    } else if (prefill && open) {
      reset({
        assignmentKey: `${prefill.className}|${prefill.sectionName}|${prefill.subjectId}`,
        chapterId: '',
        topicId: '',
        description: '',
        conductedOn: formatDate(new Date(), 'yyyy-MM-dd'),
      });
      setSelectedClassName(prefill.className);
      setSelectedSubjectId(prefill.subjectId);
      setSelectedClassSectionId(prefill.classSectionId);
      setSelectedSubjectDtlsId(prefill.subjectDtlsId);
    } else {
      reset({
        assignmentKey: '',
        chapterId: '',
        topicId: '',
        description: '',
        conductedOn: formatDate(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [editItem, reset, prefill, open]);

  // Handle dependent resets
  useEffect(() => {
    if (!assignmentKey) {
      setSelectedClassName(undefined);
      setSelectedSubjectId(undefined);
      setSelectedClassSectionId(undefined);
      setSelectedSubjectDtlsId(undefined);
    }
  }, [assignmentKey]);

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        {
          id: editItem.id,
          data: {
            description: values.description,
            conductedOn: new Date(values.conductedOn).toISOString(),
          },
        },
        { onSuccess },
      );
      return;
    }

    if (!selectedClassSectionId || !selectedSubjectDtlsId) {
      console.error('Missing required IDs for classwork creation:', { 
        classSectionId: selectedClassSectionId, 
        subjectDtlsId: selectedSubjectDtlsId,
        prefill: !!prefill,
        isEditing
      });
      toast.error('Unable to resolve class/subject identifiers. Please re-select the class.');
      return;
    }

    createMutation.mutate(
      {
        session: CURRENT_SESSION,
        classSectionId: selectedClassSectionId,
        subjectId: selectedSubjectDtlsId,
        chapterId: values.chapterId ? Number(values.chapterId) : undefined,
        topicId: values.topicId ? Number(values.topicId) : undefined,
        description: values.description,
      },
      { onSuccess },
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Classwork' : 'Add Classwork'}</DialogTitle>
          {!isEditing && (
            <DialogDescription>
              Step-by-step: Select assignment, chapter, and topic to log classwork.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <Controller
              name="assignmentKey"
              control={control}
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <AssignmentSelector
                  value={field.value}
                  error={errors.assignmentKey?.message}
                  onChange={(val, detail) => {
                    field.onChange(val);
                    setSelectedClassName(detail?.className);
                    setSelectedSubjectId(detail?.subjectId);
                    setSelectedClassSectionId(detail?.classSectionId);
                    setSelectedSubjectDtlsId(detail?.subjectDtlsId);
                    setValue('chapterId', '');
                    setValue('topicId', '');
                  }}
                />
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="chapterId"
              control={control}
              render={({ field }) => (
                <ChapterSelect
                  className={selectedClassName}
                  subjectId={selectedSubjectId}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue('topicId', '');
                  }}
                  error={errors.chapterId?.message}
                  disabled={!assignmentKey}
                />
              )}
            />

            <Controller
              name="topicId"
              control={control}
              render={({ field }) => (
                <TopicSelect
                  chapterId={chapterId}
                  subjectId={selectedSubjectDtlsId}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.topicId?.message}
                  disabled={!chapterId}
                />
              )}
            />
          </div>

          <FormField label="Description / What was covered" error={errors.description?.message} required>
            <textarea
              {...register('description', { required: 'Required' })}
              className="field min-h-[100px] resize-y"
              placeholder="Topics covered in today's class..."
            />
          </FormField>

          <FormField label="Conducted On" error={errors.conductedOn?.message} required>
            <input
              {...register('conductedOn', { required: 'Required' })}
              type="date"
              className="field"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Update' : 'Save Classwork'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateHomework, useUpdateHomework, useUploadHomeworkAttachment } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { CURRENT_SESSION } from '@/lib/constants';
import { formatDate } from '@/lib/dateUtils';
import { AssignmentSelector } from '../shared/AssignmentSelector';
import { ChapterSelect } from '../shared/ChapterSelect';
import { TopicSelect } from '../shared/TopicSelect';
import type { Homework } from '@/services/academic/types';

interface FormValues {
  assignmentKey: string; // "className|sectionName|mappingId"
  chapterId: string;
  topicId: string;
  title: string;
  description: string;
  dueDate: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editItem: Homework | null;
  onSuccess: () => void;
  prefill?: {
    className: string;
    sectionName: string;
    subjectId: string; // mapping ID
    classSectionId: number;
    subjectDtlsId: number;
  };
}

export const HomeworkFormModal = React.memo(function HomeworkFormModal({
  open, onOpenChange, editItem, onSuccess, prefill,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateHomework();
  const updateMutation = useUpdateHomework();
  const isEditing = !!editItem;

  const [selectedClassName, setSelectedClassName] = useState<string | undefined>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(); // Mapping ID
  const [selectedClassSectionId, setSelectedClassSectionId] = useState<number | undefined>();
  const [selectedSubjectDtlsId, setSelectedSubjectDtlsId] = useState<number | undefined>();

  const uploadAttachment = useUploadHomeworkAttachment();
  const [step, setStep] = useState<'form' | 'upload_prompt'>('form');
  const [createdHw, setCreatedHw] = useState<Homework | null>(null);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      assignmentKey: '',
      chapterId: '',
      topicId: '',
      title: '',
      description: '',
      dueDate: formatDate(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    },
  });

  const assignmentKey = watch('assignmentKey');
  const chapterId = watch('chapterId');

  useEffect(() => {
    if (editItem) {
      reset({
        assignmentKey: '',
        chapterId: editItem.chapterId ? String(editItem.chapterId) : '',
        topicId: editItem.topicId ? String(editItem.topicId) : '',
        title: editItem.title,
        description: editItem.description,
        dueDate: formatDate(new Date(editItem.dueDate), 'yyyy-MM-dd'),
      });
    } else if (prefill && open) {
      reset({
        assignmentKey: `${prefill.className}|${prefill.sectionName}|${prefill.subjectId}`,
        chapterId: '',
        topicId: '',
        title: '',
        description: '',
        dueDate: formatDate(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
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
        title: '',
        description: '',
        dueDate: formatDate(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
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
    const onFinalSuccess = (hw: Homework) => {
      if (isEditing) {
        toast.success('Homework updated');
        onSuccess();
      } else {
        toast.success('Homework created successfully');
        setCreatedHw(hw);
        setStep('upload_prompt');
      }
    };

    if (isEditing) {
      updateMutation.mutate(
        {
          id: editItem.id,
          data: {
            title: values.title,
            description: values.description,
            dueDate: new Date(values.dueDate).toISOString(),
          },
        },
        { onSuccess: () => onFinalSuccess(editItem) },
      );
      return;
    }

    if (!selectedClassSectionId || !selectedSubjectDtlsId) {
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
        title: values.title,
        description: values.description,
        dueDate: new Date(values.dueDate).toISOString(),
      },
      { onSuccess: (data) => onFinalSuccess(data) },
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdHw) return;

    uploadAttachment.mutate({
      session: CURRENT_SESSION,
      homeworkId: createdHw.id,
      file,
    }, {
      onSuccess: () => {
        toast.success('Attachment added successfully');
        onSuccess(); // Close and refresh
      }
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploadAttachment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload_prompt' ? 'Homework Created!' : isEditing ? 'Edit Homework' : 'Create Homework'}
          </DialogTitle>
          {step === 'form' && !isEditing && (
            <DialogDescription>
              Step-by-step: Select assignment, chapter, and topic to assign homework.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'form' ? (
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
                      console.log("detail", detail);
                      field.onChange(val);
                      setSelectedClassName(detail?.className);
                      setSelectedSubjectId(detail?.subjectDtlsId ? String(detail.subjectDtlsId) : undefined);
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

            <FormField label="Title" error={errors.title?.message} required>
              <input
                {...register('title', { required: 'Required' })}
                className="field"
                placeholder="Homework title"
              />
            </FormField>

            <FormField label="Description / Instructions" error={errors.description?.message} required>
              <textarea
                {...register('description', { required: 'Required' })}
                className="field min-h-[100px] resize-y"
                placeholder="Detailed instructions for students..."
              />
            </FormField>

            <FormField label="Due Date" error={errors.dueDate?.message} required>
              <input
                {...register('dueDate', { required: 'Required' })}
                type="date"
                className="field"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : isEditing ? 'Update' : 'Create & Continue'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-6 space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                The assignment has been created. Would you like to attach a supporting document (PDF, image, etc.)?
              </p>
            </div>

            <div className="flex flex-col gap-3 max-w-[240px] mx-auto pt-2">
              <Button asChild className="rounded-xl h-12 gap-2 relative">
                <label className="cursor-pointer">
                  <Plus className="h-4 w-4" />
                  {uploadAttachment.isPending ? 'Uploading...' : 'Attach Document'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={uploadAttachment.isPending}
                  />
                </label>
              </Button>
              <Button variant="ghost" className="h-12 rounded-xl text-slate-500" onClick={onSuccess}>
                I'll do it later
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

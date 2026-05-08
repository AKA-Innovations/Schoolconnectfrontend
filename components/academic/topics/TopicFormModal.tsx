'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateTopic, useUpdateTopic, useSubjectChapters } from '@/hooks/useAcademic';
import { useClassSectionLists, useSubjectOptions } from '@/hooks/useClasses';
import { CURRENT_SESSION } from '@/lib/constants';
import type { SubjectTopic } from '@/services/academic/types';

interface FormValues {
  className: string;
  sectionName: string;
  subjectId: string;
  chapterId: number;
  topicName: string;
  sequenceNo: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editItem: SubjectTopic | null;
  onSuccess: () => void;
}

export const TopicFormModal = React.memo(function TopicFormModal({ open, onOpenChange, editItem, onSuccess }: Props) {
  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const isEditing = !!editItem;

  const { data: allClassSections = [] } = useClassSectionLists();
  
  const classes = useMemo(() => {
    return Array.from(new Set(allClassSections.map(c => c.className))).sort();
  }, [allClassSections]);

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { className: '', sectionName: '', subjectId: '', chapterId: 0, topicName: '', sequenceNo: 1 },
  });

  const selectedClassName = useWatch({ control, name: 'className' });
  const selectedSectionName = useWatch({ control, name: 'sectionName' });
  const selectedSubjectId = useWatch({ control, name: 'subjectId' });

  const sections = useMemo(() => {
    if (!selectedClassName) return [];
    return allClassSections
      .filter(c => c.className === selectedClassName)
      .map(c => c.sectionName)
      .sort();
  }, [selectedClassName, allClassSections]);

  const { data: subjectOptions = [], isLoading: loadingSubjects } = useSubjectOptions(selectedClassName);
  const { data: chapterOptions = [], isLoading: loadingChapters } = useSubjectChapters(selectedClassName);

  const filteredChapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    return chapterOptions.filter(ch => String(ch.subjectId) === selectedSubjectId).sort((a, b) => a.sequenceNo - b.sequenceNo);
  }, [selectedSubjectId, chapterOptions]);

  useEffect(() => {
    if (editItem) {
      reset({
        className: editItem.className,
        sectionName: '',
        subjectId: String(editItem.subjectId),
        chapterId: editItem.chapterId,
        topicName: editItem.topicName,
        sequenceNo: editItem.sequenceNo
      });
    } else {
      reset({ className: '', sectionName: '', subjectId: '', chapterId: 0, topicName: '', sequenceNo: 1 });
    }
  }, [editItem, reset]);

  useEffect(() => {
    if (!isEditing) {
      setValue('sectionName', '');
      setValue('subjectId', '');
      setValue('chapterId', 0);
    }
  }, [selectedClassName, setValue, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setValue('chapterId', 0);
    }
  }, [selectedSubjectId, setValue, isEditing]);

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate({
        id: editItem.id,
        data: { topicName: values.topicName, sequenceNo: values.sequenceNo }
      }, {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate({
        session: CURRENT_SESSION,
        className: values.className,
        sectionName: values.sectionName,
        subjectId: values.subjectId,
        chapterId: values.chapterId,
        topicDetails: [{ topicName: values.topicName, sequenceNo: values.sequenceNo }],
      }, {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the topic.' : 'Select class, section, subject and chapter to add new topics.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Class" error={errors.className?.message} required>
                  <select {...register('className', { required: 'Required' })} className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>

                <FormField label="Section" error={errors.sectionName?.message} required>
                  <select {...register('sectionName', { required: 'Required' })} disabled={!selectedClassName} className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Subject" error={errors.subjectId?.message} required>
                <select {...register('subjectId', { required: 'Required' })} disabled={!selectedClassName || loadingSubjects} className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select Subject'}</option>
                  {subjectOptions.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.subjectName} ({sub.subjectCode})</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Chapter" error={errors.chapterId?.message} required>
                <select {...register('chapterId', { required: 'Required', valueAsNumber: true })} disabled={!selectedSubjectId || loadingChapters} className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="">{loadingChapters ? 'Loading chapters...' : 'Select Chapter'}</option>
                  {filteredChapters.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.sequenceNo}. {ch.chapterName}</option>
                  ))}
                </select>
              </FormField>
            </>
          )}

          <FormField label="Topic Name" error={errors.topicName?.message} required>
            <input {...register('topicName', { required: 'Required' })} className="field" placeholder="e.g. Quadratic Equations" />
          </FormField>
          <FormField label="Sequence" error={errors.sequenceNo?.message} required>
            <input {...register('sequenceNo', { required: 'Required', valueAsNumber: true })} type="number" min={1} className="field" />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" loading={isPending}>{isEditing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

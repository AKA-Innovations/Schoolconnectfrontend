'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { useCreateChapter, useUpdateChapter } from '@/hooks/useAcademic';
import { useClassSectionLists, useSubjectOptions } from '@/hooks/useClasses';
import { CURRENT_SESSION } from '@/lib/constants';
import type { SubjectChapter } from '@/services/academic/types';

const chapterSchema = z.object({
  className: z.string().min(1, 'Class is required'),
  sectionName: z.string().min(1, 'Section is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  chapterName: z.string().min(1, 'Chapter name is required'),
  sequenceNo: z.coerce.number().int().min(1, 'Sequence must be ≥ 1'),
});

type FormValues = z.infer<typeof chapterSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: SubjectChapter | null;
  onSuccess: () => void;
}

export const ChapterFormModal = React.memo(function ChapterFormModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: Props) {
  const createMutation = useCreateChapter();
  const updateMutation = useUpdateChapter();
  const isEditing = !!editItem;

  const { data: allClassSections = [] } = useClassSectionLists();
  
  // Get unique class names
  const classes = useMemo(() => {
    return Array.from(new Set(allClassSections.map(c => c.className))).sort();
  }, [allClassSections]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      className: '',
      sectionName: '',
      subjectId: '',
      chapterName: '',
      sequenceNo: 1,
    },
  });

  const selectedClassName = useWatch({ control, name: 'className' });
  const selectedSectionName = useWatch({ control, name: 'sectionName' });

  // Get sections for selected class
  const sections = useMemo(() => {
    if (!selectedClassName) return [];
    return allClassSections
      .filter(c => c.className === selectedClassName)
      .map(c => c.sectionName)
      .sort();
  }, [selectedClassName, allClassSections]);



  // Get subjects for selected class
  const { data: subjectOptions = [], isLoading: loadingSubjects } = useSubjectOptions(selectedClassName);

  useEffect(() => {
    if (editItem) {
      reset({
        className: editItem.className,
        sectionName: '',
        subjectId: String(editItem.subjectId),
        chapterName: editItem.chapterName,
        sequenceNo: editItem.sequenceNo,
      });
    } else {
      reset({ className: '', sectionName: '', subjectId: '', chapterName: '', sequenceNo: 1 });
    }
  }, [editItem, reset]);

  // Reset section and subject when class changes
  useEffect(() => {
    if (!isEditing) {
      setValue('sectionName', '');
      setValue('subjectId', '');
    }
  }, [selectedClassName, setValue, isEditing]);

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: editItem.id, data: { chapterName: values.chapterName, sequenceNo: values.sequenceNo } },
        { onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        } },
      );
    } else {
      createMutation.mutate(
        {
          session: CURRENT_SESSION,
          className: values.className,
          sectionName: values.sectionName,
          subjectId: values.subjectId,
          chapterDetails: [{ chapterName: values.chapterName, sequenceNo: values.sequenceNo }],
        },
        { onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        } },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the chapter.' : 'Select class, section, and subject to add new chapters.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Class" error={errors.className?.message} required>
                  <select {...register('className')} className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Section" error={errors.sectionName?.message} required>
                  <select 
                    {...register('sectionName')} 
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={!selectedClassName}
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Subject" error={errors.subjectId?.message} required>
                <select 
                  {...register('subjectId')} 
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={!selectedClassName || loadingSubjects}
                >
                  <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select Subject'}</option>
                  {subjectOptions.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.subjectName} ({sub.subjectCode})</option>
                  ))}
                </select>
              </FormField>
            </>
          )}

          <FormField label="Chapter Name" error={errors.chapterName?.message} required>
            <input {...register('chapterName')} className="field" placeholder="e.g. Introduction to Algebra" />
          </FormField>
          <FormField label="Sequence Number" error={errors.sequenceNo?.message} required>
            <input {...register('sequenceNo')} type="number" min={1} className="field" />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});


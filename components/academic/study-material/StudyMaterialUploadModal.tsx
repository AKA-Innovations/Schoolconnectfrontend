'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/FormField';
import { FileUploadZone } from '../shared/FileUploadZone';
import { AssignmentSelector } from '../shared/AssignmentSelector';
import { ChapterSelect } from '../shared/ChapterSelect';
import { TopicSelect } from '../shared/TopicSelect';
import { useUploadStudyMaterial, useUpdateStudyMaterial } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';
import { toast } from 'sonner';
import type { EnrichedStudyMaterial } from './StudyMaterialTable';

interface FormValues {
  title: string;
  assignmentKey: string;
  chapterId: string;
  topicId: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
  editItem?: EnrichedStudyMaterial | null;
}

export const StudyMaterialUploadModal = React.memo(function StudyMaterialUploadModal({ 
  open, 
  onOpenChange, 
  onSuccess,
  editItem,
}: Props) {
  const uploadMutation = useUploadStudyMaterial();
  const updateMutation = useUpdateStudyMaterial();
  const [file, setFile] = useState<File | null>(null);

  const isEditing = !!editItem;

  const [selectedClassName, setSelectedClassName] = useState<string | undefined>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(); // Mapping ID
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [selectedClassSectionId, setSelectedClassSectionId] = useState<number | undefined>();
  const [selectedSubjectDtlsId, setSelectedSubjectDtlsId] = useState<number | undefined>();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      assignmentKey: '',
      chapterId: '',
      topicId: '',
      description: '',
    },
  });

  const assignmentKey = watch('assignmentKey');
  const chapterId = watch('chapterId');

  useEffect(() => {
    if (open) {
      if (editItem) {
        reset({
          title: (editItem.documentPath || '').split('/').pop() || '',
          assignmentKey: '', // Keep empty or allow re-assigning if needed
          chapterId: editItem.chapterId ? String(editItem.chapterId) : '',
          topicId: editItem.topicId ? String(editItem.topicId) : '',
          description: editItem.description || '',
        });
        setSelectedClassName(editItem.className);
        setSelectedSubjectId(editItem.subjectId ? String(editItem.subjectId) : undefined);
        setSelectedClassId(editItem.classId);
        setSelectedClassSectionId(editItem.classSectionId);
        setSelectedSubjectDtlsId(editItem.subjectId);
      } else {
        reset({
          title: '',
          assignmentKey: '',
          chapterId: '',
          topicId: '',
          description: '',
        });
        setFile(null);
        setSelectedClassName(undefined);
        setSelectedSubjectId(undefined);
        setSelectedClassId(undefined);
        setSelectedClassSectionId(undefined);
        setSelectedSubjectDtlsId(undefined);
      }
    }
  }, [open, editItem, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEditing && editItem) {
      updateMutation.mutate({
        id: editItem.id,
        data: {
          description: values.description,
          title: values.title,
          classId: selectedClassId || editItem.classId,
          classSectionId: selectedClassSectionId || editItem.classSectionId,
          subjectId: selectedSubjectDtlsId || editItem.subjectId,
          chapterId: values.chapterId ? Number(values.chapterId) : null,
          topicId: values.topicId ? Number(values.topicId) : null,
          file: file || undefined,
        },
      }, {
        onSuccess: () => {
          toast.success('Study material updated successfully');
          onSuccess();
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to update study material');
        }
      });
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!selectedClassId || !selectedClassSectionId || !selectedSubjectDtlsId) {
      toast.error('Unable to resolve class/subject identifiers. Please re-select the class.');
      return;
    }

    uploadMutation.mutate({
      session: CURRENT_SESSION,
      classId: selectedClassId,
      classSectionId: selectedClassSectionId,
      subjectId: selectedSubjectDtlsId,
      chapterId: values.chapterId ? Number(values.chapterId) : undefined,
      topicId: values.topicId ? Number(values.topicId) : undefined,
      title: values.title,
      description: values.description,
      file,
    }, {
      onSuccess: () => {
        toast.success('Study material uploaded successfully');
        onSuccess();
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to upload study material');
      }
    });
  };

  const isPending = uploadMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Study Material' : 'Upload Study Material'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update details, tagged chapter/topic, or replacement file for this resource.' : 'Share educational resources, notes, or presentations with your students.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <Controller
              name="assignmentKey"
              control={control}
              rules={{ required: !isEditing ? 'Required' : false }}
              render={({ field }) => (
                <AssignmentSelector
                  value={field.value}
                  error={errors.assignmentKey?.message}
                  onChange={(val, detail) => {
                    field.onChange(val);
                    setSelectedClassName(detail?.className);
                    setSelectedSubjectId(detail?.subjectDtlsId ? String(detail.subjectDtlsId) : undefined);
                    setSelectedClassId(detail?.classId);
                    setSelectedClassSectionId(detail?.classSectionId);
                    setSelectedSubjectDtlsId(detail?.subjectDtlsId);
                    setValue('chapterId', '');
                    setValue('topicId', '');
                  }}
                />
              )}
            />
          )}

          <FormField label="Document Title / Name" error={errors.title?.message} required>
            <input
              type="text"
              {...register('title', { required: 'Required' })}
              className="field h-10"
              placeholder="e.g. Introduction to Algebra Notes"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="chapterId"
              control={control}
              render={({ field }) => (
                <ChapterSelect
                  className={selectedClassName || 'Selected'}
                  subjectId={selectedSubjectId || (selectedSubjectDtlsId ? String(selectedSubjectDtlsId) : undefined)}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue('topicId', '');
                  }}
                  error={errors.chapterId?.message}
                  disabled={!isEditing && !assignmentKey}
                />
              )}
            />

            <Controller
              name="topicId"
              control={control}
              render={({ field }) => (
                <TopicSelect
                  chapterId={chapterId}
                  subjectId={selectedSubjectDtlsId || (selectedSubjectId ? Number(selectedSubjectId) : undefined)}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.topicId?.message}
                  disabled={!chapterId}
                />
              )}
            />
          </div>

          <FormField label="Description" error={errors.description?.message} required>
            <textarea
              {...register('description', { required: 'Required' })}
              className="field min-h-[100px] resize-y"
              placeholder="Provide a brief description of the material..."
            />
          </FormField>

          <FormField label={isEditing ? "Replace File (Optional)" : "File Resource"} required={!isEditing}>
            <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={!isEditing && (!file || !assignmentKey)}>
              {isPending ? (isEditing ? 'Saving...' : 'Uploading...') : (isEditing ? 'Save Changes' : 'Upload Material')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

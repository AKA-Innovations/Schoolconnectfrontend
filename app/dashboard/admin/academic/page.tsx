'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, ClipboardList, PenLine, BarChart3, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurriculumBuilder } from '@/components/academic/curriculum/CurriculumBuilder';
import { HomeworkManagement } from '@/components/academic/homework/HomeworkManagement';
import { ClassworkManagement } from '@/components/academic/classwork/ClassworkManagement';
import { ProgressManagement } from '@/components/academic/teaching-progress/ProgressManagement';
import { StudyMaterialManagement } from '@/components/academic/study-material/StudyMaterialManagement';

const TABS = [
  { key: 'chapters', label: 'Chapters & Topics', icon: BookOpen },
  { key: 'homework', label: 'Homework', icon: ClipboardList },
  { key: 'classwork', label: 'Classwork', icon: PenLine },
  { key: 'progress', label: 'Teaching Progress', icon: BarChart3 },
  { key: 'materials', label: 'Study Material', icon: FolderOpen },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function AcademicContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams?.get('tab') as TabKey) || 'chapters';

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Tab content */}
      {activeTab === 'chapters' && <CurriculumBuilder />}
      {activeTab === 'homework' && <HomeworkManagement />}
      {activeTab === 'classwork' && <ClassworkManagement />}
      {activeTab === 'progress' && <ProgressManagement />}
      {activeTab === 'materials' && <StudyMaterialManagement />}
    </div>
  );
}

export default function AdminAcademicPage() {
  return (
    <Suspense fallback={
      <div className="p-10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AcademicContent />
    </Suspense>
  );
}

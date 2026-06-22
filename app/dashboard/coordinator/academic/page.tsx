'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardList, PenLine, BarChart3, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HomeworkManagement } from '@/components/academic/homework/HomeworkManagement';
import { ClassworkManagement } from '@/components/academic/classwork/ClassworkManagement';
import { ProgressManagement } from '@/components/academic/teaching-progress/ProgressManagement';
import { StudyMaterialManagement } from '@/components/academic/study-material/StudyMaterialManagement';

const TABS = [
  { key: 'homework', label: 'Homework', icon: ClipboardList },
  { key: 'classwork', label: 'Classwork', icon: PenLine },
  { key: 'progress', label: 'Progress', icon: BarChart3 },
  { key: 'materials', label: 'Materials', icon: FolderOpen },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function CoordinatorAcademicContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams?.get('tab') as TabKey) || 'homework';

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const Icon = tab.icon;
          return (
            <a
              key={tab.key}
              href={`?tab=${tab.key}`}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/70 text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-100'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'homework' && <HomeworkManagement />}
      {activeTab === 'classwork' && <ClassworkManagement />}
      {activeTab === 'progress' && <ProgressManagement />}
      {activeTab === 'materials' && <StudyMaterialManagement />}
    </div>
  );
}

export default function CoordinatorAcademicPage() {
  return (
    <Suspense fallback={
      <div className="p-10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <CoordinatorAcademicContent />
    </Suspense>
  );
}

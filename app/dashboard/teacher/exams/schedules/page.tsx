'use client';

import React from 'react';
import { ScheduleBuilder } from '@/components/admin/exams/ScheduleBuilder';
import { CURRENT_SESSION } from '@/lib/constants';

export default function TeacherSchedulesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ScheduleBuilder session={CURRENT_SESSION} />
    </div>
  );
}

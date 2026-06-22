'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTeacherRoles } from '@/lib/permissions';
import { AnnouncementsManager } from './AnnouncementsManager';
import { EventsManager } from '../events/EventsManager';
import { EventCalendar } from '../events/EventCalendar';
import { HolidaysList } from '../events/HolidaysList';
import { EventTypeManager } from '../events/EventTypeManager';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Suspense } from 'react';

interface Props {
  role: 'school_admin' | 'principal' | 'teacher' | 'student' | 'subject_coordinator';
}

function CommunicationsHubContent({ role }: Props) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'notices';
  const teacherRoles = useTeacherRoles();

  const isCreatorRole = 
    role === 'school_admin' || 
    role === 'principal' || 
    role === 'teacher' || 
    teacherRoles.isPrincipal || 
    teacherRoles.isCoordinator;

  const isAdmin = role === 'school_admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="notices" className="mt-0 outline-none">
          <AnnouncementsManager role={role} />
        </TabsContent>

        <TabsContent value="events" className="mt-0 outline-none">
          <EventsManager role={role} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0 outline-none">
          <EventCalendar role={role} />
        </TabsContent>


        <TabsContent value="holidays" className="mt-0 outline-none">
          <HolidaysList role={role} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="event-types" className="mt-0 outline-none">
            <EventTypeManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function CommunicationsHub(props: Props) {
  return (
    <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />}>
      <CommunicationsHubContent {...props} />
    </Suspense>
  );
}


import CommunicationsHub from '@/components/announcements/CommunicationsHub';
import { Suspense } from 'react';

export default function PrincipalAnnouncementsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />}>
      <CommunicationsHub role="principal" />
    </Suspense>
  );
}



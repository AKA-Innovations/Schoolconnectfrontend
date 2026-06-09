import { ScheduleBuilder } from '@/components/admin/exams/ScheduleBuilder';
import { CURRENT_SESSION } from '@/lib/constants';

export default function ScheduleBuilderPage() {
  return <ScheduleBuilder session={CURRENT_SESSION} />;
}

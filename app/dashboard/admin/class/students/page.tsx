import { ClassStudentsView } from '@/components/admin/class/ClassStudentsView';

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
              Administration &middot; Academic Hub
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Student Roster
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              Search and view student lists section-by-section along with details of their daily attendance logs.
            </p>
          </div>
        </div>

        {/* Roster View */}
        <div className="pt-2">
          <ClassStudentsView />
        </div>

      </div>
    </div>
  );
}

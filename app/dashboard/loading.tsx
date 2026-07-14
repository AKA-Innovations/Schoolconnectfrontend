import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-[#00A99D] animate-spin" />
        <div>
          <h4 className="font-bold text-sm text-slate-800">Loading Dashboard</h4>
          <p className="text-xs text-slate-500 mt-1">Retrieving latest session records...</p>
        </div>
      </div>
    </div>
  );
}

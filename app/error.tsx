'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to logging services
    console.error('System Exception captured by error boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full p-6 text-center">
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 border border-rose-100 animate-pulse">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Something went wrong</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-8 leading-relaxed">
        An unexpected error occurred in this module. Don't worry, your data has not been affected.
      </p>

      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="rounded-xl font-bold bg-[#00A99D] hover:bg-[#00897B] text-white gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="rounded-xl font-bold border-slate-200"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}

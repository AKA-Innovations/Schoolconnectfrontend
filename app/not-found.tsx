import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 text-center bg-slate-50">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 mb-6 border border-slate-200">
        <FileQuestion className="w-8 h-8" />
      </div>
      
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link href="/">
        <Button
          className="rounded-xl font-bold bg-[#00A99D] hover:bg-[#00897B] text-white gap-2"
        >
          <Home className="w-4 h-4" /> Go back Home
        </Button>
      </Link>
    </div>
  );
}

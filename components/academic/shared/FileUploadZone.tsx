'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  selectedFile?: File | null;
  onClear?: () => void;
  disabled?: boolean;
}

export const FileUploadZone = React.memo(function FileUploadZone({
  onFileSelect,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx',
  maxSizeMB = 10,
  selectedFile,
  onClear,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be under ${maxSizeMB}MB`);
        return;
      }
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl">
        <FileText size={18} className="text-teal-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
          <p className="text-[10px] font-medium text-slate-400">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
        {onClear && (
          <button onClick={onClear} className="p-1 hover:bg-teal-100 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center gap-2 px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all',
          dragActive
            ? 'border-teal-400 bg-teal-50/50'
            : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <Upload size={24} className={cn('text-slate-400', dragActive && 'text-teal-500')} />
        <p className="text-xs font-medium text-slate-500">
          <span className="text-teal-600 font-bold">Click to upload</span> or drag & drop
        </p>
        <p className="text-[10px] text-slate-400">Max {maxSizeMB}MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {error && (
        <p className="text-[10px] text-rose-500 mt-1 ml-0.5 font-bold uppercase tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
});

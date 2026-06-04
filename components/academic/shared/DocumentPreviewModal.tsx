'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, ImageIcon } from 'lucide-react';

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  filename: string;
}

export function DocumentPreviewModal({ open, onOpenChange, url, filename }: DocumentPreviewModalProps) {
  if (!url) return null;

  const resolvedFilename = React.useMemo(() => {
    const isGeneric = !filename || ['attachment', 'submission', 'material', 'document'].includes(filename.toLowerCase()) || !filename.includes('.');
    if (!isGeneric) return filename;

    try {
      const cleanUrl = url.split('?')[0];
      const name = cleanUrl.split('/').pop();
      if (name && name.includes('.')) {
        return decodeURIComponent(name);
      }
    } catch (e) {
      // fallback
    }
    return filename || 'Document';
  }, [filename, url]);

  const ext = resolvedFilename.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';

  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!url) return;
    setIsDownloading(true);
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(resolvedFilename)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to fetch from proxy');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resolvedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.warn('Programmatic proxy download failed, falling back to direct proxy window location change', e);
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(resolvedFilename)}`;
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-6 rounded-[2rem] gap-4">
        <DialogHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold text-slate-800 truncate pr-6 max-w-[60vw]">
              {resolvedFilename}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Document Preview
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 pr-6">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 rounded-xl text-xs gap-1.5 border-slate-200"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={14} /> {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-[400px] flex items-center justify-center bg-slate-50/50 rounded-2xl p-4">
          {isImage ? (
            <img 
              src={url} 
              alt={resolvedFilename} 
              className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-sm bg-white"
            />
          ) : isPdf ? (
            <iframe 
              src={`${url}#toolbar=0`} 
              className="w-full h-[60vh] rounded-xl border border-slate-200 shadow-sm bg-white"
              title={resolvedFilename}
            />
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">No Preview Available</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  We cannot preview .{ext} files directly. Please download the file to view it.
                </p>
              </div>
              <Button 
                className="rounded-xl gap-2 mt-2"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download File'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

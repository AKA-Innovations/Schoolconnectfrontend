'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export const DeleteConfirmDialog = React.memo(function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirm Deletion',
  description = 'This action cannot be undone. Are you sure you want to delete this item?',
  onConfirm,
  loading = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={20} />
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

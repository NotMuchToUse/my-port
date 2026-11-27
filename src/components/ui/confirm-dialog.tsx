import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-red-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2.5 border-t border-zinc-200/80 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

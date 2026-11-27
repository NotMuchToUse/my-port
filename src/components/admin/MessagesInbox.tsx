import { useMemo, useState } from 'react';
import { Eye, Inbox, MailOpen, Trash2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import {
  deleteContactMessage,
  setMessageReadStatus,
} from '@/src/lib/data';
import { sortMessagesNewestFirst } from '@/src/lib/portfolioLogic';
import type { ContactMessage } from '@/src/types/database';

interface MessagesInboxProps {
  messages: ContactMessage[];
  onMessagesChange: (next: ContactMessage[]) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export function MessagesInbox({
  messages,
  onMessagesChange,
  onNotify,
}: MessagesInboxProps) {
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ordered = useMemo(
    () => sortMessagesNewestFirst(messages),
    [messages]
  );

  const handleToggleRead = async (msg: ContactMessage) => {
    const nextRead = !msg.is_read;
    const optimistic = messages.map((m) =>
      m.id === msg.id ? { ...m, is_read: nextRead } : m
    );
    onMessagesChange(optimistic);
    setSelected((prev) =>
      prev?.id === msg.id ? { ...msg, is_read: nextRead } : prev
    );

    try {
      const synced = await setMessageReadStatus(msg.id, nextRead);
      onMessagesChange(synced);
    } catch (err) {
      onMessagesChange(messages);
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to update message status.'
      );
    }
  };

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelected(msg.is_read ? msg : { ...msg, is_read: true });
    if (!msg.is_read) {
      await handleToggleRead(msg);
    }
  };

  const activeSelected = selected
    ? messages.find((m) => m.id === selected.id) ?? selected
    : null;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const next = await deleteContactMessage(deleteTarget.id);
      onMessagesChange(next);
      if (selected?.id === deleteTarget.id) {
        setSelected(null);
      }
      onNotify('success', `Deleted message "${deleteTarget.subject}".`);
      setDeleteTarget(null);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Failed to delete message.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-950">
          Contact Messages Inbox
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Review inbound inquiries ordered newest first.
        </p>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <Inbox className="mx-auto h-7 w-7 text-zinc-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-zinc-900">
            Your inbox is empty.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordered.map((msg) => (
            <div
              key={msg.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 transition-colors hover:border-zinc-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-950">
                      {msg.subject}
                    </h3>
                    {!msg.is_read && <Badge variant="featured">Unread</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    From {msg.sender_name} ({msg.sender_email})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(msg)}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>View</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRead(msg)}
                  >
                    <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{msg.is_read ? 'Mark Unread' : 'Mark Read'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete message ${msg.subject}`}
                    onClick={() => setDeleteTarget(msg)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-zinc-600 leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Full Message Detail Modal */}
      <Dialog
        open={Boolean(activeSelected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          {activeSelected && (
            <>
              <DialogHeader>
                <DialogTitle>{activeSelected.subject}</DialogTitle>
                <DialogDescription>
                  From {activeSelected.sender_name} ({activeSelected.sender_email})
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-zinc-200/80 bg-[#FAFAFA] p-4 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                {activeSelected.message}
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200/80 pt-4">
                <span className="font-mono text-xs text-zinc-400 tabular-nums">
                  {activeSelected.created_at.slice(0, 10)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRead(activeSelected)}
                  >
                    {activeSelected.is_read ? 'Mark Unread' : 'Mark Read'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(activeSelected)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Message"
        description={`Permanently delete the message "${deleteTarget?.subject ?? ''}"?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

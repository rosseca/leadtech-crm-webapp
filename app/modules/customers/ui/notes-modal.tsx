import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import { Card } from "~/components/ui/card";
import { useCustomerNotes, useCreateNote } from "../hooks/use-notes";

interface NotesModalProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function NotesModal({ customerId, open, onOpenChange }: NotesModalProps) {
  const [newNote, setNewNote] = useState("");
  const { data: notes, isLoading, error } = useCustomerNotes(customerId);
  const createNoteMutation = useCreateNote();

  const handleCreateNote = async () => {
    if (!customerId || !newNote.trim()) return;

    try {
      await createNoteMutation.mutateAsync({
        customerId,
        data: { content: newNote.trim() },
      });
      setNewNote("");
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  const handleClose = () => {
    setNewNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customer Notes</DialogTitle>
          <DialogDescription>
            View and add notes for this customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Note */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleCreateNote}
              disabled={!newNote.trim() || createNoteMutation.isPending}
              className="w-full"
            >
              {createNoteMutation.isPending ? "Adding..." : "Add Note"}
            </Button>
            {createNoteMutation.isError && (
              <p className="text-destructive text-sm text-center">
                Failed to add note. Please try again.
              </p>
            )}
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Previous Notes
            </h4>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <div className="text-destructive text-center py-4 text-sm">
                Failed to load notes. Please try again.
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {notes.map((note) => (
                  <Card key={note.id} className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      {note.author && <span>By: {note.author}</span>}
                      <span className={note.author ? "" : "ml-auto"}>
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                No notes yet. Add the first one above.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteCard } from '@/app/actions/card-actions';

interface DeleteCardDialogProps {
  cardId: number;
  deckId: number;
  cardFront: string;
}

export function DeleteCardDialog({ 
  cardId, 
  deckId, 
  cardFront 
}: DeleteCardDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure component is mounted before rendering Dialog to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteCard({
        id: cardId,
        deckId,
      });
      
      setIsOpen(false);
      router.refresh(); // Refresh server component data
    } catch (error) {
      console.error('Failed to delete card:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
  };

  // Prevent hydration mismatch by not rendering Dialog until mounted
  if (!mounted) {
    return (
      <Button variant="destructive" size="sm">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this card? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              Card to delete:
            </p>
            <p className="text-sm text-foreground line-clamp-3">
              {cardFront}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Card'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

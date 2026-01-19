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
import { deleteDeck } from '@/app/actions/deck-actions';

interface DeleteDeckDialogProps {
  deckId: number;
  deckName: string;
  cardCount: number;
}

export function DeleteDeckDialog({ 
  deckId, 
  deckName,
  cardCount
}: DeleteDeckDialogProps) {
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
      await deleteDeck({
        id: deckId,
      });
      
      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete deck:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete deck');
    } finally {
      setIsDeleting(false);
    }
  };

  // Prevent hydration mismatch by not rendering Dialog until mounted
  if (!mounted) {
    return (
      <Button variant="destructive" size="default">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Deck
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="default">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Deck</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this deck? This action cannot be undone.
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
              Deck to delete:
            </p>
            <p className="text-base font-semibold text-foreground mb-1">
              {deckName}
            </p>
            {cardCount > 0 && (
              <p className="text-sm text-destructive mt-2">
                ⚠️ This will permanently delete all {cardCount} {cardCount === 1 ? 'card' : 'cards'} in this deck.
              </p>
            )}
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
              {isDeleting ? 'Deleting...' : 'Delete Deck'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

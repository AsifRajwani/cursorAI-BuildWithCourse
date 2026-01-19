'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateCard } from '@/app/actions/card-actions';

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  currentFront: string;
  currentBack: string;
}

export function EditCardDialog({ 
  cardId, 
  deckId, 
  currentFront, 
  currentBack 
}: EditCardDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [front, setFront] = useState(currentFront);
  const [back, setBack] = useState(currentBack);

  // Ensure component is mounted before rendering Dialog to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFront(currentFront);
      setBack(currentBack);
      setError(null);
    }
  }, [isOpen, currentFront, currentBack]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    try {
      await updateCard({
        id: cardId,
        deckId,
        front,
        back,
      });
      
      setIsOpen(false);
      router.refresh(); // Refresh server component data
    } catch (error) {
      console.error('Failed to update card:', error);
      setError(error instanceof Error ? error.message : 'Failed to update card');
    } finally {
      setIsUpdating(false);
    }
  };

  // Prevent hydration mismatch by not rendering Dialog until mounted
  if (!mounted) {
    return (
      <Button variant="outline" size="sm">
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the question and answer for this flashcard
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="front">Question (Front)</Label>
            <Textarea
              id="front"
              name="front"
              placeholder="e.g., What is the capital of France?"
              rows={3}
              required
              value={front}
              onChange={(e) => setFront(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Answer (Back)</Label>
            <Textarea
              id="back"
              name="back"
              placeholder="e.g., Paris"
              rows={3}
              required
              value={back}
              onChange={(e) => setBack(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

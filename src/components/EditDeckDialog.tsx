'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateDeck } from '@/app/actions/deck-actions';

interface EditDeckDialogProps {
  deckId: number;
  currentName: string;
  currentDescription: string | null;
}

export function EditDeckDialog({ deckId, currentName, currentDescription }: EditDeckDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');

  // Ensure component is mounted before rendering Dialog to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    try {
      await updateDeck({
        id: deckId,
        name,
        description: description.trim() ? description.trim() : null,
      });
      
      setIsOpen(false);
      router.refresh(); // Refresh server component data
    } catch (error) {
      console.error('Failed to update deck:', error);
      setError(error instanceof Error ? error.message : 'Failed to update deck');
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset form to current values when opening
      setName(currentName);
      setDescription(currentDescription || '');
      setError(null);
    }
  };

  // Prevent hydration mismatch by not rendering Dialog until mounted
  if (!mounted) {
    return <Button variant="outline">Edit Deck</Button>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Deck</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update the name and description of your deck
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Deck Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Spanish Vocabulary"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g., Common Spanish words and phrases"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Deck'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

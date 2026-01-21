'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createDeck } from '@/app/actions/deck-actions';

interface CreateDeckDialogProps {
  hasUnlimitedDecks: boolean;
  currentDeckCount: number;
}

export function CreateDeckDialog({ 
  hasUnlimitedDecks,
  currentDeckCount 
}: CreateDeckDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Ensure component is mounted before rendering Dialog to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      await createDeck({
        name,
        description,
      });
      
      // Reset form fields
      setName('');
      setDescription('');
      setIsOpen(false);
      router.refresh(); // Refresh server component data
    } catch (error) {
      console.error('Failed to create deck:', error);
      setError(error instanceof Error ? error.message : 'Failed to create deck');
    } finally {
      setIsCreating(false);
    }
  };

  // Check if user has reached the free plan limit
  const hasReachedLimit = !hasUnlimitedDecks && currentDeckCount >= 3;

  // Prevent hydration mismatch by not rendering Dialog until mounted
  if (!mounted) {
    return (
      <Button size="lg" disabled={hasReachedLimit}>
        {hasReachedLimit ? 'Deck Limit Reached' : 'Create New Deck'}
      </Button>
    );
  }

  // If limit reached, show upgrade prompt instead of dialog
  if (hasReachedLimit) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button size="lg" disabled>
          Deck Limit Reached
        </Button>
        <p className="text-sm text-muted-foreground">
          You&apos;ve reached the 3 deck limit on the Free plan.{' '}
          <Link href="/pricing" className="text-primary hover:underline font-medium">
            Upgrade to Pro
          </Link>{' '}
          for unlimited decks.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Create New Deck</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Add a new flashcard deck to your collection
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
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this deck about?"
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Deck'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

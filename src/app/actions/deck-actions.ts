'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  insertDeck, 
  updateDeckById, 
  deleteDeckById 
} from '@/db/queries/decks';

// ============= Schemas =============

const CreateDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(255, 'Name too long').trim(),
  description: z.string().max(1000, 'Description too long').trim().optional(),
});

const UpdateDeckSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(1000).trim().optional(),
});

const DeleteDeckSchema = z.object({
  id: z.number().positive(),
});

// ============= Types =============

type CreateDeckInput = z.infer<typeof CreateDeckSchema>;
type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;
type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;

// ============= Server Actions =============

/**
 * Create a new deck
 */
export async function createDeck(input: CreateDeckInput) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Validate input with Zod
  const validatedData = CreateDeckSchema.parse(input);

  // Call mutation helper from db/queries
  const newDeck = await insertDeck(
    userId,
    validatedData.name,
    validatedData.description || null
  );

  // Revalidate the page to show new data
  revalidatePath('/dashboard');

  return newDeck;
}

/**
 * Update an existing deck
 */
export async function updateDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const validatedData = UpdateDeckSchema.parse(input);

  // Call mutation helper from db/queries
  const updatedDeck = await updateDeckById(
    validatedData.id,
    userId,
    {
      name: validatedData.name,
      description: validatedData.description,
    }
  );

  if (!updatedDeck) {
    throw new Error('Deck not found');
  }

  revalidatePath('/dashboard');

  return updatedDeck;
}

/**
 * Delete a deck
 */
export async function deleteDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const validatedData = DeleteDeckSchema.parse(input);

  // Call mutation helper from db/queries
  const deletedDeck = await deleteDeckById(validatedData.id, userId);

  if (!deletedDeck) {
    throw new Error('Deck not found');
  }

  revalidatePath('/dashboard');

  return { success: true };
}

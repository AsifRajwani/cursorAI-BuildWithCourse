'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  insertCard, 
  updateCardById, 
  deleteCardById 
} from '@/db/queries/cards';
import { getDeckById } from '@/db/queries/decks';

// ============= Schemas =============

const CreateCardSchema = z.object({
  deckId: z.number().positive(),
  front: z.string().min(1, 'Question is required').max(2000, 'Question too long').trim(),
  back: z.string().min(1, 'Answer is required').max(2000, 'Answer too long').trim(),
});

const UpdateCardSchema = z.object({
  id: z.number().positive(),
  deckId: z.number().positive(),
  front: z.string().min(1).max(2000).trim().optional(),
  back: z.string().min(1).max(2000).trim().optional(),
});

const DeleteCardSchema = z.object({
  id: z.number().positive(),
  deckId: z.number().positive(),
});

// ============= Types =============

type CreateCardInput = z.infer<typeof CreateCardSchema>;
type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
type DeleteCardInput = z.infer<typeof DeleteCardSchema>;

// ============= Server Actions =============

/**
 * Create a new card in a deck
 */
export async function createCard(input: CreateCardInput) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Validate input with Zod
  const validatedData = CreateCardSchema.parse(input);

  // Verify deck ownership before adding card
  const deck = await getDeckById(validatedData.deckId, userId);
  
  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  // Call mutation helper from db/queries
  const newCard = await insertCard(
    validatedData.deckId,
    validatedData.front,
    validatedData.back
  );

  // Revalidate the deck page to show new card
  revalidatePath(`/decks/${validatedData.deckId}`);

  return newCard;
}

/**
 * Update an existing card
 */
export async function updateCard(input: UpdateCardInput) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const validatedData = UpdateCardSchema.parse(input);

  // Verify deck ownership
  const deck = await getDeckById(validatedData.deckId, userId);
  
  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  // Call mutation helper from db/queries
  const updatedCard = await updateCardById(
    validatedData.id,
    validatedData.deckId,
    {
      front: validatedData.front,
      back: validatedData.back,
    }
  );

  if (!updatedCard) {
    throw new Error('Card not found');
  }

  revalidatePath(`/decks/${validatedData.deckId}`);

  return updatedCard;
}

/**
 * Delete a card
 */
export async function deleteCard(input: DeleteCardInput) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const validatedData = DeleteCardSchema.parse(input);

  // Verify deck ownership
  const deck = await getDeckById(validatedData.deckId, userId);
  
  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  // Call mutation helper from db/queries
  const deletedCard = await deleteCardById(validatedData.id, validatedData.deckId);

  if (!deletedCard) {
    throw new Error('Card not found');
  }

  revalidatePath(`/decks/${validatedData.deckId}`);

  return { success: true };
}

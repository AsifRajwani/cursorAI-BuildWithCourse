import { db } from '@/db';
import { decksTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ============= QUERIES (Read Operations) =============

/**
 * Get all decks for a specific user
 */
export async function getDecksByUserId(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

/**
 * Get a specific deck by ID and user ID (ensures ownership)
 */
export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  return deck;
}

// ============= MUTATIONS (Write Operations) =============

/**
 * Insert a new deck for a user
 */
export async function insertDeck(userId: string, name: string, description: string | null) {
  const [newDeck] = await db
    .insert(decksTable)
    .values({
      userId,
      name,
      description,
    })
    .returning();
  
  return newDeck;
}

/**
 * Update a deck by ID (ensures ownership via userId)
 */
export async function updateDeckById(
  deckId: number,
  userId: string,
  updates: { name?: string; description?: string | null }
) {
  const [updatedDeck] = await db
    .update(decksTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return updatedDeck;
}

/**
 * Delete a deck by ID (ensures ownership via userId)
 */
export async function deleteDeckById(deckId: number, userId: string) {
  const [deletedDeck] = await db
    .delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return deletedDeck;
}

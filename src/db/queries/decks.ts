import { db } from '@/db';
import { cardsTable, decksTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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
 * Get all decks with card counts for a specific user
 */
export async function getDecksWithCardCountByUserId(userId: string) {
  return await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: sql<number>`count(${cardsTable.id})`.mapWith(Number),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id);
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
  // Build the update object explicitly to handle null values
  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };
  
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  
  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }
  
  const [updatedDeck] = await db
    .update(decksTable)
    .set(updateData)
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

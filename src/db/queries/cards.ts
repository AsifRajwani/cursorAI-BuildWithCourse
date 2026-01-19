import { db } from '@/db';
import { cardsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============= QUERIES (Read Operations) =============

/**
 * Get all cards for a specific deck, sorted by updatedAt (latest first)
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

/**
 * Get a specific card by ID
 */
export async function getCardById(cardId: number, deckId: number) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .limit(1);
  
  return card;
}

// ============= MUTATIONS (Write Operations) =============

/**
 * Insert a new card into a deck
 */
export async function insertCard(deckId: number, front: string, back: string) {
  const [newCard] = await db
    .insert(cardsTable)
    .values({
      deckId,
      front,
      back,
    })
    .returning();
  
  return newCard;
}

/**
 * Update a card by ID
 */
export async function updateCardById(
  cardId: number,
  deckId: number,
  updates: { front?: string; back?: string }
) {
  const [updatedCard] = await db
    .update(cardsTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .returning();
  
  return updatedCard;
}

/**
 * Delete a card by ID
 */
export async function deleteCardById(cardId: number, deckId: number) {
  const [deletedCard] = await db
    .delete(cardsTable)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .returning();
  
  return deletedCard;
}

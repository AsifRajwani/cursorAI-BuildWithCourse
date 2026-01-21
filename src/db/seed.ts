import 'dotenv/config';
import { db } from './index';
import { decksTable, cardsTable } from './schema';

/**
 * Seed file for development/testing purposes
 * Note: In production, use query helpers from db/queries directory
 * This file is allowed to have direct db operations as it's a utility script
 */
async function main() {
  console.log('Seeding database...');
  
  // Example: Create a sample deck
  const deck: typeof decksTable.$inferInsert = {
    userId: 'user_seed_example', // Replace with a real Clerk user ID
    name: 'Sample Spanish Vocabulary',
    description: 'Basic Spanish words for beginners',
  };
  
  const [newDeck] = await db.insert(decksTable).values(deck).returning();
  console.log('New deck created:', newDeck);

  // Example: Create sample cards for the deck
  const cards: typeof cardsTable.$inferInsert[] = [
    {
      deckId: newDeck.id,
      front: 'Hello',
      back: 'Hola',
    },
    {
      deckId: newDeck.id,
      front: 'Goodbye',
      back: 'Adiós',
    },
    {
      deckId: newDeck.id,
      front: 'Thank you',
      back: 'Gracias',
    },
  ];
  
  await db.insert(cardsTable).values(cards);
  console.log('Sample cards created!');

  // Read all decks
  const decks = await db.select().from(decksTable);
  console.log('All decks:', decks);

  console.log('Seeding completed!');
}

main();

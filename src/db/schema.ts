import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Decks table - represents a collection of flashcards
export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Cards table - represents individual flashcards within a deck
export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(), // Question/prompt (e.g., "Dog" or "When was the battle of hastings?")
  back: text().notNull(), // Answer (e.g., "Anjing" or "1066")
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

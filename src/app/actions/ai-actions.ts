'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { insertCard } from '@/db/queries/cards';
import { getDeckById } from '@/db/queries/decks';

// ============= Schemas =============

const GenerateFlashcardsSchema = z.object({
  deckId: z.number().positive(),
});

type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsSchema>;

// Flashcard schema for AI output
const FlashcardSchema = z.object({
  front: z.string().describe('The front of the flashcard'),
  back: z.string().describe('The back of the flashcard'),
});

const FlashcardsResponseSchema = z.object({
  cards: z.array(FlashcardSchema).describe('Array of flashcards'),
});

// ============= Server Actions =============

/**
 * Generate AI flashcards based on deck name and description
 */
export async function generateAIFlashcards(input: GenerateFlashcardsInput) {
  const { userId, has } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // Check if user has AI generation feature (Pro users only)
  const hasAIGeneration = has({ feature: 'ai_flashcard_generation' });
  
  if (!hasAIGeneration) {
    throw new Error('AI flashcard generation is only available for Pro users. Please upgrade your plan.');
  }
  
  // Validate input
  const validatedData = GenerateFlashcardsSchema.parse(input);
  
  // Verify user owns the deck
  const deck = await getDeckById(validatedData.deckId, userId);
  
  if (!deck) {
    throw new Error('Deck not found');
  }

  // Validate that deck has a title and description
  if (!deck.name || !deck.name.trim()) {
    throw new Error('Deck must have a title before generating AI flashcards');
  }

  if (!deck.description || !deck.description.trim()) {
    throw new Error('Deck must have a description before generating AI flashcards. Please add a description to help the AI understand what to generate.');
  }
  
  try {
    // Generate flashcards using AI with a context-aware prompt
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: FlashcardsResponseSchema,
      prompt: `Generate 20 flashcards for a deck titled "${deck.name}" with the description: "${deck.description}".

Based on the deck's name and description, determine the most appropriate flashcard format and style. Use your understanding of the subject matter to create effective learning materials.

Guidelines:
- Adapt the format to match the subject matter (e.g., simple translations for vocabulary, questions for concepts, terms for definitions)
- Front: Should be concise and clear (word, phrase, question, or term as appropriate)
- Back: Should provide the essential information needed (translation, answer, definition, or explanation as appropriate)
- Start with fundamental concepts and progressively increase difficulty
- Ensure variety and comprehensive coverage of the topic
- Keep content focused and avoid unnecessary verbosity

Generate the flashcards now, using the format that best serves the learning goals indicated by the deck's description:`,
    });
    
    // Insert generated cards into database
    const insertedCards = [];
    for (const card of object.cards) {
      const insertedCard = await insertCard(
        validatedData.deckId,
        card.front,
        card.back
      );
      insertedCards.push(insertedCard);
    }
    
    // Revalidate the deck page to show new cards
    revalidatePath(`/decks/${validatedData.deckId}`);
    
    return {
      success: true,
      cardsCreated: insertedCards.length,
      cards: insertedCards,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('insufficient_quota')) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
      
      if (error.message.includes('rate_limit_exceeded')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
    }
    
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

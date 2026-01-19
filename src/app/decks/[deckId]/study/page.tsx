import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getDeckById } from '@/db/queries/decks';
import { getCardsByDeckId } from '@/db/queries/cards';
import { StudySession } from '@/components/StudySession';

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  const { deckId: deckIdParam } = await params;
  const deckId = parseInt(deckIdParam);

  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch deck and verify ownership
  const deck = await getDeckById(deckId, userId);

  if (!deck) {
    notFound();
  }

  // Fetch cards for this deck
  const cards = await getCardsByDeckId(deckId);

  return <StudySession deck={deck} cards={cards} />;
}

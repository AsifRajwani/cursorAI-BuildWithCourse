import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDeckById } from '@/db/queries/decks';
import { getCardsByDeckId } from '@/db/queries/cards';
import { EditDeckDialog } from '@/components/EditDeckDialog';
import { DeleteDeckDialog } from '@/components/DeleteDeckDialog';
import { EditCardDialog } from '@/components/EditCardDialog';
import { DeleteCardDialog } from '@/components/DeleteCardDialog';
import { AddCardDialog } from '@/components/AddCardDialog';
import { GenerateAIButton } from '@/components/GenerateAIButton';

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId, has } = await auth();
  
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

  // Check if user has AI generation feature
  const hasAIGeneration = has({ feature: 'ai_flashcard_generation' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{deck.name}</h1>
              {deck.description && (
                <p className="mt-2 text-muted-foreground">{deck.description}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'}
              </p>
            </div>
            <div className="flex gap-2">
              <EditDeckDialog 
                deckId={deckId}
                currentName={deck.name}
                currentDescription={deck.description}
              />
              <DeleteDeckDialog 
                deckId={deckId}
                deckName={deck.name}
                cardCount={cards.length}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <AddCardDialog deckId={deckId} />
          <GenerateAIButton 
            deckId={deckId} 
            hasAIGeneration={hasAIGeneration}
            hasDescription={!!deck.description && deck.description.trim().length > 0}
            deckName={deck.name}
          />
          {cards.length > 0 && (
            <Link href={`/decks/${deckId}/study`}>
              <Button variant="default" size="default">
                📚 Study Cards
              </Button>
            </Link>
          )}
        </div>

        {/* Cards List */}
        {cards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No cards yet. Add your first card to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Question</CardTitle>
                      <CardDescription className="text-base text-foreground mt-2">
                        {card.front}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <EditCardDialog
                        cardId={card.id}
                        deckId={deckId}
                        currentFront={card.front}
                        currentBack={card.back}
                      />
                      <DeleteCardDialog
                        cardId={card.id}
                        deckId={deckId}
                        cardFront={card.front}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      Answer
                    </p>
                    <p className="text-base text-foreground">{card.back}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

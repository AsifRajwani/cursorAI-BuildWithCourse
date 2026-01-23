'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { InferSelectModel } from 'drizzle-orm';
import { decksTable, cardsTable } from '@/db/schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Deck = InferSelectModel<typeof decksTable>;
type CardType = InferSelectModel<typeof cardsTable>;

interface StudySessionProps {
  deck: Deck;
  cards: CardType[];
}

export function StudySession({ deck, cards }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<CardType[]>(cards);
  const [answers, setAnswers] = useState<Record<number, 'correct' | 'wrong'>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = shuffledCards[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, shuffledCards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers({});
    setIsComplete(false);
  };

  const handleShuffle = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers({});
    setIsComplete(false);
  };

  const handleAnswer = (answer: 'correct' | 'wrong') => {
    // Record the answer for current card
    setAnswers(prev => ({
      ...prev,
      [currentCard.id]: answer
    }));

    // Move to next card or show results
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case ' ':
          event.preventDefault();
          handleFlip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevious, handleNext, handleFlip]);

  // Handle case when no cards exist
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="outline" className="mb-4">
              ← Back to Deck
            </Button>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>No Cards Available</CardTitle>
              <CardDescription>
                This deck doesn&apos;t have any cards yet. Add some cards before starting a study session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/decks/${deck.id}`}>
                <Button>Go to Deck</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate score
  const correctCount = Object.values(answers).filter(a => a === 'correct').length;
  const wrongCount = Object.values(answers).filter(a => a === 'wrong').length;
  const totalAnswered = correctCount + wrongCount;
  const percentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Show results screen when complete
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-4xl">Study Session Complete! 🎉</CardTitle>
                <CardDescription className="text-center text-lg mt-4">
                  {deck.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {percentage}%
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-green-500">{correctCount}</p>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-red-500">{wrongCount}</p>
                      <p className="text-sm text-muted-foreground">Wrong</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{totalAnswered}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Accuracy</span>
                    <span>{correctCount}/{totalAnswered}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-8">
                  <Button onClick={handleRestart} size="lg" variant="default">
                    Study Again
                  </Button>
                  <Button onClick={handleShuffle} size="lg" variant="secondary">
                    Study with Shuffled Cards
                  </Button>
                  <Link href={`/decks/${deck.id}`}>
                    <Button size="lg" variant="outline" className="w-full">
                      Return to Deck
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/decks/${deck.id}`}>
              <Button variant="outline">
                ← Back to Deck
              </Button>
            </Link>
            <Button onClick={handleShuffle} variant="secondary">
              🔀 Shuffle Cards
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground">{deck.name}</h1>
          {deck.description && (
            <p className="mt-2 text-muted-foreground">{deck.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4 text-center">
          <p className="text-lg text-muted-foreground">
            Card {currentIndex + 1} of {shuffledCards.length}
          </p>
          <div className="mt-2 w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <Card 
            className="w-full max-w-2xl min-h-[400px] cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={handleFlip}
          >
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {isFlipped ? 'Answer' : 'Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <p className="text-2xl text-center text-foreground">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {!isFlipped 
              ? 'Click the card to flip it • Use ← → arrows to navigate • Spacebar to flip'
              : 'Mark your answer as correct or wrong to continue'
            }
          </p>
        </div>

        {/* Answer Buttons (shown when flipped) */}
        {isFlipped ? (
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={() => handleAnswer('wrong')}
              variant="destructive"
              size="lg"
              className="min-w-[150px]"
            >
              ✗ Wrong
            </Button>
            <Button
              onClick={() => handleAnswer('correct')}
              variant="default"
              size="lg"
              className="min-w-[150px] bg-green-600 hover:bg-green-700"
            >
              ✓ Correct
            </Button>
          </div>
        ) : (
          /* Navigation Controls (shown when not flipped) */
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              size="lg"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleFlip}
              variant="default"
              size="lg"
            >
              Flip Card
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === shuffledCards.length - 1}
              variant="outline"
              size="lg"
            >
              Next →
            </Button>
          </div>
        )}

        {/* Score Display */}
        {totalAnswered > 0 && (
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Current Score: <span className="text-green-500 font-semibold">{correctCount} correct</span> • <span className="text-red-500 font-semibold">{wrongCount} wrong</span> • {percentage}% accuracy
            </p>
          </div>
        )}

        {/* Additional Actions */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleRestart}
            variant="secondary"
          >
            Restart Session
          </Button>
        </div>
      </div>
    </div>
  );
}

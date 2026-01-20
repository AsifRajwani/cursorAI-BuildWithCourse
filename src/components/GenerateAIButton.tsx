'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generateAIFlashcards } from '@/app/actions/ai-actions';

interface GenerateAIButtonProps {
  deckId: number;
  hasAIGeneration: boolean;
  hasDescription: boolean;
  deckName: string;
}

export function GenerateAIButton({ deckId, hasAIGeneration, hasDescription, deckName }: GenerateAIButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  async function handleClick() {
    // If user doesn't have pro plan, redirect to pricing page
    if (!hasAIGeneration) {
      router.push('/pricing');
      return;
    }
    
    // If missing description, show alert
    if (!hasDescription) {
      alert(`Please add a description to "${deckName}" before generating AI flashcards. The description helps the AI understand what type of flashcards to create.`);
      return;
    }
    
    // If already generating, do nothing
    if (isGenerating) {
      return;
    }
    
    // Generate flashcards
    setIsGenerating(true);
    try {
      const result = await generateAIFlashcards({ deckId });
      
      // Show success message (could be replaced with a toast)
      alert(`Successfully generated ${result.cardsCreated} flashcards!`);
    } catch (error) {
      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards';
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }
  
  // Determine tooltip message
  let tooltipMessage = '';
  
  if (isGenerating) {
    tooltipMessage = 'Generating flashcards...';
  } else if (!hasAIGeneration) {
    tooltipMessage = 'AI flashcard generation is a Pro feature. Click to upgrade!';
  } else if (!hasDescription) {
    tooltipMessage = `Add a description to "${deckName}" to enable AI generation`;
  } else {
    tooltipMessage = 'Generate flashcards automatically using AI based on your deck description';
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            onClick={handleClick}
            disabled={isGenerating}
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate Cards with AI'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { SubscriptionDetailsButton } from '@clerk/nextjs/experimental';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingCardsProps {
  userId: string | null;
  isPro: boolean;
  isFree: boolean;
}

export function PricingCards({ userId, isPro, isFree }: PricingCardsProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { openUserProfile } = useClerk();

  const handleOpenBilling = () => {
    // Open user profile modal directly to the billing page
    // @ts-ignore - __experimental_startPath is not in types yet
    openUserProfile({
      __experimental_startPath: '/billing',
      appearance: {
        elements: {
          rootBox: 'z-[9999]',
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card className={`relative ${isFree ? 'border-primary border-2' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">Free</CardTitle>
              {isFree && (
                <Badge variant="default">Current Plan</Badge>
              )}
            </div>
            <CardDescription className="text-lg mt-2">
              Perfect for getting started
            </CardDescription>
            <div className="mt-4">
              <span className="text-5xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground">Up to 3 flashcard decks</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground">Unlimited cards per deck</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground">Study mode</span>
              </div>
              <div className="flex items-start opacity-50">
                <svg
                  className="h-6 w-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span className="text-muted-foreground">AI flashcard generation</span>
              </div>
            </div>

            {!userId ? (
              <Link href="/">
                <Button className="w-full" variant="outline">
                  Sign Up Free
                </Button>
              </Link>
            ) : isFree ? (
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            ) : (
              <SubscriptionDetailsButton for="user">
                <Button className="w-full" variant="outline">
                  Manage Subscription
                </Button>
              </SubscriptionDetailsButton>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative ${isPro ? 'border-primary border-2' : 'border-primary'}`}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Badge className="text-sm px-4 py-1">Popular</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">Pro</CardTitle>
              {isPro && (
                <Badge variant="default">Current Plan</Badge>
              )}
            </div>
            <CardDescription className="text-lg mt-2">
              For serious learners
            </CardDescription>
            
            {/* Billing Toggle - Segmented Control */}
            <div className="flex items-center gap-1 mt-6 p-1 bg-muted rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  !isAnnual
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {!isAnnual && (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                <span className={!isAnnual ? 'underline underline-offset-2 decoration-2' : ''}>
                  Monthly
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAnnual
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {isAnnual && (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                <span className={isAnnual ? 'underline underline-offset-2 decoration-2' : ''}>
                  Annual
                </span>
                <Badge 
                  variant={isAnnual ? "outline" : "secondary"} 
                  className={`text-xs ${isAnnual ? 'bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20' : ''}`}
                >
                  Save 25%
                </Badge>
              </button>
            </div>

            <div className="mt-4">
              {isAnnual ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">$180</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    $15/month billed annually
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">$20</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Billed monthly
                  </p>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground font-semibold">Unlimited flashcard decks</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground">Unlimited cards per deck</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground">Study mode</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-foreground font-semibold">AI flashcard generation</span>
              </div>
            </div>

            {!userId ? (
              <Link href="/">
                <Button className="w-full">
                  Get Started
                </Button>
              </Link>
            ) : (
              <Button 
                className="w-full"
                onClick={handleOpenBilling}
              >
                {isPro ? 'Manage Subscription' : 'View Plans & Upgrade'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

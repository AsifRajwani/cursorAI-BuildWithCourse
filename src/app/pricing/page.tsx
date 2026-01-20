import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PricingCards } from '@/components/PricingCards';

export default async function PricingPage() {
  const { userId, has } = await auth();
  
  // Check current plan if user is authenticated
  const isPro = userId ? has({ plan: 'pro' }) : false;
  const isFree = userId ? has({ plan: 'free_user' }) : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards Component */}
        <PricingCards userId={userId} isPro={isPro} isFree={isFree} />

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Can I change plans at any time?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards through our secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What happens if I reach the deck limit on the Free plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You&apos;ll need to upgrade to Pro to create more than 3 decks, or you can delete existing decks to make room for new ones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How does AI flashcard generation work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pro users can use AI to automatically generate flashcards from text or topics, saving time creating study materials.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Dashboard */}
        {userId && (
          <div className="text-center mt-16">
            <Link href="/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

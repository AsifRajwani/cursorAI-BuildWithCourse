import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDecksByUserId } from '@/db/queries/decks';
import { CreateDeckDialog } from '@/components/CreateDeckDialog';

export default async function DashboardPage() {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Fetch data using query helper from db/queries
  const decks = await getDecksByUserId(userId);

  // Check if user has unlimited decks feature (pro plan)
  const hasUnlimitedDecks = has({ feature: 'unlimited_deck' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your flashcard decks
              {!hasUnlimitedDecks && (
                <span className="block mt-1 text-sm">
                  Free plan: {decks.length}/3 decks used
                </span>
              )}
            </p>
          </div>
          <CreateDeckDialog 
            hasUnlimitedDecks={hasUnlimitedDecks}
            currentDeckCount={decks.length}
          />
        </div>

        {!hasUnlimitedDecks && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Upgrade to Pro
                    </h3>
                    <Badge variant="default">Limited Time</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unlock unlimited decks, AI-powered flashcard generation, and more premium features.
                  </p>
                </div>
                <Link href="/pricing">
                  <Button size="lg" className="whitespace-nowrap">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {decks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No decks yet. Create your first deck to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                    {deck.description && (
                      <CardDescription>{deck.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(deck.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

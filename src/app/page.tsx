import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInDialog } from '@/components/SignInDialog';

export default async function Home() {
  const { userId } = await auth();
  
  // Redirect logged-in users to dashboard immediately on server side
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            FlashyCardy
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        <SignInDialog />
      </div>
    </div>
  );
}

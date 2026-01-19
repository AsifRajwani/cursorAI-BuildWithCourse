'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SignIn, SignUp } from '@clerk/nextjs';

export function SignInDialog() {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering Dialog to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering Dialog until mounted
  if (!mounted) {
    return (
      <div className="flex gap-4">
        <Button size="lg">Sign In</Button>
        <Button size="lg" variant="outline">Sign Up</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Sign In Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">Sign In</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Sign in to your account to continue
            </DialogDescription>
          </DialogHeader>
          <SignIn 
            routing="hash" 
            signUpUrl="/#/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="outline">
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Sign up to get started
            </DialogDescription>
          </DialogHeader>
          <SignUp 
            routing="hash" 
            signInUrl="/#/sign-in"
            forceRedirectUrl="/dashboard"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

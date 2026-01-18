'use client';

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

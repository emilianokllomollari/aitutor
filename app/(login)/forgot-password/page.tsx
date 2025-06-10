"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { requestPasswordReset } from "../actions";

type ResetState =
  | { error: string; success?: undefined }
  | { success: string; error?: undefined };

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    async (_prevState, formData) => {
      return await requestPasswordReset(formData);
    },
    { error: "" }
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we’ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            {state.success && (
              <p className="text-sm text-green-600">{state.success}</p>
            )}

            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/sign-in"
                className="underline underline-offset-4 text-muted-foreground hover:text-primary"
              >
                Go back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

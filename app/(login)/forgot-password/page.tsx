"use client";

import { useActionState } from "react";
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we’ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

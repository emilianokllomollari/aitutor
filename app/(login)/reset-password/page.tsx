"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
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
import { resetPassword } from "../actions"; // You’ll define this server action

type ResetState =
  | { error: string; success?: undefined }
  | { success: string; error?: undefined };

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    async (_prev, formData) => {
      return await resetPassword(formData);
    },
    { error: "" }
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter a new password below to complete your reset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="token" value={token || ""} />

            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            {state.success && (
              <p className="text-sm text-green-600">{state.success}</p>
            )}

            <Button type="submit" disabled={pending}>
              {pending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

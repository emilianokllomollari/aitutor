"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "../actions";
import { siteConfig } from "@/lib/config/site";

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
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src={siteConfig.logoUrl}
            alt={`${siteConfig.name} Logo`}
            className="h-12 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we’ll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          {state.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}

          <Button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            disabled={pending}
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm">
            <Link
              href="/sign-in"
              className="underline underline-offset-4 text-muted-foreground hover:text-orange-600"
            >
              Go back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

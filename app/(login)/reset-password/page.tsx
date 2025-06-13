"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "../actions";
import { siteConfig } from "@/lib/config/site";
import Link from "next/link";

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

  const t = siteConfig.auth.resetPassword;

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
          {t.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t.description}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="token" value={token || ""} />

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {t.passwordLabel}
            </Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700"
            >
              {t.confirmLabel}
            </Label>
            <div className="mt-1">
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
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
            {pending ? t.pending : t.submit}
          </Button>

          <div className="text-center text-sm">
            <Link
              href="/sign-in"
              className="underline underline-offset-4 text-muted-foreground hover:text-orange-600"
            >
              {siteConfig.auth.forgotPassword.goBack}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

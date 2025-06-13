"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import { siteConfig } from "@/lib/config/site";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const t = siteConfig.auth.login;
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
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
          {mode === "signin" ? t.title : t.altTitle}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ""} />
          <input type="hidden" name="priceId" value={priceId || ""} />
          <input type="hidden" name="inviteId" value={inviteId || ""} />

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
                autoComplete="email"
                defaultValue={searchParams.get("email") || state.email || ""}
                required
                readOnly={Boolean(searchParams.get("email"))}
                maxLength={50}
                className={`appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm ${
                  searchParams.get("email")
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              {mode === "signin" && (
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-orange-600"
                >
                  {t.forgotPassword}
                </Link>
              )}
            </div>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {t.loading}
                </>
              ) : mode === "signin" ? (
                t.submitSignin
              ) : (
                t.submitSignup
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {mode === "signin" ? t.promptAlt : t.promptBack}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
                redirect ? `?redirect=${redirect}` : ""
              }${priceId ? `&priceId=${priceId}` : ""}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {mode === "signin" ? t.switchToSignup : t.switchToSignin}
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          {siteConfig.auth.agreement.text}{" "}
          <Link
            href="#"
            className="underline underline-offset-4 hover:text-orange-600"
          >
            {siteConfig.auth.agreement.terms}
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="underline underline-offset-4 hover:text-orange-600"
          >
            {siteConfig.auth.agreement.privacy}
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

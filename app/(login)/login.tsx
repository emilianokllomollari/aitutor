"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Login with your email and password"
              : "Start your journey with us"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-6">
            <input type="hidden" name="redirect" value={redirect || ""} />
            <input type="hidden" name="priceId" value={priceId || ""} />
            <input type="hidden" name="inviteId" value={inviteId || ""} />

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                defaultValue={state.email}
                required
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                defaultValue={state.password}
                required
              />
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm">{state.error}</div>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {mode === "signin" ? "Signing in..." : "Signing up..."}
                </>
              ) : mode === "signin" ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </Button>

            <div className="text-center text-sm">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/sign-up${redirect ? `?redirect=${redirect}` : ""}${
                      priceId ? `&priceId=${priceId}` : ""
                    }`}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href={`/sign-in${redirect ? `?redirect=${redirect}` : ""}${
                      priceId ? `&priceId=${priceId}` : ""
                    }`}
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

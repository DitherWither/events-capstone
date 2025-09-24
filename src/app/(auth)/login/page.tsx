"use client";
import { AlertCircleIcon, GalleryVerticalEnd } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { login } from "~/server/auth";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useRouter } from "next/navigation";
import { PasswordInput } from "~/components/ui/password-input";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const formData = new FormData(e.currentTarget);
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;

          const { error } = await login({ email, password });

          if (error) {
            if (typeof error === "string") {
              setError(error);
            } else {
              setError(null);
            }
            if (typeof error === "object") {
              setEmailError(error.email);
              setPasswordError(error.password);
            } else {
              setEmailError(null);
              setPasswordError(null);
            }
            return;
          }
          router.push("/");
        }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Cappuchino Events</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to Cappuchino Events</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Error while logging in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              {emailError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{emailError}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                name="password"
                id="password"
                placeholder="••••••••"
                className="rounded-r-none border-r-0"
                minLength={9}
                required
              />
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
            </div>
            <Button type="submit" className="mt-6 w-full">
              Login
            </Button>
          </div>
        </div>
      </form>
      {/* <div className="flex justify-center">
        <Button variant="link" className="text-sm">
          Forgot password?
        </Button>
      </div> */}
    </div>
  );
}

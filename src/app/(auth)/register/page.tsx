"use client";
import { AlertCircleIcon, GalleryVerticalEnd } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { register } from "~/server/auth";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useRouter } from "next/navigation";
import { PasswordInput } from "~/components/ui/password-input";
import Link from "next/link";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const { error } = await register({ name, email, password });

        if (error) {
          if (typeof error === "string") {
            setError(error);
          } else {
            setError(null);
          }
          if (typeof error === "object") {
            setNameError(error.name);
            setEmailError(error.email);
            setPasswordError(error.password);
          } else {
            setNameError(null);
            setEmailError(null);
            setPasswordError(null);
          }
          return;
        }

        router.push("/");
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <Link href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Cappuchino Events</span>
        </Link>
        <h1 className="text-xl font-bold">Welcome to Cappuchino Events</h1>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Error while making your account</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            required
          />
        </div>

        {nameError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{nameError}</AlertDescription>
          </Alert>
        )}

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

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            name="confirmPassword"
            id="confirmPassword"
            placeholder="••••••••"
            className="rounded-r-none border-r-0"
            minLength={9}
            required
          />
        </div>

        <Button type="submit" className="mt-6 w-full">
          Register
        </Button>
      </div>
    </form>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { loginAction } from "@/actions/auth";

interface LoginFormProps {
  errorMessage?: string;
}

export function LoginForm({ errorMessage }: LoginFormProps) {
  return (
    <form action={loginAction} className="grid gap-4">
      {errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
      <Button type="submit" className="w-full">
        Sign in with Keycloak
      </Button>
    </form>
  );
}

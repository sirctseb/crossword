"use client";

import { GoogleSignInButton, SignInAuthScreen } from "@firebase-ui/react";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function Screen() {
  const router = useRouter();

  return (
    <SignInAuthScreen
      onForgotPasswordClick={() => router.push("/forgot-password")}
      onRegisterClick={() => router.push("/register")}
    >
      <GoogleSignInButton />
      <div>
        <Link href="/sign-in/phone">Sign in with phone number</Link>
      </div>
      <div>
        <Link href="/sign-in/email">Sign in with email link</Link>
      </div>
    </SignInAuthScreen>
  );
}

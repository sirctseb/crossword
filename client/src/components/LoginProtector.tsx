"use client";

import { useAtomValue } from "jotai";
import { authAtom } from "../jotai-firebase/atoms/authAtom";

// TODO this might make SSR even harder? I guess we'll need an arbitrary
// solution for priming atom state anyway, including waiting on auth
export const LoginProtector = ({ children }: { children: React.ReactNode }) => {
  const auth = useAtomValue(authAtom);

  if (auth.isEmpty) {
    return <div>loading...</div>;
  }
  return children;
};

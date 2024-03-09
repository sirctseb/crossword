"use client";

import { useRecoilValue } from "recoil";
import { authAtom } from "../firebase-recoil/atoms";

// TODO this might make SSR even harder? I guess we'll need an arbitrary
// solution for priming atom state anyway, including waiting on auth
export const LoginProtector = ({ children }: { children: React.ReactNode }) => {
  // should we, instead, move this knowledge into firebase-recoil?
  const auth = useRecoilValue(authAtom);

  if (auth.isEmpty) {
    return <div>loading...</div>;
  }
  return children;
};

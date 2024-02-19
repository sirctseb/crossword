"use client";

import { useRecoilValue } from "recoil";
import { authAtom } from "../../firebase-recoil/atoms";
import { ConnectedUser } from "../../components/User/User";

export default function UserDashboard() {
  const { user } = useRecoilValue(authAtom);

  if (!user?.uid) {
    // TODO improve, CTA to log in
    return "Not logged in";
  }

  return <ConnectedUser />;
}

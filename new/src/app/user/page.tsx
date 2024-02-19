"use client";

import { useRecoilValue } from "recoil";
import { ConnectedPreviewList } from "../../components/User/PreviewList";
import { authAtom } from "../../firebase-recoil/atoms";

export default function UserDashboard() {
  const { user } = useRecoilValue(authAtom);

  if (!user?.uid) {
    // TODO improve, CTA to log in
    return "Not logged in";
  }

  return (
    <ConnectedPreviewList userId={user.uid}>My Crosswords</ConnectedPreviewList>
  );
}

import React from "react";
import { useRecoilValue } from "recoil";

import { block } from "../../styles/index";
import { ConnectedPreviewList } from "./PreviewList";
// import WordList from "./WordList";
import { UserSection } from "./UserSection";
import { authAtom } from "../../firebase-recoil/atoms";

const bem = block("user");

export interface UserProps {
  userId: string;
}

export const User: React.FC<UserProps> = ({ userId }) => {
  return (
    <div className={bem()}>
      <UserSection>
        <ConnectedPreviewList userId={userId}>
          My Crosswords
        </ConnectedPreviewList>
      </UserSection>
      {/* <UserSection><WordList userId={userId} /></UserSection> */}
    </div>
  );
};

export const ConnectedUser = () => {
  const { user } = useRecoilValue(authAtom);
  // TODO skeleton view before user (and subsequently display data)
  // is loaded
  if (!user) {
    return "Not logged in";
  }
  return <User userId={user.uid}></User>;
};

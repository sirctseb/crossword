import React from "react";
import { useRecoilValue } from "recoil";

import { block } from "../../styles/index";
import { ConnectedPreviewList } from "./PreviewList";
import { UserSection } from "./UserSection";
import { authAtom } from "../../firebase-recoil/atoms";
import { ConnectedWordList } from "./WordList";

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
      <UserSection>
        <ConnectedWordList userId={userId} />
      </UserSection>
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

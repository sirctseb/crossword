import React from "react";

import { block } from "../../styles/index";
import { ConnectedPreviewList } from "./PreviewList";
import { UserSection } from "./UserSection";
import { ConnectedWordList } from "./WordList";
import { useAuth } from "../../firebase/useFirebase";

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
  const auth = useAuth();
  // TODO skeleton view before user (and subsequently display data)
  // is loaded
  if (auth.isEmpty) {
    return "Not logged in";
  }

  return <User userId={auth.user.uid}></User>;
};

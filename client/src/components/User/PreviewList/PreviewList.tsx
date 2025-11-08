import React from "react";

import { block } from "../../../styles";
import { ConnectedCrosswordPreview } from "../../CrosswordPreview";
import { CrosswordMetadata, type FirebaseArray } from "../../../firebase/types";
import { coerceToObject } from "../../../firebase/coerceToObject";
import { useRecoilValue } from "recoil";

import "./preview-list.scss";
import { userCrosswordAtom } from "../../../firebase-recoil/atoms";
const bem = block("preview-list");

interface PreviewListProps {
  children: React.ReactNode;
  crosswords: FirebaseArray<string, CrosswordMetadata>;
}

export const PreviewList: React.FC<PreviewListProps> = ({
  children,
  crosswords,
}) => {
  const crosswordsObject = coerceToObject(crosswords);
  return (
    <div className={bem()}>
      <div className={bem("title")}>{children}</div>
      <div className={bem("list")}>
        {Object.keys(crosswords).map((id) => (
          <ConnectedCrosswordPreview
            id={id}
            key={id}
            metadata={crosswordsObject[id]}
          />
        ))}
      </div>
    </div>
  );
};

interface ConnectedPreviewListProps {
  userId: string;
  children: React.ReactNode;
}

export const ConnectedPreviewList: React.FC<ConnectedPreviewListProps> = ({
  children,
  userId,
}) => {
  const crosswords = useRecoilValue(userCrosswordAtom({ userId }));
  if (!crosswords) {
    // TODO some informative message about not having made any crosswords
    // maybe CTA to make one
    return null;
  }
  return <PreviewList crosswords={crosswords}>{children}</PreviewList>;
};

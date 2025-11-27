import React from "react";
import Link from "next/link";

import { CrosswordMetadata } from "../../firebase/types";

import { block } from "../../styles";
import "./crossword-preview.scss";
import { type ArrayCrossword } from "../../state";
import { useAtomValue } from "jotai";
import { arrayCrosswordAtomFamily } from "../../state/atoms/selectors";

const bem = block("crossword-preview");

interface CrosswordPreviewProps {
  id: string;
  crossword: ArrayCrossword;
  metadata?: CrosswordMetadata;
}

const Boxes: React.FC<{ rows: number; boxes: ArrayCrossword["boxes"] }> = ({
  boxes,
  rows,
}) => {
  // if we let these stray boxes to be populated, we must always iterative over
  // rows by count and not the boxes values
  return [...Array(rows).keys()].map((row) => (
    <div key={`row-${row}`} className={bem("row")}>
      {[...Array(rows).keys()].map((column) => (
        <div
          key={`box-${row}-${column}`}
          className={bem("box", {
            blocked: boxes[row][column].blocked,
          })}
        >
          {boxes[row][column].content}
        </div>
      ))}
    </div>
  ));
};

export const CrosswordPreview: React.FC<CrosswordPreviewProps> = ({
  id,
  metadata,
  crossword,
}) => (
  <div className={bem()}>
    {crossword && (
      <div className={bem("grid", { [`size-${crossword.rows}`]: true })}>
        <Boxes {...crossword} />
      </div>
    )}
    <Link href={`/${id}`}>
      {metadata?.title || crossword.title || "Untitled"}
    </Link>
  </div>
);

export interface ConnectedCrosswordPreviewProps {
  id: string;
  metadata?: CrosswordMetadata;
}

export const ConnectedCrosswordPreview: React.FC<
  ConnectedCrosswordPreviewProps
> = ({ id, metadata }) => {
  const arrayCrossword = useAtomValue(
    arrayCrosswordAtomFamily({ crosswordId: id })
  );

  return (
    <CrosswordPreview id={id} metadata={metadata} crossword={arrayCrossword} />
  );
};

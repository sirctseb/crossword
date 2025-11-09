import React from "react";
import { useArrayCrossword } from "../firebase-hooks/hooks";
import Link from "next/link";

import { CrosswordMetadata } from "../../firebase/types";

import { block } from "../../styles";
import "./crossword-preview.scss";
import { type ArrayCrossword } from "../../state";

const bem = block("crossword-preview");

interface CrosswordPreviewProps {
  id: string;
  crossword: ArrayCrossword;
  metadata?: CrosswordMetadata;
}

const Boxes: React.FC<{ rows: number; boxes: ArrayCrossword["boxes"] }> = ({
  boxes,
}) => {
  return boxes.map((boxesRow, row) => (
    <div key={`row-${row}`} className={bem("row")}>
      {boxesRow.map((box, column) => (
        <div
          key={`box-${row}-${column}`}
          className={bem("box", {
            blocked: box.blocked,
          })}
        >
          {box.content}
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
  const { fallback: arrayCrossword } = useArrayCrossword(id);

  return (
    <CrosswordPreview id={id} metadata={metadata} crossword={arrayCrossword} />
  );
};

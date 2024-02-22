import React from "react";
import { block } from "../../styles";

import {
  Crossword,
  CrosswordMetadata,
  FirebaseArray,
} from "../../firebase/types";
import { coerceToArray, makeAtomFamily } from "../../firebase-recoil";

import "./crossword-preview.scss";
import { useRecoilValue } from "recoil";
import { getFirebaseDatabase } from "../../firebase";

const bem = block("crossword-preview");

interface CrosswordPreviewProps {
  crossword: Crossword;
  metadata: CrosswordMetadata;
}

// alternative approach would be to have an access utility like get
// to gracefully degrade to null / default value on value absence. lib could
// provide that also.
const coerceMatrixToArray = <T,>(
  matrix: FirebaseArray<string, FirebaseArray<string, T>>,
  defaultValue: T,
  rows: number,
  columns: number
): T[][] => {
  const outer = coerceToArray(matrix, {}, rows);
  return outer.map((inner) => coerceToArray(inner, defaultValue, columns));
};

const Boxes: React.FC<{ rows: number; boxes?: Crossword["boxes"] }> = ({
  rows,
  boxes: originalBoxes,
}) => {
  const boxes = coerceMatrixToArray(originalBoxes ?? [], {}, rows, rows);
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
  metadata,
  crossword,
}) => (
  <div className={bem()}>
    {crossword && (
      <div className={bem("grid", { [`size-${crossword.rows}`]: true })}>
        <Boxes {...crossword} />
      </div>
    )}
    {/* TODO how does this id get here? */}
    <a href={`/${metadata.id}`}>{metadata.title || "Untitled"}</a>
  </div>
);

export interface ConnectedCrosswordPreviewProps {
  id: string;
  metadata: CrosswordMetadata;
}

const crosswordAtomFamily = makeAtomFamily<Crossword, { crosswordId: string }>(
  "/crosswords/{crosswordId}",
  getFirebaseDatabase()
);

export const ConnectedCrosswordPreview: React.FC<
  ConnectedCrosswordPreviewProps
> = ({ id, metadata }) => {
  // TODO how does this work if the value isn't already loaded? there's no
  // typing here about promises, looks like we always get it on first render
  // but that can't be true
  const crossword = useRecoilValue(crosswordAtomFamily({ crosswordId: id }));

  return <CrosswordPreview metadata={metadata} crossword={crossword} />;
};

import React from "react";
import { block } from "../../styles";

import {
  Crossword,
  CrosswordMetadata,
  FirebaseArray,
} from "../../firebase/types";
import { coerceToArray } from "../../firebase-recoil";

import "./crossword-preview.scss";

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
      <div className={bem("grid", [`size-${crossword.rows}`])}>
        <Boxes {...crossword} />
      </div>
    )}
    {/* TODO how does this id get here? */}
    <a href={`/${metadata.id}`}>{metadata.title || "Untitled"}</a>
  </div>
);

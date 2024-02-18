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

const Debug: React.FC = (props) => {
  return <pre>{JSON.stringify(props, undefined, "\t")}</pre>;
};

const drawBoxes = ({ rows, boxes: originalBoxes }: Crossword) => {
  const boxes = coerceMatrixToArray(originalBoxes ?? [], {}, rows, rows);
  const rowElements = [];
  for (let row = 0; row < rows; row += 1) {
    const boxElements = [];
    for (let column = 0; column < rows; column += 1) {
      boxElements.push(
        <div
          key={`box-${row}-${column}`}
          className={bem("box", {
            blocked: boxes[row][column].blocked,
          })}
        >
          {boxes[row][column].content}
        </div>
      );
    }
    rowElements.push(
      <div key={`row-${row}`} className={bem("row")}>
        {boxElements}
      </div>
    );
  }
  return rowElements;
};

export const CrosswordPreview: React.FC<CrosswordPreviewProps> = ({
  metadata,
  crossword,
}) => (
  <div className={bem()}>
    {crossword && (
      <div className={bem("grid", [`size-${crossword.rows}`])}>
        {drawBoxes(crossword)}
      </div>
    )}
    {/* hmm how does this id get here? */}
    <a href={`/${metadata.id}`}>{metadata.title || "Untitled"}</a>
  </div>
);

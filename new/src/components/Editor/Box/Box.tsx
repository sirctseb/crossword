import React, { useCallback, useRef, useState } from "react";
import { Box as BoxModel } from "../../../firebase/types";

import { BoxControls } from "./BoxControls";
import { RebusInput } from "./RebusInput";
import type { FirebaseValue } from "../../../firebase-recoil";

import { block } from "../../../styles";
import "./box.scss";
const bem = block("box");

const targetFocused = ({
  currentTarget,
}: React.KeyboardEvent<HTMLDivElement>) =>
  document.activeElement === currentTarget;

export interface BoxProps {
  row: number;
  column: number;
  box: BoxModel;
  cursor: boolean;
  makeUndoableChange: (
    path: string,
    newValue: FirebaseValue,
    oldValue: FirebaseValue
  ) => void;
  clueLabel?: number;
  onBlock: (row: number, column: number, blocked: boolean) => void;
  onBoxFocus: (row: number, column: number) => void;
  onAfterSetContent: (content: string | null) => void;
  cursorAnswer: boolean;
}

export const Box: React.FC<BoxProps> = ({
  box: { blocked, circled, content, shaded },
  box,
  column,
  cursor,
  makeUndoableChange,
  onAfterSetContent,
  onBlock,
  onBoxFocus,
  row,
  clueLabel,
  cursorAnswer: active,
}) => {
  const [rebus, setRebus] = useState(false);
  const boxRef = useRef(null);

  const handleFocus = useCallback(
    () => onBoxFocus(row, column),
    [onBoxFocus, row, column]
  );

  const handleMouseDown = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (evt) => {
      if (cursor) {
        setRebus(true);
        evt.preventDefault();
      }
    },
    [cursor]
  );

  const setContent = useCallback(
    (newContent: string | null) => {
      makeUndoableChange(`boxes/${row}/${column}/content`, newContent, content);
      onAfterSetContent(newContent);
    },
    [makeUndoableChange, row, column, content, onAfterSetContent]
  );

  const handleRebusClose = useCallback(
    (currentContent = content ?? null) => {
      setContent(currentContent);
      setRebus(false);
    },
    [setRebus, setContent, content]
  );

  const handleOnBlock = useCallback(() => {
    onBlock(row, column, !blocked);
  }, [blocked, column, onBlock, row]);

  const handleToggleAttribute = useCallback(
    (attribute: "blocked" | "circled" | "shaded") => {
      makeUndoableChange(
        `boxes/${row}/${column}/${attribute}`,
        !box[attribute],
        box[attribute]
      );
    },
    [box, column, makeUndoableChange, row]
  );

  return (
    <div
      className={bem({
        blocked,
        circled,
        shaded,
        active,
        [`at-${row}-${column}`]: true,
      })}
      tabIndex={!blocked ? 0 : undefined}
      onKeyPress={(evt) => {
        if (/^[A-Za-z]$/.test(evt.key) && targetFocused(evt)) {
          setContent(evt.key);
        }
      }}
      onKeyDown={(evt) => {
        if (evt.key === "Backspace" && targetFocused(evt)) {
          setContent(null);
        }
      }}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
      ref={boxRef}
    >
      <BoxControls
        onToggleAttribute={handleToggleAttribute}
        box={box}
        onBlock={handleOnBlock}
      />
      {rebus && (
        <RebusInput
          content={content}
          onClose={handleRebusClose}
          containerRef={boxRef}
        />
      )}
      {clueLabel !== undefined && (
        <div className={bem("clue-index")}>{clueLabel}</div>
      )}
      {content}
    </div>
  );
};

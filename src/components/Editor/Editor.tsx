"use client";

import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ref, type DatabaseReference } from "firebase/database";

import { FirebaseSet, FirebaseUpdate, UndoHistory } from "../../undo";
import { getFirebaseDatabase } from "../../firebase";
import {
  arrayCrosswordSelector,
  labelMapSelector,
  cursorAtom,
  type ArrayCrossword,
  advancedCursorSelector,
  type LabeledAddressCatalog,
  clueInputAtom,
  type ClueInput,
  clueAddressesSelector,
} from "../../state";

import { Box as BoxModel } from "../../firebase/types";

import { Box } from "./Box";
import { ClueList } from "./ClueList";
import { ThemeEntries } from "./ThemeEntries";

import { useIsCursorAnswer } from "./hooks/useIsCursorAnswer";

import { allAnswersSelector } from "../../state/atoms/allAnswersSelector";
import { useEditorHotkeys } from "./useEditorHotKeys";

import "./editor.scss";
import { block } from "../../styles";

const bem = block("editor");

export interface EditorProps {
  crossword: ArrayCrossword;
  isCursorBox: (row: number, column: number) => boolean;
  isCursorAnswer: (row: number, column: number) => boolean;
  onBoxFocus: (row: number, column: number) => void;
  labelMap: Record<number, Record<number, number>>;
  labeledAddressCatalog: LabeledAddressCatalog;
  clueInput: ClueInput;
  allAnswers: string[];
  onAfterSetContent: (newContent: string | null) => void;
  onModifyBox: <K extends keyof BoxModel>(
    row: number,
    column: number,
    key: K,
    value: BoxModel[K] | null
  ) => void;
  onSizeChange: (size: number) => void;
  onSymmetricChange: (symmetric: boolean) => void;
  onSetClueInput: (clueInput: ClueInput) => void;
  onClueBlur: () => void;
  onAddThemeEntry: (entry: string) => void;
  onDeleteThemeEntry: (entry: string) => void;
}

const emptyBox = {};

const undoHistory = UndoHistory.getHistory("crossword");

export const Editor: React.FC<EditorProps> = ({
  crossword,
  isCursorBox,
  isCursorAnswer,
  onBoxFocus,
  labelMap,
  labeledAddressCatalog,
  clueInput,
  allAnswers,
  onAfterSetContent,
  onModifyBox,
  onSizeChange,
  onSymmetricChange,
  onSetClueInput,
  onClueBlur,
  onAddThemeEntry,
  onDeleteThemeEntry,
}) => {
  const rows = [];

  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = crossword.boxes[row][column] || emptyBox;
      const label = labelMap[row][column];

      boxes.push(
        <Box
          key={`box-${row}-${column}`}
          cursorAnswer={isCursorAnswer(row, column)}
          row={row}
          column={column}
          box={box}
          onModifyBox={onModifyBox}
          clueLabel={label}
          onBoxFocus={onBoxFocus}
          cursor={isCursorBox(row, column)}
          onAfterSetContent={onAfterSetContent}
        />
      );
    }
    rows.push(
      <div className="editor__row" key={`row-${row}`}>
        {boxes}
      </div>
    );
  }

  return (
    <div className={bem({ [`size-${crossword.rows}`]: true })}>
      <input
        type="number"
        className="editor__input"
        value={crossword.rows}
        onChange={(evt) => onSizeChange(evt.target.valueAsNumber)}
      />
      <input
        type="checkbox"
        className="editor__symmetric"
        checked={crossword.symmetric}
        onChange={(evt) => onSymmetricChange(evt.target.checked)}
      />
      <div className={bem("clues-and-grid")}>
        <div className={bem("clues-wrapper")}>
          <ClueList
            direction={"across"}
            clueLabels={labeledAddressCatalog.across}
            clueData={crossword.clues.across}
            clueInput={clueInput}
            onChangeClue={onSetClueInput}
            onClueBlur={onClueBlur}
          />
        </div>
        <div className={bem("grid")}>{rows}</div>
        <div className={bem("clues-wrapper")}>
          <ClueList
            direction={"down"}
            clueLabels={labeledAddressCatalog.down}
            clueData={crossword.clues.down}
            clueInput={clueInput}
            onChangeClue={onSetClueInput}
            onClueBlur={onClueBlur}
          />
        </div>
      </div>
      <ThemeEntries
        entries={crossword.themeEntries}
        currentAnswers={allAnswers}
        onAddThemeEntry={onAddThemeEntry}
        onDeleteThemeEntry={onDeleteThemeEntry}
      />
    </div>
  );
};

const database = getFirebaseDatabase();

const blockedChange = (
  row: number,
  column: number,
  { rows, symmetric }: ArrayCrossword,
  blocked: boolean,
  crosswordRef: DatabaseReference
) => {
  const update = {
    [`boxes/${row}/${column}/blocked`]: blocked,
  };

  const undoUpdate = {
    [`boxes/${row}/${column}/blocked`]: !blocked,
  };

  if (symmetric) {
    update[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] = blocked;
    undoUpdate[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] =
      !blocked;
  }

  return new FirebaseUpdate(crosswordRef, update, undoUpdate);
};

export interface ConnectedEditorProps {
  crosswordId: string;
}

export const ConnectedEditor: React.FC<ConnectedEditorProps> = ({
  crosswordId,
}) => {
  const [cursor, setCursor] = useRecoilState(cursorAtom);
  const [clueInput, setClueInput] = useRecoilState(clueInputAtom);
  const crossword = useRecoilValue(arrayCrosswordSelector({ crosswordId }));
  const labelMap = useRecoilValue(labelMapSelector({ crosswordId }));
  const labeledAddressCatalog = useRecoilValue(
    clueAddressesSelector({ crosswordId })
  );
  const cursorAfterAdvancement = useRecoilValue(
    advancedCursorSelector({ crosswordId })
  );
  const allAnswers = useRecoilValue(allAnswersSelector({ crosswordId }));

  const isCursorBox = useCallback(
    (row: number, column: number): boolean => {
      return cursor.row === row && cursor.column === column;
    },
    [cursor]
  );

  const isCursorAnswer = useIsCursorAnswer(crosswordId);

  const handleBoxFocus = useCallback(
    (row: number, column: number) => {
      setCursor(({ direction }) => ({
        direction,
        row,
        column,
      }));
    },
    [setCursor]
  );

  const handleAfterSetContent = useCallback(
    (newContent: string | null) => {
      if (newContent !== null) {
        const { row, column } = cursorAfterAdvancement;
        const className = `.box--at-${row}-${column}`;
        const toFocus = document.querySelector<HTMLDivElement>(className);
        if (!toFocus) {
          throw new Error(
            `Could not find box to focus (${row}, ${column}) (${className})`
          );
        }
        toFocus.focus();
      }
    },
    [cursorAfterAdvancement]
  );

  const handleModifyBox = useCallback(
    <K extends keyof BoxModel>(
      row: number,
      column: number,
      key: K,
      value: BoxModel[K] | null
    ) => {
      if (key === "blocked") {
        undoHistory.add(
          blockedChange(
            row,
            column,
            crossword,
            // TODO typescript should at least know that this is not a string
            // but it may not know it is not undefined. !! resolves both but
            // i would love to get rid of this hack
            !!value,
            ref(database, `crosswords/${crosswordId}`)
          )
        );
      } else {
        undoHistory.add(
          new FirebaseUpdate(
            ref(database, `crosswords/${crosswordId}/boxes/${row}/${column}`),
            { [key]: value },
            { [key]: crossword.boxes[row][column][key] ?? null }
          )
        );
      }
    },
    [crossword, crosswordId]
  );

  const handleChangeSize = useCallback(
    (size: number) => {
      undoHistory.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/rows`),
          size,
          crossword.rows
        )
      );
    },
    [crossword.rows, crosswordId]
  );

  const handleSymmetricChange = useCallback(
    (symmetric: boolean) => {
      undoHistory.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/symmetric`),
          symmetric,
          crossword.symmetric
        )
      );
    },
    [crossword.symmetric, crosswordId]
  );

  const handleClueBlur = useCallback(() => {
    undoHistory.add(
      new FirebaseSet(
        ref(
          database,
          `crosswords/${crosswordId}/clues/${clueInput.direction}/${clueInput.row}/${clueInput.column}`
        ),
        clueInput.value,
        // TODO we're getting bit in a few important places by the lax typing
        // on object and array access with sparse data.
        crossword.clues[clueInput.direction]?.[clueInput.row]?.[
          clueInput.column
        ] ?? null
      )
    );
    setClueInput({
      value: null,
      row: 0,
      column: 0,
      direction: "across",
    });
  }, [
    clueInput.column,
    clueInput.direction,
    clueInput.row,
    clueInput.value,
    crossword.clues,
    crosswordId,
    setClueInput,
  ]);

  const onAddThemeEntry = useCallback(
    (entry: string) => {
      undoHistory.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/themeEntries/${entry}`),
          true,
          null
        )
      );
    },
    [crosswordId]
  );

  const onDeleteThemeEntry = useCallback(
    (entry: string) => {
      undoHistory.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/themeEntries/${entry}`),
          null,
          true
        )
      );
    },
    [crosswordId]
  );

  useEditorHotkeys(crosswordId, undoHistory);

  return (
    <Editor
      crossword={crossword}
      isCursorBox={isCursorBox}
      onBoxFocus={handleBoxFocus}
      isCursorAnswer={isCursorAnswer}
      labelMap={labelMap}
      labeledAddressCatalog={labeledAddressCatalog}
      clueInput={clueInput}
      allAnswers={allAnswers}
      onAfterSetContent={handleAfterSetContent}
      onModifyBox={handleModifyBox}
      onSizeChange={handleChangeSize}
      onSymmetricChange={handleSymmetricChange}
      onSetClueInput={setClueInput}
      onClueBlur={handleClueBlur}
      onAddThemeEntry={onAddThemeEntry}
      onDeleteThemeEntry={onDeleteThemeEntry}
    />
  );
};

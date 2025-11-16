"use client";

import React, { useCallback, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { ref, type DatabaseReference } from "firebase/database";

import { FirebaseSet, FirebaseUpdate } from "../../undo";
import {
  type ArrayCrossword,
  type LabeledAddressCatalog,
  clueInputAtom,
  type ClueInput,
  cursorAtomFamily,
} from "../../state";

import { Box as BoxModel } from "../../firebase/types";

import { Box } from "./Box";
import { ClueList } from "./ClueList";
import { ThemeEntries } from "./ThemeEntries";

import { useIsCursorAnswer } from "./hooks/useIsCursorAnswer";

import { useEditorHotkeys } from "./useEditorHotKeys";
import { useFirebase } from "../../firebase";
import { useUndoHistory } from "../../undo/useUndoHistory";
import { usePublishCursor } from "./Cursor/usePublishCursor";

import "./editor.scss";
import { block } from "../../styles";
import { findNextBlank } from "../../state/derivations";
import {
  allAnswersAtomFamily,
  arrayCrosswordAtomFamily,
  labeledAddressCatalogAtomFamily,
  labeledAddressMapAtomFamily,
  remoteCursorAtomFamily,
} from "../../state/atoms/selectors";
import { type CursorMap } from "@/state/derivations";

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
  remoteCursors: CursorMap | null;
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

export const Editor: React.FC<EditorProps> = ({
  crossword,
  isCursorBox,
  isCursorAnswer,
  onBoxFocus,
  labelMap,
  labeledAddressCatalog,
  clueInput,
  allAnswers,
  remoteCursors,
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
      // TODO Marlo's bug: if the whole row is blocked out, labelMap has no entries for the row,
      // and we try to access `column` on undefined
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
          remoteCursors={remoteCursors?.[row]?.[column]}
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

// TODO what you were doing (a long time ago):
// the storybook is not going to render until we supply reasonable values
// more many of these. we produce them through the recoil layere here,
// but we don't want that for the storybook. we can go through the
// derivations layer, but some don't have functions defined.
// (for example, labelMap). let's add those and just call them in the
// storybook render function
export const ConnectedEditor: React.FC<ConnectedEditorProps> = ({
  crosswordId,
}) => {
  const { database } = useFirebase();

  const [cursor, setCursor] = useAtom(cursorAtomFamily(crosswordId));
  const [clueInput, setClueInput] = useAtom(clueInputAtom);
  const crossword = useAtomValue(arrayCrosswordAtomFamily({ crosswordId }));
  const labelMap = useAtomValue(labeledAddressMapAtomFamily({ crosswordId }));
  const labeledAddressCatalog = useAtomValue(
    labeledAddressCatalogAtomFamily({ crosswordId })
  );

  const cursorAfterAdvancement = useMemo(() => {
    return (
      findNextBlank(
        crossword,
        cursor.row,
        cursor.column,
        cursor.direction,
        // TODO something seems strange about this. why block every render
        // on the derivation of the new cursor placement, very few of which
        // will actually use it? why not just pay for it when we set content,
        // the only time we do use it?
        // should be pretty easy to see how fast it is JIT
        labeledAddressCatalog[cursor.direction]
      ) || { row: cursor.row, column: cursor.column }
    );
  }, [crossword, cursor]);
  const allAnswers = useAtomValue(allAnswersAtomFamily({ crosswordId }));

  const { history } = useUndoHistory(`crosswordId-${crosswordId}`);

  const isCursorBox = useCallback(
    (row: number, column: number): boolean => {
      return cursor.row === row && cursor.column === column;
    },
    [cursor]
  );

  const isCursorAnswer = useIsCursorAnswer(crossword, cursor);

  const handleBoxFocus = useCallback(
    (row: number, column: number) => {
      setCursor((cursorToUpdate) => ({
        ...cursorToUpdate,
        row,
        column,
      }));
    },
    [setCursor]
  );

  // TODO costs "render" of each Box on cursor move or content set
  // because cursorAfterAdvancement changes. with the class component, this
  // was a method and had access to the cursorAfterAdvancement on the props
  // and somehow avoided a render completely. even with the render of the boxes,
  // however, the total render time on the editor is about the same, ~8ms, and
  // well within the repreat rate of the keyboard (30ms). My memory of optimizing
  // the render in the legacy implementation was a noticable delay on type, so
  // it may not be worth trying to optimize this. if we do start seeing performance
  // problems, this might be a place to look.
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
        history.add(
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
        history.add(
          new FirebaseUpdate(
            ref(database, `crosswords/${crosswordId}/boxes/${row}/${column}`),
            { [key]: value },
            { [key]: crossword.boxes[row][column][key] ?? null }
          )
        );
      }
    },
    [crossword, crosswordId, database, history]
  );

  const handleChangeSize = useCallback(
    (size: number) => {
      history.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/rows`),
          size,
          crossword.rows
        )
      );
    },
    [crossword.rows, crosswordId, database, history]
  );

  const handleSymmetricChange = useCallback(
    (symmetric: boolean) => {
      history.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/symmetric`),
          symmetric,
          crossword.symmetric
        )
      );
    },
    [crossword.symmetric, crosswordId, database, history]
  );

  const handleClueBlur = useCallback(() => {
    history.add(
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
    // TODO this preps a clue input that will set 0 0 to null
    // if we focus then blur any input without changing it.
    // i think this bug pre-existed the state change.
    // i guess we should set this to just null or some other sentinel
    // value and ignore it on blur if so
    setClueInput({
      value: null,
      row: 0,
      column: 0,
      direction: "across",
    });
  }, [
    history,
    database,
    crosswordId,
    clueInput.direction,
    clueInput.row,
    clueInput.column,
    clueInput.value,
    crossword.clues,
    setClueInput,
  ]);

  const onAddThemeEntry = useCallback(
    (entry: string) => {
      history.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/themeEntries/${entry}`),
          true,
          null
        )
      );
    },
    [crosswordId, database, history]
  );

  const onDeleteThemeEntry = useCallback(
    (entry: string) => {
      history.add(
        new FirebaseSet(
          ref(database, `crosswords/${crosswordId}/themeEntries/${entry}`),
          null,
          true
        )
      );
    },
    [crosswordId, database, history]
  );

  useEditorHotkeys(crosswordId, history);

  const cursorId = usePublishCursor(crosswordId);
  const remoteCursors = useAtomValue(
    remoteCursorAtomFamily({ crosswordId, cursorId })
  );

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
      remoteCursors={remoteCursors}
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

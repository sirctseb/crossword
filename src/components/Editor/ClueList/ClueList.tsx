import React from "react";

import "./clue-list.scss";
import { block } from "../../../styles";
import type { ClueInput, LabeledAddress } from "../../../state";
const bem = block("clue-list");

const displayNames = {
  across: "Across",
  down: "Down",
};

interface ChangeClueEvent {
  value: string;
  row: number;
  column: number;
  direction: "across" | "down";
}

interface ClueListProps {
  direction: "across" | "down";
  clueLabels: LabeledAddress[];
  clueData: Record<string, Record<string, string>>;
  clueInput: ClueInput;
  onChangeClue: (evt: ChangeClueEvent) => void;
  onClueBlur: React.FocusEventHandler;
}

export const ClueList: React.FC<ClueListProps> = ({
  clueData,
  clueInput,
  clueLabels,
  direction,
  onChangeClue,
  onClueBlur,
}) => {
  return (
    <div className="clue-list">
      {displayNames[direction]}
      {clueLabels.map(({ row, column, label }) => (
        <div key={label} className={bem("clue")}>
          {label}.
          <input
            type="text"
            className={bem("clue-input")}
            value={
              (row === clueInput.row &&
                column === clueInput.column &&
                clueInput.direction === direction &&
                clueInput.value) ||
              clueData?.[row]?.[column] ||
              ""
            }
            onChange={(evt) => {
              onChangeClue({
                value: evt.target.value,
                row,
                column,
                direction,
              });
            }}
            onBlur={onClueBlur}
          />
        </div>
      ))}
    </div>
  );
};

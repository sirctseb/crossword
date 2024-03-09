import React, { useCallback, useState } from "react";

import { block } from "../../../styles";

import "./theme-entry-addition.scss";
const bem = block("theme-entry-addition");

export interface ThemeEntryAdditionProps {
  onAdd: (text: string) => void;
}

export const ThemeEntryAddition: React.FC<ThemeEntryAdditionProps> = ({
  onAdd,
}) => {
  const [input, setInput] = useState("");

  const handleInput = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setInput(evt.target.value);
    },
    []
  );

  const handleAddClick = useCallback(() => {
    onAdd(input);
    setInput("");
  }, [input, onAdd]);

  return (
    <div className={bem()}>
      <input className={bem("input")} value={input} onChange={handleInput} />
      <div className={bem("add")} onClick={handleAddClick}>
        +
      </div>
    </div>
  );
};

import React from "react";

import { block } from "../../../styles";

import "./theme-entry-list.scss";
const bem = block("theme-entry-list");

export interface ThemeEntryListProps {
  entries: {
    text: string;
    used: boolean;
  }[];
  onDelete: (text: string) => void;
}

export const ThemeEntryList: React.FC<ThemeEntryListProps> = ({
  entries,
  onDelete,
}) => {
  return (
    <div className={bem()}>
      {entries.map(({ text, used }) => (
        <div className={bem("entry")} key={text}>
          <div className={bem("text", { used })}>{text}</div>
          <div className={bem("delete")} onClick={() => onDelete(text)}>
            x
          </div>
        </div>
      ))}
    </div>
  );
};

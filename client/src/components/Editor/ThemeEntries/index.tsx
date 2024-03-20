import React from "react";

import { block } from "../../../styles";

import { ThemeEntryList } from "./ThemeEntryList";
import { ThemeEntryAddition } from "./ThemeEntryAddition";

const bem = block("theme-entries");

export interface ThemeEntriesProps {
  entries?: string[];
  currentAnswers: string[];
  onAddThemeEntry: (text: string) => void;
  onDeleteThemeEntry: (text: string) => void;
}

export const ThemeEntries: React.FC<ThemeEntriesProps> = ({
  entries = [],
  currentAnswers,
  onAddThemeEntry,
  onDeleteThemeEntry,
}) => {
  const annotatedEntries = entries.map((entry) => ({
    text: entry,
    used: currentAnswers.includes(entry),
  }));

  return (
    <div className={bem()}>
      <ThemeEntryList
        entries={annotatedEntries}
        onDelete={onDeleteThemeEntry}
      />
      <ThemeEntryAddition onAdd={onAddThemeEntry} />
    </div>
  );
};

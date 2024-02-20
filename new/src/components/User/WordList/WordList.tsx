import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { push, ref, remove } from "firebase/database";

import { block } from "../../../styles";
import type { User } from "../../../firebase/types";
import { coerceToObject, makeAtomFamily } from "../../../firebase-recoil";
import { getFirebaseDatabase } from "../../../firebase";

import "./word-list.scss";

const bem = block("word-list");

interface WordListProps {
  onAddNewValue: (value: string) => void;
  onDelete: (key: string) => void;
  wordlist: User["wordlist"];
}

export const WordList: React.FC<WordListProps> = ({
  onAddNewValue,
  onDelete,
  wordlist,
}) => {
  const [newValue, setNewValue] = useState("");

  const wordlistObject = useMemo(() => {
    return coerceToObject(wordlist || []);
  }, [wordlist]);

  const handleNewValueChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    ({ target: { value } }) => {
      setNewValue(value);
    },
    [setNewValue]
  );

  const handleAddNewValue = useCallback(() => {
    onAddNewValue(newValue);
    setNewValue("");
  }, [onAddNewValue, newValue]);

  return (
    <div className={bem()}>
      <div className={bem("title")}>Word List</div>
      <div className={bem("list")}>
        {Object.entries(wordlistObject).map(([key, { word }]) => (
          <div className={bem("entry")} key={key}>
            {word}
            <div className={bem("delete")} onClick={() => onDelete(key)}>
              -
            </div>
          </div>
        ))}
      </div>
      <div className={bem("add")}>
        <input value={newValue} onChange={handleNewValueChange} />
        <div onClick={handleAddNewValue}>+</div>
      </div>
    </div>
  );
};

const database = getFirebaseDatabase();

const wordListAtomFamily = makeAtomFamily<User["wordlist"], { userId: string }>(
  "/users/{userId}/wordlist",
  database
);

export interface ConnectedWordListProps {
  userId: string;
}

export const ConnectedWordList: React.FC<ConnectedWordListProps> = ({
  userId,
}) => {
  const wordlist = useRecoilValue(wordListAtomFamily({ userId }));

  const handleAddNewValue = useCallback(
    (word: string) => {
      push(ref(database, `/users/${userId}/wordlist`), { word });
    },
    [userId]
  );

  const handleDelete = useCallback(
    (key: string) => {
      remove(ref(database, `/users/${userId}/wordlist/${key}`));
    },
    [userId]
  );

  return (
    <WordList
      wordlist={wordlist}
      onAddNewValue={handleAddNewValue}
      onDelete={handleDelete}
    />
  );
};

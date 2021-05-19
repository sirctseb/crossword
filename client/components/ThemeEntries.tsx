import React, { useState } from 'react';
import firebase from 'firebase';
import cn from 'classnames';

interface ThemeEntriesProps {
  fbRef: firebase.database.Reference;
  themeEntries: string[];
  currentAnswers: string[];
}

import styles from './ThemeEntries.module.scss';
import useHistory from '../undo/useHistory';

const ThemeEntries: React.FC<ThemeEntriesProps> = ({ fbRef, themeEntries, currentAnswers }) => {
  const { addValues } = useHistory('crossword');
  const onAdd = (text: string) => addValues(fbRef.child(text), true, null);

  const onDelete = (text: string) => addValues(fbRef.child(text), null, true);

  const annotatedEntries = themeEntries.map((entry) => ({
    text: entry,
    used: currentAnswers.includes(entry),
  }));

  const [input, setInput] = useState('');

  return (
    <div className={styles.themeEntries}>
      <div className={styles.themeEntryList}>
        {annotatedEntries.map(({ text, used }) => (
          <div className={styles.entry} key={text}>
            <div className={cn(styles.text, { [styles.used]: used })}>{text}</div>
            <div onClick={() => onDelete(text)}>x</div>
          </div>
        ))}
      </div>
      <div className={styles.themeEntryAddition}>
        <input value={input} onChange={(evt) => setInput(evt.target.value)} />
        <div
          onClick={() => {
            onAdd(input);
            setInput('');
          }}
        >
          +
        </div>
      </div>
    </div>
  );
};

export default ThemeEntries;

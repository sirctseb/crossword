import React, { useState } from 'react';
import cn from 'classnames';

// import UndoHistory from '../../undo/UndoHistory';
// import FirebaseChange from '../../undo/FirebaseChange';

// const undoHistory = UndoHistory.getHistory('crossword');

interface ThemeEntriesProps {
  // fbRef: PropTypes.object.isRequired,
  themeEntries: string[];
  currentAnswers: string[];
}

import styles from './ThemeEntries.module.scss';

const ThemeEntries: React.FC<ThemeEntriesProps> = ({ /*fbRef, */ themeEntries, currentAnswers }) => {
  const onAdd = (text: string) => null; //undoHistory.add(FirebaseChange.FromValues(fbRef.child(text), true, null));

  const onDelete = (text: string) => null; //undoHistory.add(FirebaseChange.FromValues(fbRef.child(text), null, true));

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

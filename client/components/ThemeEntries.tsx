import React from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import UndoHistory from '../../undo/UndoHistory';
import FirebaseChange from '../../undo/FirebaseChange';

import ThemeEntryList from './ThemeEntryList';
import ThemeEntryAddition from './ThemeEntryAddition';

const undoHistory = UndoHistory.getHistory('crossword');
const bem = bemNamesFactory('theme-entries');

const ThemeEntries = ({ fbRef, themeEntries, currentAnswers }) => {
  const onAdd = (text) => undoHistory.add(FirebaseChange.FromValues(fbRef.child(text), true, null));

  const onDelete = (text) => undoHistory.add(FirebaseChange.FromValues(fbRef.child(text), null, true));

  const annotatedEntries = themeEntries.map((entry) => ({
    text: entry,
    used: currentAnswers.includes(entry),
  }));

  const [input, setInput] = useState('');

  return (
    <div className={bem()}>
      <div className={bem()}>
        {annotatedEntries.map(({ text, used }) => (
          <div className={bem('entry')} key={text}>
            <div className={bem('text', { used })}>{text}</div>
            <div className={bem('delete')} onClick={() => onDelete(text)}>
              x
            </div>
          </div>
        ))}
      </div>
      <div className={bem()}>
        <input className={bem('input')} value={input} onChange={(evt) => setInput(evt.target.value)} />
        <div
          className={bem('add')}
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

ThemeEntries.propTypes = {
  fbRef: PropTypes.object.isRequired,
  themeEntries: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentAnswers: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ThemeEntries;

import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import UndoHistory from '../../undo/UndoHistory';
import FirebaseChange from '../../undo/FirebaseChange';

import { getThemeEntries, getCurrentAnswers } from '../selectors';
import ThemeEntryList from './ThemeEntryList';
import ThemeEntryAddition from './ThemeEntryAddition';

const undoHistory = UndoHistory.getHistory('crossword');
const bem = bemNamesFactory('theme-entries');

const ThemeEntries = ({ fbRef, id }) => {
  const entries = useSelector(state => getThemeEntries(state, { id }));
  const currentAnswers = useSelector(state => getCurrentAnswers(state, { id }));

  const onAdd = text =>
    undoHistory.add(FirebaseChange.FromValues(fbRef.child(text), true, null));

  const onDelete = text =>
    undoHistory.add(FirebaseChange.FromValues(fbRef.child(text), null, true));

  const annotatedEntries = entries.map(entry => ({
    text: entry,
    used: currentAnswers.includes(entry),
  }));

  return (
    <div className={bem()}>
      <ThemeEntryList entries={annotatedEntries} onDelete={onDelete} />
      <ThemeEntryAddition onAdd={onAdd} />
    </div>
  );
};

ThemeEntries.propTypes = {
  fbRef: PropTypes.object.isRequired,
};

export default ThemeEntries;

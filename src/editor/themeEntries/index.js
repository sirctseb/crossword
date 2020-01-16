import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import UndoHistory from '../../undo/UndoHistory';
import FirebaseChange from '../../undo/FirebaseChange';

import ThemeEntryList from './ThemeEntryList';
import ThemeEntryAddition from './ThemeEntryAddition';

const undoHistory = UndoHistory.getHistory('crossword');
const bem = bemNamesFactory('theme-entries');

class ThemeEntries extends Component {
  render() {
    const { entries, currentAnswers, fbRef } = this.props;

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
  }
}

ThemeEntries.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentAnswers: PropTypes.arrayOf(PropTypes.string).isRequired,
  fbRef: PropTypes.object.isRequired,
};

export default ThemeEntries;

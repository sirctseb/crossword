import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bemFactory } from 'bem-names';

import ThemeEntryList from './ThemeEntryList';
import ThemeEntryAddition from './ThemeEntryAddition';

class ThemeEntries extends Component {
  render() {
    const bem = bemFactory('theme-entries');
    const {
      entries,
      actions: {
        addThemeEntry: onAdd, deleteThemeEntry: onDelete,
      },
    } = this.props;
    return (
      <div className={bem()}>
        <ThemeEntryList entries={entries} onDelete={onDelete} />
        <ThemeEntryAddition onAdd={onAdd} />
      </div>
    );
  }
}

ThemeEntries.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentAnswers: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ThemeEntries;

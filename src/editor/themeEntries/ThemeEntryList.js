import React from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

const bem = bemNamesFactory('theme-entry-list');

const ThemeEntryList = ({ entries, onDelete }) => (
  <div className={bem()}>
    {
      entries.map(({ text, used }) =>
        <div className={bem('entry')}
          key={text}>
          <div className={bem('text', { used })}>{ text }</div>
          <div className={bem('delete')}
            onClick={() => onDelete(text)}>x</div>
        </div>)
    }
  </div>
);

ThemeEntryList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    used: PropTypes.bool.isRequired,
  })),
  onDelete: PropTypes.func.isRequired,
};

export default ThemeEntryList;

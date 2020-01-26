import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

const bem = bemNamesFactory('theme-entry-addition');

const ThemeEntryAddition = ({ onAdd }) => {
  const [input, setInput] = useState('');

  return (
    <div className={bem()}>
      <input className={bem('input')}
        value={input}
        onChange={evt => setInput(evt.target.value)} />
      <div className={bem('add')}
        onClick={() => {
          onAdd(input);
          setInput('');
        }}>
          +
      </div>
    </div>
  );
};

ThemeEntryAddition.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default ThemeEntryAddition;

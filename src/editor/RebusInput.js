import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const RebusInput = ({ onClose, content }) => {
  const [value, setValue] = useState(content);

  const inputElement = useRef(null);
  useEffect(() => inputElement.current.focus(), [inputElement]);

  return (
    <div className='rebus-input'>
      <input className='rebus-input__input'
        ref={inputElement}
        value={value || ''}
        onKeyDown={(evt) => {
          if (evt.key === 'Escape') {
            onClose();
          }
          if (evt.key === 'Enter') {
            onClose(value);
          }
        }}
        onChange={evt => setValue(evt.target.value)}/>
    </div>
  );
};

RebusInput.propTypes = {
  onClose: PropTypes.func.isRequired,
  content: PropTypes.string,
};

export default RebusInput;

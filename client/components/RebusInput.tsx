import React, { useState, useEffect, useRef } from 'react';
import useClickOutside from '../hooks/useClickOutside';

interface RebusInputProps {
  onClose: (content?: string) => any;
  content?: string;
}

const RebusInput: React.FC<RebusInputProps> = ({ onClose, content }) => {
  const [value, setValue] = useState(content);
  const nodeRef = useRef<HTMLDivElement>(null);
  useClickOutside(nodeRef.current, onClose);

  const inputElement = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputElement.current?.focus();
  }, [inputElement]);

  return (
    <div className="rebus-input" ref={nodeRef}>
      <input
        className="rebus-input__input"
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
        onChange={(evt) => setValue(evt.target.value)}
      />
    </div>
  );
};

export default RebusInput;

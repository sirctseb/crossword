import React, { useCallback, useEffect, useRef, useState } from "react";

import "./rebus-input.scss";

export interface RebusInputProps {
  onClose: (content?: string) => void;
  content?: string;
  containerRef: React.RefObject<HTMLElement>;
}

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  onClickOutside: () => void
) => {
  useEffect(() => {
    const handler: EventListener = (evt) => {
      if (evt.target instanceof Node && !ref.current?.contains(evt.target)) {
        onClickOutside();
      }
    };

    [`click`, `touchstart`].forEach((type) => {
      document.addEventListener(type, handler);
    });

    return () => {
      [`click`, `touchstart`].forEach((type) => {
        document.removeEventListener(type, handler);
      });
    };
  }, [onClickOutside, ref]);
};

export const RebusInput: React.FC<RebusInputProps> = ({
  content,
  onClose,
  containerRef,
}) => {
  const [value, setValue] = useState(content);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = useCallback(() => {
    onClose(value);
  }, [value, onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useClickOutside(containerRef, handleClickOutside);

  return (
    <div className="rebus-input">
      <input
        className="rebus-input__input"
        ref={inputRef}
        value={value || ""}
        onKeyDown={(evt) => {
          if (evt.key === "Escape") {
            onClose();
          }
          if (evt.key === "Enter") {
            onClose(value);
          }
        }}
        onChange={(evt) => setValue(evt.target.value)}
      />
    </div>
  );
};

export default RebusInput;
// I love Mamma and Papa

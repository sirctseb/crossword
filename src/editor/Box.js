import React, { useState, memo } from 'react';
import { bemNamesFactory } from 'bem-names';
import propTypes from 'prop-types';

import BoxControls from './BoxControls';
import RebusInput from './RebusInput';

const targetFocused = ({ currentTarget }) => document.activeElement === currentTarget;
const bem = bemNamesFactory('box');

const Box = memo(({
  row,
  column,
  box,
  box: {
    blocked,
    circled,
    shaded,
    content,
  },
  cursor,
  cursorAnswer: active,
  makeUndoableChange,
  clueLabel,
  onBlock,
  onBoxFocus,
  onAfterSetContent,
}) => {
  const [rebus, setRebus] = useState(false);

  const handleFocus = () => {
    onBoxFocus({ row, column });
  };

  const handleMouseDown = (evt) => {
    if (cursor) {
      setRebus(true);
      // when rebus goes to true
      // and we focus the input element in RebusInput.componentDidMount
      // we have to preventDefault here so that we don't immediately
      // yank it back to the box
      evt.preventDefault();
    }
  };

  const setContent = (newContent) => {
    makeUndoableChange(
      `boxes/${row}/${column}/content`,
      newContent,
      content,
    );
    onAfterSetContent(newContent);
  };

  const handleRebusClose = (newContent = content) => {
    setContent(newContent);
    setRebus(false);
  };

  const handleOnBlock = () => {
    onBlock(row, column, !blocked);
  };

  const handleToggleAttribute = (attribute) => {
    makeUndoableChange(
      `boxes/${row}/${column}/${attribute}`,
      !box[attribute],
      box[attribute],
    );
  };

  return (
    <div
      className={
        bem(
          {
            blocked, circled, shaded, active,
          },
          [`at-${row}-${column}`],
        )}
      tabIndex={!blocked ? '0' : undefined}
      onKeyPress={(evt) => {
        if (/^[A-Za-z]$/.test(evt.key) && targetFocused(evt)) {
          setContent(evt.key);
        }
      }}
      onKeyDown={(evt) => {
        if (evt.key === 'Backspace' && targetFocused(evt)) {
          setContent(null);
        }
      }}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}>
      <BoxControls onToggleAttribute={handleToggleAttribute}
        box={box}
        onBlock={handleOnBlock} />
      {
        rebus && <RebusInput content={content} onClose={handleRebusClose} />
      }
      {
        clueLabel && <div className={bem('clue-index')}>{ clueLabel }</div>
      }
      { content }
    </div>
  );
});

Box.propTypes = {
  row: propTypes.number.isRequired,
  column: propTypes.number.isRequired,
  box: propTypes.shape({
    blocked: propTypes.bool,
    circled: propTypes.bool,
    shaded: propTypes.bool,
    content: propTypes.string,
  }).isRequired,
  cursor: propTypes.bool.isRequired,
  cursorAnswer: propTypes.bool.isRequired,
  makeUndoableChange: propTypes.func.isRequired,
  clueLabel: propTypes.number,
  onBlock: propTypes.func.isRequired,
  onBoxFocus: propTypes.func.isRequired,
  onAfterSetContent: propTypes.func.isRequired,
};

export default Box;

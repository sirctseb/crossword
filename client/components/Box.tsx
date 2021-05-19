import React, { useState, memo } from 'react';
import cn from 'classnames';

import RemoteCursors from './RemoteCursors';
import BoxControls from './BoxControls';
import RebusInput from './RebusInput';

const targetFocused = ({ currentTarget }: React.KeyboardEvent) => document.activeElement === currentTarget;

interface Box {
  blocked?: boolean;
  circled?: boolean;
  shaded?: boolean;
  content?: string;
}

interface BoxProps {
  row: number;
  column: number;
  box: Box;
  cursor: boolean;
  cursorAnswer: boolean;
  clueLabel: number;
  onBlock: (row: number, column: number, blocked: boolean) => any;
  onBoxFocus: ({ row, column }: { row: number; column: number }) => any;
  onAfterSetContent: ((content: string | null) => any) | null;
  remoteCursors: React.ComponentProps<typeof RemoteCursors>['cursors'];
}

import styles from './Box.module.scss';
import useHistory from '../undo/useHistory';

const Box: React.FC<BoxProps> = ({
  row,
  column,
  box,
  box: { blocked, circled, shaded, content },
  cursor,
  cursorAnswer: active,
  clueLabel,
  onBlock,
  onBoxFocus,
  onAfterSetContent,
  remoteCursors,
}) => {
  const [rebus, setRebus] = useState(false);
  const { addValues } = useHistory('crossword');

  const handleFocus = () => {
    onBoxFocus({ row, column });
  };

  const handleMouseDown: React.MouseEventHandler = (evt) => {
    if (cursor) {
      setRebus(true);
      // when rebus goes to true
      // and we focus the input element in RebusInput.componentDidMount
      // we have to preventDefault here so that we don't immediately
      // yank it back to the box
      evt.preventDefault();
    }
  };

  const setContent = (newContent: string | null) => {
    addValues(`boxes/${row}/${column}/content`, newContent, content);
    if (onAfterSetContent) {
      onAfterSetContent(newContent);
    }
  };

  const handleRebusClose = (newContent = content) => {
    setContent(newContent || null);
    setRebus(false);
  };

  const handleOnBlock = () => {
    onBlock(row, column, !blocked);
  };

  const handleToggleAttribute = (attribute: keyof Box) => {
    addValues(`boxes/${row}/${column}/${attribute}`, !box[attribute], box[attribute]);
  };

  return (
    <div
      className={cn(
        styles.box,
        {
          [styles.blocked]: blocked,
          [styles.circled]: circled,
          [styles.shaded]: shaded,
          [styles.active]: active,
        },
        [`at-${row}-${column}`]
      )}
      tabIndex={!blocked ? 0 : undefined}
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
      onMouseDown={handleMouseDown}
    >
      <RemoteCursors cursors={remoteCursors} />
      <BoxControls onToggleAttribute={handleToggleAttribute} box={box} onBlock={handleOnBlock} />
      {rebus && <RebusInput content={content} onClose={handleRebusClose} />}
      {clueLabel && <div className={styles.clueIndex}>{clueLabel}</div>}
      {content}
    </div>
  );
};

export default memo(Box);

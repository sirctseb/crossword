import React from 'react';
import cn from 'classnames';

interface Box {
  blocked?: boolean;
  circled?: boolean;
  shaded?: boolean;
}

interface BoxControlsProps {
  box: Box;
  onBlock: () => any;
  onToggleAttribute: (attribute: keyof Box) => any;
}

import styles from './BoxControls.module.scss';

const BoxControls: React.FC<BoxControlsProps> = ({ box: { blocked, circled, shaded }, onBlock, onToggleAttribute }) => {
  const killEvent: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  const handleToggleCircle: React.MouseEventHandler = (evt) => {
    onToggleAttribute('circled');
    evt.stopPropagation();
  };

  const handleToggleShade: React.MouseEventHandler = (evt) => {
    onToggleAttribute('shaded');
    evt.stopPropagation();
  };

  return (
    <div className={styles.boxControls}>
      <div className={cn(styles.block, { [styles.blocked]: blocked })} onMouseDown={killEvent} onClick={onBlock} />
      {!blocked && (
        <div
          className={cn(styles.circle, { [styles.circled]: circled })}
          onMouseDown={killEvent}
          onClick={handleToggleCircle}
        />
      )}
      {!blocked && (
        <div
          className={cn(styles.shade, { [styles.shaded]: shaded })}
          onMouseDown={killEvent}
          onClick={handleToggleShade}
        />
      )}
    </div>
  );
};

export default BoxControls;

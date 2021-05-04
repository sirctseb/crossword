import React from 'react';
import { bemNamesFactory } from 'bem-names';

const bem = bemNamesFactory('box-controls');

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
    <div className="box-controls">
      <div className={bem('block', { blocked })} onMouseDown={killEvent} onClick={onBlock} />
      {!blocked && <div className={bem('circle', { circled })} onMouseDown={killEvent} onClick={handleToggleCircle} />}
      {!blocked && <div className={bem('shade', { shaded })} onMouseDown={killEvent} onClick={handleToggleShade} />}
    </div>
  );
};

export default BoxControls;

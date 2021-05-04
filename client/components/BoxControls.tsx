import React from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

const bem = bemNamesFactory('box-controls');

const BoxControls = ({ box: { blocked, circled, shaded }, onBlock, onToggleAttribute }) => {
  const killEvent = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  const handleToggleCircle = (evt) => {
    onToggleAttribute('circled');
    evt.stopPropagation();
  };

  const handleToggleShade = (evt) => {
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

BoxControls.propTypes = {
  box: propTypes.object.isRequired,
  onBlock: propTypes.func.isRequired,
  onToggleAttribute: propTypes.func.isRequired,
};

export default BoxControls;

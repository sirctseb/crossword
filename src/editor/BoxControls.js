import React, { Component } from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

class BoxControls extends Component {
  render() {
    const bem = bemNamesFactory('box-controls');
    const { boxPath, set, box: { blocked, circled, shaded } } = this.props;

    return (
      <div className='box-controls'>
        <div className={bem('block', { blocked })}
          onClick={(evt) => {
            set(`${boxPath}`, { blocked: !blocked });
            evt.stopPropagation();
          }}/>
        <div className={bem('circle', { circled })}
          onClick={(evt) => {
            set(`${boxPath}/circled`, !circled);
            evt.stopPropagation();
          }}/>
        <div className={bem('shade', { shaded })}
          onClick={(evt) => {
            set(`${boxPath}/shaded`, !shaded);
            evt.stopPropagation();
          }}/>
      </div>
    );
  }
}

BoxControls.propTypes = {
  boxPath: propTypes.string.isRequired,
  set: propTypes.func.isRequired,
  box: propTypes.object.isRequired,
};

export default BoxControls;

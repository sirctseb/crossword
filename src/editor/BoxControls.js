import React, { Component } from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

class BoxControls extends Component {
  render() {
    const bem = bemNamesFactory('box-controls');

    return (
      <div className='box-controls'>
        <div className={bem('block')}
          onClick={this.props.onToggleBlock}/>
        <div className={bem('circle')}
          onClick={this.props.onToggleCircle}/>
        <div className={bem('shade')}
          onClick={this.props.onToggleShade}/>
      </div>
    );
  }
}

BoxControls.propTypes = {
  onToggleBlock: propTypes.func.isRequired,
  onToggleCircle: propTypes.func.isRequired,
};

export default BoxControls;

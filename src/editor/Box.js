import React, { Component } from 'react';
import { bemNamesFactory } from 'bem-names';
import propTypes from 'prop-types';

import FirebaseChange from '../undo/FirebaseChange';
import BoxControls from './BoxControls';

const indexDiffs = {
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
};

export default class Box extends Component {
  constructor(props) {
    super(props);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  onKeyDown(evt) {
    const { row, column } = this.props;

    if (evt.key in indexDiffs) {
      this.props.assignFocus(row + indexDiffs[evt.key][0], column + indexDiffs[evt.key][1]);
    }
  }

  onFocus() {
    this.props.onBoxFocus(this.props.row, this.props.column);
  }

  render() {
    const bem = bemNamesFactory('box');
    const {
      box: {
        blocked, circled, shaded, content,
      }, undoHistory, clueLabel, cursorAnswer: active,
      row, column,
    } = this.props;

    return (
      <div className={
        bem(
          {
            blocked, circled, shaded, active,
          },
          [`index-${row}-${column}`],
        )}
      tabIndex={!blocked ? '0' : undefined}
      ref={this.props.onRef}
      onKeyPress={(evt) => {
        if (/[A-z]/.test(evt.key)) {
          undoHistory.add(FirebaseChange.FromValues(
            this.props.boxRef.child('content'),
            evt.key,
            content,
          ));
        }
      }}
      onFocus={this.onFocus}
      onKeyDown={this.onKeyDown}>
        <BoxControls boxRef={this.props.boxRef}
          box={this.props.box}
          onBlock={this.props.onBlock} />
        {
          clueLabel &&
                    <div className={bem('clue-index')}>
                      {clueLabel}
                    </div>
        }
        { content }
      </div>
    );
  }
}

Box.propTypes = {
  row: propTypes.number.isRequired,
  column: propTypes.number.isRequired,
  box: propTypes.shape({
    blocked: propTypes.boolean,
    circled: propTypes.boolean,
    shaded: propTypes.boolean,
  }).isRequired,
  boxRef: propTypes.object.isRequired,
  undoHistory: propTypes.object.isRequired,
  assignFocus: propTypes.func.isRequired,
  clueLabel: propTypes.number,
  onBlock: propTypes.func.isRequired,
  onBoxFocus: propTypes.func.isRequired,
};

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UndoHistory from '../undo/UndoHistory';
import CrosswordModel from '../model/Crossword';

const undoHistory = UndoHistory.getHistory('crossword');

export default (MyComponent) => {
  class HotKeyedEditor extends Component {
    handleRight() {
      this.moveCursor([0, 1]);
    }
    handleLeft() {
      this.moveCursor([0, -1]);
    }
    handleUp() {
      this.moveCursor([-1, 0]);
    }
    handleDown() {
      this.moveCursor([1, 0]);
    }

    moveCursor(vector) {
      let {
        editor: { cursor: { row, column } },
      } = this.props;

      const { crossword } = this.props;
      const { rows: size } = crossword;

      row += vector[0];
      column += vector[1];
      while (row >= 0 && column >= 0 && row < size && column < size) {
        if (!CrosswordModel.isBlockedBox(crossword, row, column)) {
          document.querySelector(`.box--at-${row}-${column}`).focus();
          return;
        }

        row += vector[0];
        column += vector[1];
      }
    }

    constructor(props) {
      super(props);

      this.handleRight = this.handleRight.bind(this);
      this.handleLeft = this.handleLeft.bind(this);
      this.handleUp = this.handleUp.bind(this);
      this.handleDown = this.handleDown.bind(this);

      this.hot_keys = {
        'meta+z': {
          handler: (evt) => {
            if (document.activeElement.tagName !== 'INPUT') {
              undoHistory.undo();
            }
            evt.preventDefault();
          },
        },
        'shift+meta+z': {
          handler: (evt) => {
            if (document.activeElement.tagName !== 'INPUT') {
              undoHistory.redo();
            }
            evt.preventDefault();
          },
        },
        up: {
          handler: this.handleUp,
        },
        down: {
          handler: this.handleDown,
        },
        left: {
          handler: this.handleLeft,
        },
        right: {
          handler: this.handleRight,
        },
      };
    }

    render() {
      return <MyComponent {...this.props} />;
    }
  }

  HotKeyedEditor.propTypes = {
    editor: PropTypes.shape({
      cursor: PropTypes.shape({
        row: PropTypes.number.isRequired,
        column: PropTypes.number.isRequired,
      }),
    }),
    crossword: PropTypes.shape({
      rows: PropTypes.number.isRequired,
    }),
  };

  return HotKeyedEditor;
};

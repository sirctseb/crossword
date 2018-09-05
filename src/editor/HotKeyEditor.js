import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UndoHistory from '../undo/UndoHistory';

const undoHistory = UndoHistory.getHistory('crossword');

export default (MyComponent) => {
  const moveCursor = (props, vector) => {
    const {
      editor: { cursor: { row, column } },
      crossword: { rows: size },
    } = props;

    const newRow = row + vector[0];
    const newColumn = column + vector[1];

    if (newRow >= 0 && newColumn >= 0 && newRow < size && newColumn < size) {
      document.querySelector(`.box--at-${newRow}-${newColumn}`).focus();
    }
  };

  class HotKeyedEditor extends Component {
    constructor(props) {
      super(props);

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
          handler: () => moveCursor(this.props, [-1, 0]),
        },
        down: {
          handler: () => moveCursor(this.props, [1, 0]),
        },
        left: {
          handler: () => moveCursor(this.props, [0, -1]),
        },
        right: {
          handler: () => moveCursor(this.props, [0, 1]),
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

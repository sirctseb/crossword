import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import CrosswordModel from '../model/Crossword';
import { DOWN, ACROSS } from './constants';

const bem = bemNamesFactory('suggestions');

class Suggestions extends Component {
  amendSuggestions(suggestions, direction) {
    const { row, column } = this.props.editor.cursor;
    const pattern = direction === ACROSS ?
      CrosswordModel.acrossPattern(this.props.crossword, row, column) :
      CrosswordModel.downPattern(this.props.crossword, row, column);

    return [
      ...Object.keys(this.props.crossword.theme_entries || {})
        .filter(entry => entry.match(pattern)),
      ...suggestions || [],
    ];
  }

  render() {
    return (
      <div className={bem()}>
                Across<br />
        {this.amendSuggestions(this.props.suggestions.across, ACROSS)}<br />
                Down<br />
        {this.amendSuggestions(this.props.suggestions.down, DOWN)}<br />
      </div>
    );
  }
}

Suggestions.propTypes = {
  suggestions: PropTypes.shape({
    across: PropTypes.arrayOf(PropTypes.string).isRequired,
    down: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  editor: PropTypes.shape({
    cursor: PropTypes.shape({
      row: PropTypes.number.isRequired,
      column: PropTypes.number.isRequired,
    }).isRequired,
  }),
  crossword: PropTypes.shape({
    theme_entries: PropTypes.object.isRequired,
  }).isRequired,
};

export default Suggestions;

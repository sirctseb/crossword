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

  renderSuggestions(direction) {
    const directionProperties = {
      [ACROSS]: 'across',
      [DOWN]: 'down',
    };

    const suggestions = this.amendSuggestions(
      this.props.suggestions[directionProperties[direction]],
      direction,
    );

    return suggestions.length > 0 ?
      suggestions.map(suggestion => (
        <div className={bem('suggestion')}
          key={suggestion}>
          {suggestion}
        </div>
      )) :
      <div className={bem('no-suggestions')}>
                no matches
      </div>;
  }

  render() {
    return (
      <div className={bem()}>
        <div className={bem('list')}>
                    Across
          <div className={bem('entries')}>
            {this.renderSuggestions(ACROSS)}
          </div>
        </div>
        <div className={bem('list')}>
                    Down
          <div className={bem('entries')}>
            {this.renderSuggestions(DOWN)}
          </div>
        </div>
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

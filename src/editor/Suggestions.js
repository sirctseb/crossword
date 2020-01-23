import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bemNamesFactory } from 'bem-names';

import * as selectors from './selectors';

const bem = bemNamesFactory('suggestions');

const Suggestions = ({ suggestions: { across, down } }) => {
  const renderSuggestions = suggestions =>
    (suggestions.length > 0 ?
      suggestions.map(suggestion => (
        <div className={bem('suggestion')}
          key={suggestion}>
          {suggestion}
        </div>
      )) :
      <div className={bem('no-suggestions')}>
        no matches
      </div>);

  return (
    <div className={bem()}>
      <div className={bem('list')}>
          Across
        <div className={bem('entries')}>
          {renderSuggestions(across)}
        </div>
      </div>
      <div className={bem('list')}>
          Down
        <div className={bem('entries')}>
          {renderSuggestions(down)}
        </div>
      </div>
    </div>
  );
};

Suggestions.propTypes = {
  suggestions: PropTypes.shape({
    across: PropTypes.arrayOf(PropTypes.string).isRequired,
    down: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default withRouter(connect((state, props) => ({
  suggestions: selectors.getAmendedSuggestions(state, props.match.params),
}))(Suggestions));

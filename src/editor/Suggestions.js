import React from 'react';
import { useSelector } from 'react-redux';
import { bemNamesFactory } from 'bem-names';

import { getAmendedSuggestions } from './selectors';

const bem = bemNamesFactory('suggestions');

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

const Suggestions = ({ id }) => {
  const { across, down } = useSelector(state => getAmendedSuggestions(state, { id }));

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

export default Suggestions;

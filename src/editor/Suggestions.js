import React from 'react';
import { useParams } from 'react-router-dom';
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

const Suggestions = () => {
  const params = useParams();
  const { across, down } = useSelector(state => getAmendedSuggestions(state, params));

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

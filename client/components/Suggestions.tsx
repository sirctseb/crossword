import React from 'react';
import { bemNamesFactory } from 'bem-names';

import useSuggestions from '../suggestions/useSuggestions';
import { ACROSS, DOWN } from './constants';

const bem = bemNamesFactory('suggestions');

const renderSuggestions = (suggestions) =>
  suggestions.length > 0 ? (
    suggestions.map((suggestion) => (
      <div className={bem('suggestion')} key={suggestion}>
        {suggestion}
      </div>
    ))
  ) : (
    <div className={bem('no-suggestions')}>no matches</div>
  );

const Suggestions = ({ themeSuggestions, acrossPattern, downPattern }) => {
  const globalSuggestions = useSuggestions(acrossPattern, downPattern);

  const across = [...themeSuggestions[ACROSS], ...globalSuggestions[ACROSS]];
  const down = [...themeSuggestions[DOWN], ...globalSuggestions[DOWN]];

  return (
    <div className={bem()}>
      <div className={bem('list')}>
        Across
        <div className={bem('entries')}>{renderSuggestions(across)}</div>
      </div>
      <div className={bem('list')}>
        Down
        <div className={bem('entries')}>{renderSuggestions(down)}</div>
      </div>
    </div>
  );
};

export default Suggestions;

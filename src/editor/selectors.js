import { createSelector } from 'reselect';
import { get } from 'lodash';
import { useSelector } from 'react-redux';

const getSuggestions = state => state.suggestions;

const getCrosswords = state => get(state, 'firebase.data.crosswords');

export const getCrosswordId = (state, { id }) => id;

export const makeGetCrossword = () => createSelector(
  [getCrosswords, getCrosswordId],
  (crosswords, id) => crosswords && crosswords[id],
);

export const getCrossword = makeGetCrossword();

// TODO hook that takes the patterns and uses the suggestions selector to give the patterns
export const useGlobalSuggestions = (acrossPattern, downPattern) => {
  const suggestions = useSelector(getSuggestions);
  return {
    across: suggestions[acrossPattern],
    down: suggestions[downPattern],
  };
};

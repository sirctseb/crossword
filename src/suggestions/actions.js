import { matchingAnswers } from '../functions';

import * as actionTypes from './actionTypes';

const getSuggestionsSuccess = (pattern, suggestions) => ({
  type: actionTypes.GET_SUGGESTIONS,
  pattern,
  suggestions,
});

export const getSuggestions = (pattern) => (dispatch, getState) => {
  if (!(pattern in getState().suggestions)) {
    matchingAnswers({ regex: pattern }).then((results) => dispatch(getSuggestionsSuccess(pattern, results.data)));
  }
};

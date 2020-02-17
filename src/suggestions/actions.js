import firebaseApp from 'firebase';

import * as actionTypes from './actionTypes';

const getSuggestionsSuccess = (pattern, suggestions) => ({
  type: actionTypes.GET_SUGGESTIONS,
  pattern,
  suggestions,
});

export const getSuggestions = pattern => (dispatch, getState) => {
  if (!(pattern in getState().suggestions)) {
    const matchingAnswers = firebaseApp.functions().httpsCallable('matchingAnswers');

    matchingAnswers({ regex: pattern })
      .then(results => dispatch(getSuggestionsSuccess(pattern, results.data)));
  }
};

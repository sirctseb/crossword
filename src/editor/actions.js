import firebaseApp from 'firebase';

import * as actionTypes from './actionTypes';

export const changeClue = clueInput => ({
  type: actionTypes.CHANGE_CLUE,
  clueInput,
});

const getSuggestionsSuccess = (pattern, suggestions) => ({
  type: actionTypes.GET_SUGGESTIONS,
  pattern,
  suggestions,
});

export const getSuggestions = pattern => (dispatch, getState) => {
  if (!(pattern in getState().editor.suggestions)) {
    const matchingAnswers = firebaseApp.functions().httpsCallable('matchingAnswers');

    matchingAnswers({ regex: pattern })
      .then(results => dispatch(getSuggestionsSuccess(pattern, results.data)));
  }
};

export const setCursor = cursor => ({
  type: actionTypes.SET_CURSOR,
  cursor,
});

export const setCursorDirection = direction => ({
  type: actionTypes.SET_CURSOR_DIRECTION,
  direction,
});

export const toggleCursorDirection = () => ({
  type: actionTypes.TOGGLE_CURSOR_DIRECTION,
});

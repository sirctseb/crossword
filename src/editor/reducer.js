import update from 'immutability-helper';

import * as actionTypes from './actionTypes';

const initialState = {
  clueInput: {
    row: null,
    column: null,
    value: null,
    direction: null,
  },
  suggestions: {
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.CHANGE_CLUE:
    return update(state, { clueInput: { $set: action.clueInput } });
  case actionTypes.GET_SUGGESTIONS:
    return update(state, {
      suggestions: {
        [action.pattern]: { $set: action.suggestions },
      },
    });
  default:
    return state;
  }
};

import update from 'immutability-helper';

import * as actionTypes from './actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_SUGGESTIONS:
      return update(state, {
        [action.pattern]: { $set: action.suggestions },
      });
    default:
      return state;
  }
};

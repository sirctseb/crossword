import update from 'immutability-helper';

import * as actionTypes from './actionTypes';
import { ACROSS } from './constants';

const initialState = {
    cursor: {
        row: 0,
        column: 0,
        direction: ACROSS,
    },
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
    case actionTypes.SET_CURSOR:
        return update(state, {
            cursor: { $set: action.cursor },
        });
    default:
        return state;
    }
};

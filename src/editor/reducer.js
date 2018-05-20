import update from 'immutability-helper';

import * as actionTypes from './actionTypes';

const initialState = {
    cursor: null,
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

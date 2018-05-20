import update from 'immutability-helper';

import * as actionTypes from './actionTypes';

const initialState = {
    clueInput: {
        row: null,
        column: null,
        value: null,
        direction: null,
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
    case actionTypes.CHANGE_CLUE:
        return update(state, { clueInput: { $set: action.clueInput } });
    default:
        return state;
    }
};

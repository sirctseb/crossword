import * as actionTypes from './actionTypes';


const initialState = {
    cursor: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
    case actionTypes.SET_CURSOR:
        return { cursor: action.cursor };
    default:
        return state;
    }
};

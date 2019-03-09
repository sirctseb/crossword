import { createSelector } from 'reselect';

const getUserId = state => state.firebase.auth.uid;

const getUsers = state => state.firebase.data.users;

export const getUserData = createSelector(
    [getUsers, getUserId],
    (users, id) => users && users[id],
);

export const getUserCrosswords = createSelector(
    [getUserData],
    ({ crosswords }) => ({ crosswords }),
);

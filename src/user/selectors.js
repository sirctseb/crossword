import { createSelector } from 'reselect';

const getUserId = (state, props) => props.params.userId;

const getUsers = state => state.firebase.data.users;

export const getUserData = createSelector(
    [getUsers, getUserId],
    (users, id) => users && users[id],
);

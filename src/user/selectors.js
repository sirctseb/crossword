import { createSelector } from 'reselect';
import { get } from 'lodash';

export const getUserId = state => state.firebase.auth.uid;

const getUsers = state => state.firebase.data.users;

export const getUserData = createSelector(
  [getUsers, getUserId],
  (users, id) => users && users[id],
);

export const getUserCrosswords = createSelector(
  [getUserData],
  userData => get(userData, 'crosswords'),
);

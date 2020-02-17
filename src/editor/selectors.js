import { createSelector } from 'reselect';
import { get } from 'lodash';

const getCrosswords = state => get(state, 'firebase.data.crosswords');

export const getCrosswordId = (state, { id }) => id;

export const makeGetCrossword = () => createSelector(
  [getCrosswords, getCrosswordId],
  (crosswords, id) => crosswords && crosswords[id],
);

export const getCrossword = makeGetCrossword();

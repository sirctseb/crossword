import { createSelector } from 'reselect';
import omit from 'lodash/omit';

import { getCrosswordId } from '../selectors';

const getLocalCursorId = (state, { cursorId }) => cursorId;

const getCursorSets = state => state.firebase.data.cursors;

export const getCursors = createSelector(
  [getCrosswordId, getCursorSets],
  (crosswordId, cursorSets) => cursorSets && cursorSets[crosswordId],
);

export const getRemoteCursors = createSelector(
  [getLocalCursorId, getCursors],
  (localCursorId, cursors) => omit(cursors, localCursorId),
);

export const test = {
  getLocalCursorId,
  getCursorSets,
  getCursors,
  getRemoteCursors,
};


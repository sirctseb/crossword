import { useFirebaseConnect } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import get from 'lodash/get';
import { getRemoteCursors } from './selectors';

const reduceCursors = (cursors) =>
  cursors.reduce((result, cursor) => {
    const { row, column } = cursor;
    return {
      ...result,
      [row]: {
        ...result[row],
        [column]: [...get(result, [row, column], []), cursor],
      },
    };
  }, {});

const useRemoteCursors = (crosswordId, cursorRef) => {
  useFirebaseConnect(`cursors/${crosswordId}`);

  const remoteCursors = useSelector((state) =>
    getRemoteCursors(state, { cursorId: cursorRef && cursorRef.key, id: crosswordId })
  );

  return reduceCursors(Object.values(remoteCursors));
};

export default useRemoteCursors;

export const test = {
  reduceCursors,
};

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import get from 'lodash/get';
import { bemNamesFactory } from 'bem-names';

import { finishCommunalCrossword } from '../functions';
import { makeGetCrossword } from '../editor/selectors';

const bem = bemNamesFactory('extras');

const full = ({ boxes, rows }) => {
  const range = [...Array(rows).keys()];
  return range.every((row) =>
    range.every((column) => {
      const { blocked, content } = get(boxes, [row, column], {});
      return blocked || content;
    })
  );
};

const Extras = ({ children, id }) => {
  const getCrossword = useMemo(makeGetCrossword, []);
  const crossword = useSelector((state) => getCrossword(state, { id }));
  return (
    <div className={bem()}>
      {children}
      {crossword && full(crossword) && (
        <button className={bem('finish')} onClick={() => finishCommunalCrossword()}>
          Finish
        </button>
      )}
    </div>
  );
};

export default Extras;

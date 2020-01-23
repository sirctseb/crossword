import React from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';
import { get } from 'lodash';

import { DOWN, ACROSS } from './constants';

const displayNames = {
  [ACROSS]: 'Across',
  [DOWN]: 'Down',
};

const bem = bemNamesFactory('clue-list');

const ClueList = ({
  onClueBlur, clueLabels, clueData, clueInput, direction, actions: { changeClue },
}) => (
  <div className='clue-list'>
    {displayNames[direction]}
    {
      clueLabels.map(({ row, column, label }) =>
        <div key={label}
          className={bem('clue')}>
          {label}.
          <input type='text'
            className={bem('clue-input')}
            value={(
              row === clueInput.row &&
                                  column === clueInput.column &&
                                  clueInput.direction === direction &&
                                  clueInput.value
            ) || get(clueData, [row, column], '')}
            onChange={(evt) => {
              changeClue({
                value: evt.target.value, row, column, direction,
              });
            }}
            onBlur={onClueBlur}
          />
        </div>)
    }
  </div>
);

ClueList.propTypes = {
  direction: propTypes.oneOf([DOWN, ACROSS]).isRequired,
  clueLabels: propTypes.arrayOf(propTypes.object).isRequired,
  clueData: propTypes.oneOfType([propTypes.object, propTypes.array]).isRequired,
  clueInput: propTypes.object.isRequired,
  actions: propTypes.object.isRequired,
  onClueBlur: propTypes.func.isRequired,
};

export default ClueList;

import React from 'react';

import { Direction, Matrix } from '../../firebase-recoil/data';
import { Address } from '../../types';

const displayNames = {
  [Direction.across]: 'Across',
  [Direction.down]: 'Down',
};

export interface ClueValue {
  value: string | null;
  row: number | null;
  column: number | null;
  direction: Direction | null;
}

interface ClueListProps {
  direction: Direction;
  clueLabels: Address[];
  clueData: Matrix<string>;
  clueInput: ClueValue;
  onChangeClue: (value: ClueValue) => any;
  onClueBlur: () => any;
}

import styles from './ClueList.module.scss';

const ClueList: React.FC<ClueListProps> = ({
  onClueBlur,
  clueLabels,
  clueData,
  clueInput,
  direction,
  onChangeClue,
}) => (
  <div className={styles.clueList}>
    {displayNames[direction]}
    {clueLabels.map(({ row, column, label }) => (
      <div key={label} className={styles.clue}>
        {label}.
        <input
          type="text"
          className={styles.clueInput}
          value={
            (row === clueInput.row &&
              column === clueInput.column &&
              clueInput.direction === direction &&
              clueInput.value) ||
            clueData?.[row]?.[column] ||
            ''
          }
          onChange={(evt) => {
            onChangeClue({
              value: evt.target.value,
              row,
              column,
              direction,
            });
          }}
          onBlur={onClueBlur}
        />
      </div>
    ))}
  </div>
);

export default ClueList;

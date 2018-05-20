import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { get } from 'lodash';
import { bemNamesFactory } from 'bem-names';

import BoxControls from './BoxControls';

const enhance = compose(
  firebaseConnect(props => ([
    `crosswords/${props.params.crosswordId}`,
  ])),
  connect(({ firebase: { data: { crosswords } }, editor }, props) => ({
    crossword: crosswords && crosswords[props.params.crosswordId],
    path: `crosswords/${props.params.crosswordId}`,
    editor,
  })),
);

const blockedUpdate = (row, column, { rows, symmetric }, blocked) => {
  const update = {
    [`boxes/${row}/${column}/blocked`]: blocked,
  };

  if (symmetric) {
    update[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] = blocked;
  }

  return update;
};

class Editor extends Component {
  render() {
    const bem = bemNamesFactory('editor');

    const {
      firebase: { set, update }, path, crossword, editor,
    } = this.props;

    if (!crossword) {
      return 'WAIT!';
    }

    const rows = [];
    let clueIndex = 1;
    for (let row = 0; row < crossword.rows; row += 1) {
      const boxes = [];
      for (let column = 0; column < crossword.rows; column += 1) {
        const box = get(crossword, `boxes.${row}.${column}`, {});
        const {
          blocked, circled, shaded, content,
        } = box;
        const focused = editor.cursor &&
                    row === editor.cursor.row &&
                    column === editor.cursor.column;
        const boxPath = `${path}/boxes/${row}/${column}`;
        const indexBox = !blocked &&
                (
                  row === 0 ||
                    column === 0 ||
                    get(crossword, `boxes.${row - 1}.${column}.blocked`) ||
                    get(crossword, `boxes.${row}.${column - 1}.blocked`)
                );

        boxes.push((
          <div className={bem('box', {
            blocked, circled, shaded, focused,
          })}
          key={`box-${row}-${column}`}
          tabIndex={!blocked ? '0' : undefined}
          onKeyPress={evt => set(`${boxPath}/content`, evt.key)}>
            <BoxControls set={set} boxPath={boxPath} box={box}
              onBlock={
                () => update(path, blockedUpdate(row, column, crossword, !blocked))
              }
            />
            {
              indexBox &&
                            <div className={bem('clue-index')}>
                              {clueIndex}
                            </div>
            }
            { content }
          </div>
        ));

        if (indexBox) {
          clueIndex += 1;
        }
      }
      rows.push((
        <div className='editor__row'
          key={`row-${row}`}>
          {boxes}
        </div>
      ));
    }
    return (
      <div className='editor'>
        <input type='number'
          className='editor__input'
          value={crossword.rows}
          onChange={evt => set(`${path}/rows`, evt.target.value)} />
        <input type='checkbox'
          className='editor__symmetric'
          checked={crossword.symmetric}
          onChange={evt => set(`${path}/symmetric`, evt.target.checked)} />
        <div className={bem('grid')}>
          {rows}
        </div>
      </div>
    );
  }
}

export default enhance(Editor);

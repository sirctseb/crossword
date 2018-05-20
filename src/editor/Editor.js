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

        const refRows = [];
        const rows = [];

        let clueIndex = 1;
        const acrossClues = [];
        const downClues = [];

        for (let row = 0; row < crossword.rows; row += 1) {
            const boxes = [];
            const refBoxes = [];
            for (let column = 0; column < crossword.rows; column += 1) {
                const box = get(crossword, `boxes.${row}.${column}`, {});
                const {
                    blocked, circled, shaded, content,
                } = box;
                const focused = editor.cursor &&
                    row === editor.cursor.row &&
                    column === editor.cursor.column;
                const boxPath = `${path}/boxes/${row}/${column}`;
                const leftBlocked = column === 0 ||
                    get(crossword, `boxes.${row}.${column - 1}.blocked`);
                const topBlocked = row === 0 ||
                    get(crossword, `boxes.${row - 1}.${column}.blocked`);
                const indexBox = !blocked && (leftBlocked || topBlocked);
                if (indexBox && leftBlocked) {
                    acrossClues.push(clueIndex);
                }
                if (indexBox && topBlocked) {
                    downClues.push(clueIndex);
                }

                boxes.push((
                    <div className={bem('box', {
                        blocked, circled, shaded, focused,
                    })}
                    key={`box-${row}-${column}`}
                    tabIndex={!blocked ? '0' : undefined}
                    ref={ref => refBoxes.push(ref)}
                    onKeyPress={(evt) => {
                        if (/[A-z]/.test(evt.key)) {
                            set(`${boxPath}/content`, evt.key);
                        }
                    }}
                    onKeyDown={(evt) => {
                        switch (evt.key) {
                        case 'ArrowLeft':
                            if (column > 0) {
                                refRows[row][column - 1].focus();
                            }
                            break;
                        case 'ArrowRight':
                            if (column < crossword.rows - 1) {
                                refRows[row][column + 1].focus();
                            }
                            break;
                        case 'ArrowUp':
                            if (row > 0) {
                                refRows[row - 1][column].focus();
                            }
                            break;
                        case 'ArrowDown':
                            if (row < crossword.rows - 1) {
                                refRows[row + 1][column].focus();
                            }
                            break;
                        default:
                            break;
                        }
                    }}>
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
            refRows.push(refBoxes);
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
                <div className={bem('clues-and-grid')}>
                    <div className={bem('across-clues')}>
                        Across
                        {
                            acrossClues.map(clueLabel =>
                                <div key={clueLabel}
                                    className={bem('clue')}>
                                    {clueLabel}
                                </div>)
                        }
                    </div>
                    <div className={bem('grid')}>
                        {rows}
                    </div>
                    <div className={bem('down-clues')}>
                        Down
                        {
                            downClues.map(clueLabel =>
                                <div key={clueLabel}
                                    className={bem('clue')}>
                                    {clueLabel}
                                </div>)
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default enhance(Editor);

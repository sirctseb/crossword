import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { get } from 'lodash';
import { bemNamesFactory } from 'bem-names';
import { hotkeys } from 'react-keyboard-shortcuts';

import * as actions from './actions';
import UndoHistory from '../undo/UndoHistory';
import FirebaseChange from '../undo/FirebaseChange';
import BoxControls from './BoxControls';

const enhance = compose(
    firebaseConnect(props => ([
        `crosswords/${props.params.crosswordId}`,
    ])),
    connect(
        ({ firebase: { data: { crosswords } }, editor }, props) => ({
            crossword: crosswords && crosswords[props.params.crosswordId],
            path: `crosswords/${props.params.crosswordId}`,
            editor,
        }),
        dispatch => ({ actions: bindActionCreators(actions, dispatch) }),
    ),
    hotkeys,
);

const blockedChange = (row, column, { rows, symmetric }, blocked, crosswordRef) => {
    const update = {
        [`boxes/${row}/${column}/blocked`]: blocked,
    };

    const undoUpdate = {
        [`boxes/${row}/${column}/blocked`]: !blocked,
    };

    if (symmetric) {
        update[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] = blocked;
        undoUpdate[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] = !blocked;
    }

    return new FirebaseChange(crosswordRef, update, undoUpdate);
};

const undoHistory = UndoHistory.getHistory('crossword');

class Editor extends Component {
    constructor(props) {
        super(props);

        this.hot_keys = {
            'meta+z': {
                handler: (evt) => {
                    if (document.activeElement.tagName !== 'INPUT') {
                        undoHistory.undo();
                    }
                    evt.preventDefault();
                },
            },
            'shift+meta+z': {
                handler: (evt) => {
                    if (document.activeElement.tagName !== 'INPUT') {
                        undoHistory.redo();
                    }
                    evt.preventDefault();
                },
            },
        };
    }

    render() {
        const bem = bemNamesFactory('editor');
        const fbRef = this.props.firebase.ref();

        const {
            firebase: { set }, path, crossword, editor,
            actions: { changeClue },
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
                    acrossClues.push({ row, column, label: clueIndex });
                }
                if (indexBox && topBlocked) {
                    downClues.push({ row, column, label: clueIndex });
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
                            undoHistory.add(FirebaseChange.FromValues(
                                fbRef.child(`${boxPath}/content`),
                                evt.key,
                                box.content,
                            ));
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
                        <BoxControls boxRef={fbRef.child(boxPath)} box={box}
                            onBlock={() => undoHistory.add(blockedChange(
                                row,
                                column,
                                crossword,
                                !blocked,
                                fbRef.child(path),
                            )) }
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
                    onChange={evt =>
                        undoHistory.add(FirebaseChange.FromValues(
                            fbRef.child(`${path}/rows`),
                            evt.target.value,
                            crossword.rows,
                        ))} />
                <input type='checkbox'
                    className='editor__symmetric'
                    checked={crossword.symmetric}
                    onChange={evt => set(`${path}/symmetric`, evt.target.checked)} />
                <div className={bem('clues-and-grid')}>
                    <div className={bem('across-clues')}>
                        Across
                        {
                            acrossClues.map(({
                                row, column, label,
                            }) =>
                                <div key={label}
                                    className={bem('clue')}>
                                    {label}.
                                    <input type='text'
                                        className={bem('clue-input')}
                                        value={(
                                            row === editor.clueInput.row &&
                                            column === editor.clueInput.column &&
                                            editor.clueInput.direction === 'across' &&
                                            editor.clueInput.value
                                        ) || get(crossword, `clues.across.${row}.${column}`, '')}
                                        onChange={(evt) => {
                                            changeClue({
                                                value: evt.target.value, row, column, direction: 'across',
                                            });
                                        }}
                                        onBlur={(evt) => {
                                            undoHistory.add(FirebaseChange.FromValues(
                                                fbRef.child(`${path}/clues/across/${row}/${column}`),
                                                evt.target.value,
                                                get(crossword, `clues.across.${row}.${column}`),
                                            ));
                                            changeClue({
                                                value: null,
                                                row: null,
                                                column: null,
                                                direction: null,
                                            });
                                        }}
                                    />
                                </div>)
                        }
                    </div>
                    <div className={bem('grid')}>
                        {rows}
                    </div>
                    <div className={bem('down-clues')}>
                        Down
                        {
                            downClues.map(({
                                row, column, label,
                            }) =>
                                <div key={label}
                                    className={bem('clue')}>
                                    {label}.
                                    <input type='text'
                                        className={bem('clue-input')}
                                        value={(
                                            row === editor.clueInput.row &&
                                            column === editor.clueInput.column &&
                                            editor.clueInput.direction === 'down' &&
                                            editor.clueInput.value
                                        ) || get(crossword, `clues.down.${row}.${column}`, '')}
                                        onChange={(evt) => {
                                            changeClue({
                                                value: evt.target.value, row, column, direction: 'down',
                                            });
                                        }}
                                        onBlur={(evt) => {
                                            undoHistory.add(FirebaseChange.FromValues(
                                                fbRef.child(`${path}/clues/down/${row}/${column}`),
                                                evt.target.value,
                                                get(crossword, `clues.down.${row}.${column}`),
                                            ));
                                            changeClue({
                                                value: null,
                                                row: null,
                                                column: null,
                                                direction: null,
                                            });
                                        }}
                                    />
                                </div>)
                        }
                    </div>
                </div>
                <button onClick={() => undoHistory.undo()}>Undo</button>
                <button onClick={() => undoHistory.redo()}>Redo</button>
            </div>
        );
    }
}

export default enhance(Editor);

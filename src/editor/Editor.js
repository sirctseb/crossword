import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { get } from 'lodash';
import { bemNamesFactory } from 'bem-names';
import { hotkeys } from 'react-keyboard-shortcuts';

import * as selectors from './selectors';
import * as actions from './actions';
import { DOWN, ACROSS } from './constants';
import UndoHistory from '../undo/UndoHistory';
import FirebaseChange from '../undo/FirebaseChange';
import ClueList from './ClueList';
import Box from './Box';
import hotKeyEditor from './HotKeyEditor';
import ThemeEntries from './themeEntries';
import Suggestions from './Suggestions';

const enhance = compose(
    firebaseConnect(props => ([
        `crosswords/${props.params.crosswordId}`,
    ])),
    connect(
        (state, props) =>
            (selectors.getCrossword(state, props) ?
                ({
                    crossword: selectors.getCrossword(state, props),
                    acrossPattern: selectors.getAcrossPattern(state, props),
                    downPattern: selectors.getDownPattern(state, props),
                    path: `crosswords/${props.params.crosswordId}`,
                    editor: state.editor,
                    size: selectors.getSize(state, props),
                    cursorContent: selectors.getCursorContent(state, props),
                    isCursorAnswer: selectors.getIsCursorAnswer(state, props),
                    isFocusBox: selectors.getIsFocusBox(state, props),
                    isBlockedBox: selectors.getIsBlockedBox(state, props),
                    cursorAfterAdvancement: selectors.getCursorAfterAdvancement(state, props),
                    clueAddresses: selectors.getClueAddresses(state, props),
                    labelMap: selectors.getLabelMap(state, props),
                }) :
                ({
                    loading: true,
                })),
        dispatch => ({ actions: bindActionCreators(actions, dispatch) }),
    ),
    hotkeys,
    hotKeyEditor,
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

const emptyBox = {};

class Editor extends Component {
    makeUndoableChange = (localPath, newValue, oldValue) => {
        undoHistory.add(FirebaseChange.FromValues(
            this.fbRef.child(`${this.props.path}/${localPath}`),
            newValue,
            oldValue
        ));
    }

    onBoxFocus = (row, column) => {
        this.props.actions.setCursor({ row, column });
    }

    handleAfterSetContent = () => {
        const { row, column } = this.props.cursorAfterAdvancement;
        document.querySelector(`.box--at-${row}-${column}`).focus();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.editor.cursor.row !== this.props.editor.cursor.row ||
            prevProps.editor.cursor.column !== this.props.editor.cursor.column ||
            prevProps.cursorContent !== this.props.cursorContent) {
            this.props.actions.getSuggestions(this.props.acrossPattern);
            this.props.actions.getSuggestions(this.props.downPattern);
        }
    }

    componentWillMount() {
        this.fbRef = this.props.firebase.ref();
    }

    onClueBlur = () => {
        const {
            editor: {
                clueInput: {
                    direction, row, column, value,
                },
            }, path, crossword,
        } = this.props;

        undoHistory.add(FirebaseChange.FromValues(
            this.fbRef.child(`${path}/clues/${direction}/${row}/${column}`),
            value,
            get(crossword, `clues.${direction}.${row}.${column}`),
        ));
        this.props.actions.changeClue({
            value: null,
            row: null,
            column: null,
            direction: null,
        });
    }

    onBlock = (row, column, blocked) => {
        undoHistory.add(blockedChange(
            row,
            column,
            this.props.crossword,
            blocked,
            this.fbRef.child(this.props.path)
        ));
    }

    render() {
        const bem = bemNamesFactory('editor');

        const {
            firebase: { set }, path, crossword, editor, isCursorAnswer, isFocusBox,
            labelMap,
            clueAddresses: { across: acrossClues, down: downClues },
        } = this.props;

        const rows = [];

        for (let row = 0; row < crossword.rows; row += 1) {
            const boxes = [];
            for (let column = 0; column < crossword.rows; column += 1) {
                const box = get(crossword, `boxes.${row}.${column}`, emptyBox);
                const label = labelMap[row][column];

                boxes.push((
                    <Box key={`box-${row}-${column}`}
                        cursorAnswer={isCursorAnswer(row, column)}
                        row={row}
                        column={column}
                        box={box}
                        makeUndoableChange={this.makeUndoableChange}
                        clueLabel={label}
                        onBlock={this.onBlock}
                        onBoxFocus={this.onBoxFocus}
                        focused={isFocusBox(row, column)}
                        onAfterSetContent={this.handleAfterSetContent}
                    />
                ));
            }
            rows.push((
                <div className='editor__row'
                    key={`row-${row}`}>
                    {boxes}
                </div>
            ));
        }
        return (
            <div className={bem([`size-${crossword.rows}`])}>
                <input type='number'
                    className='editor__input'
                    value={crossword.rows}
                    onChange={evt =>
                        undoHistory.add(FirebaseChange.FromValues(
                            this.fbRef.child(`${path}/rows`),
                            parseInt(evt.target.value, 10),
                            crossword.rows,
                        ))} />
                <input type='checkbox'
                    className='editor__symmetric'
                    checked={crossword.symmetric}
                    onChange={evt => set(`${path}/symmetric`, evt.target.checked)} />
                <div className={bem('clues-and-grid')}>
                    <div className={bem('clues-wrapper')}>
                        <ClueList direction={ACROSS}
                            clueLabels={acrossClues}
                            clueData={get(crossword.clues, 'across', [])}
                            clueInput={editor.clueInput}
                            actions={this.props.actions}
                            onClueBlur={this.onClueBlur} />
                    </div>
                    <div className={bem('grid')}>
                        {rows}
                    </div>
                    <div className={bem('clues-wrapper')}>
                        <ClueList direction={DOWN}
                            clueLabels={downClues}
                            clueData={get(crossword.clues, 'down', [])}
                            clueInput={editor.clueInput}
                            actions={this.props.actions}
                            onClueBlur={this.onClueBlur} />
                    </div>
                </div>
                <Suggestions />
                <ThemeEntries fbRef={this.fbRef.child(path).child('themeEntries')} />
                <button onClick={() => undoHistory.undo()}>Undo</button>
                <button onClick={() => undoHistory.redo()}>Redo</button>
            </div>
        );
    }
}

Editor.propTypes = {
    crossword: PropTypes.object.isRequired,
    acrossPattern: PropTypes.string.isRequired,
    downPattern: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    editor: PropTypes.object.isRequired,
    isCursorAnswer: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    isFocusBox: PropTypes.func.isRequired,
    cursorContent: PropTypes.string,
    cursorAfterAdvancement: PropTypes.object.isRequired,
    clueAddresses: PropTypes.object.isRequired,
    labelMap: PropTypes.object.isRequired,
};

const EditorContainer = ({ loading, ...props }) =>
    (loading ?
        'WAIT!' :
        <Editor {...props} />);


export default enhance(EditorContainer);

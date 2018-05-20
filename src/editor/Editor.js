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
import CrosswordModel from '../model/Crossword';
import ClueList from './ClueList';
import Box from './Box';

const enhance = compose(
  firebaseConnect(props => ([
    `crosswords/${props.params.crosswordId}`,
  ])),
  connect(
    ({ firebase: { data: { crosswords } }, editor }, props) => ({
      crossword: crosswords && crosswords[props.params.crosswordId],
      suggestions: (crosswords && editor.cursor) ? {
        across: editor.suggestions[CrosswordModel.acrossPattern(
          crosswords[props.params.crosswordId],
          editor.cursor.row,
          editor.cursor.column,
        )],
        down: editor.suggestions[CrosswordModel.downPattern(
          crosswords[props.params.crosswordId],
          editor.cursor.row,
          editor.cursor.column,
        )],
      } :
        { across: '', down: '' },
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

const updateSuggestions = (row, column, crossword, crosswordActions) => {
  const acrossPattern = CrosswordModel.acrossPattern(crossword, row, column);
  const downPattern = CrosswordModel.downPattern(crossword, row, column);

  crosswordActions.getSuggestions(acrossPattern);
  crosswordActions.getSuggestions(downPattern);
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

    this.onClueBlur = this.onClueBlur.bind(this);
    this.onBoxFocus = this.onBoxFocus.bind(this);
    this.assignFocus = this.assignFocus.bind(this);
    this.boxRefs = {};
  }

  onBoxFocus(row, column) {
    this.props.actions.setCursor({ row, column });
    updateSuggestions(row, column, this.props.crossword, this.props.actions);
  }

  assignFocus(row, column) {
    const { rows: size } = this.props.crossword;

    if (row > 0 && column > 0 && row < size && column < size) {
      this.boxRefs[`${row}.${column}`].focus();
    }
  }

  onClueBlur() {
    const {
      editor: {
        clueInput: {
          direction, row, column, value,
        },
      }, path, crossword,
    } = this.props;

    undoHistory.add(FirebaseChange.FromValues(
      this.props.firebase.ref().child(`${path}/clues/${direction}/${row}/${column}`),
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

  render() {
    const bem = bemNamesFactory('editor');
    const fbRef = this.props.firebase.ref();

    const {
      firebase: { set }, path, crossword, editor,
    } = this.props;

    if (!crossword) {
      return 'WAIT!';
    }

    const rows = [];

    let clueIndex = 1;
    const acrossClues = [];
    const downClues = [];

    for (let row = 0; row < crossword.rows; row += 1) {
      const boxes = [];
      for (let column = 0; column < crossword.rows; column += 1) {
        const box = get(crossword, `boxes.${row}.${column}`, {});
        const {
          blocked,
        } = box;
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
          <Box key={`box-${row}-${column}`}
            row={row}
            column={column}
            box={box}
            boxRef={fbRef.child(boxPath)}
            undoHistory={undoHistory}
            assignFocus={this.assignFocus}
            clueLabel={indexBox ? clueIndex : undefined}
            onRef={(ref) => {
              this.boxRefs[`${row}.${column}`] = ref;
            }}
            onBlock={() => undoHistory.add(blockedChange(
              row,
              column,
              crossword,
              !blocked,
              fbRef.child(path),
            ))}
            onBoxFocus={this.onBoxFocus}
          />
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
      <div className={bem([`size-${crossword.rows}`])}>
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
          <div className={bem('clues-wrapper')}>
            <ClueList direction='across'
              clueLabels={acrossClues}
              clueData={crossword.clues.across}
              clueInput={editor.clueInput}
              actions={this.props.actions}
              onClueBlur={this.onClueBlur} />
          </div>
          <div className={bem('grid')}>
            {rows}
          </div>
          <div className={bem('clues-wrapper')}>
            <ClueList direction='down'
              clueLabels={downClues}
              clueData={crossword.clues.down}
              clueInput={editor.clueInput}
              actions={this.props.actions}
              onClueBlur={this.onClueBlur} />
          </div>
        </div>
        <div className={bem('suggestions')}>
                    Across<br />
          {this.props.suggestions.across}<br />
                    Down<br />
          {this.props.suggestions.down}<br />
        </div>
        <button onClick={() => undoHistory.undo()}>Undo</button>
        <button onClick={() => undoHistory.redo()}>Redo</button>
      </div>
    );
  }
}

export default enhance(Editor);

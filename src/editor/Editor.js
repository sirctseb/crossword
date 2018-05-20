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

class Editor extends Component {
    render() {
        const bem = bemNamesFactory('editor');

        const {
            firebase: { set }, path, crossword, editor,
        } = this.props;

        if (!crossword) {
            return 'WAIT!';
        }

        const rows = [];
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

                boxes.push((
                    <div className={bem('box', {
                        blocked, circled, shaded, focused,
                    })}
                    key={`box-${row}-${column}`}
                    tabIndex='0'
                    onKeyPress={
                        (evt) => {
                            if (editor.cursor) {
                                set(`${boxPath}/content`, evt.key);
                            }
                        } }>
                        <BoxControls set={set} boxPath={boxPath} box={box} />
                        { content }
                    </div>
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
            <div className='editor'>
                <input type='number'
                    className='editor__input'
                    value={crossword.rows}
                    onChange={evt => set(`${path}/rows`, evt.target.value)} />
                {rows}
            </div>
        );
    }
}

export default enhance(Editor);

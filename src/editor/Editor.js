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
    connect(({ firebase: { data: { crosswords } } }, props) => ({
        crossword: crosswords && crosswords[props.params.crosswordId],
        path: `crosswords/${props.params.crosswordId}`,
    })),
);

class Editor extends Component {
    render() {
        const bem = bemNamesFactory('editor');

        const { firebase: { set }, path, crossword } = this.props;
        if (!crossword) {
            return 'WAIT!';
        }
        const rows = [];
        for (let i = 0; i < crossword.rows; i += 1) {
            const boxes = [];
            for (let j = 0; j < crossword.rows; j += 1) {
                const { blocked, circled, shaded } = get(crossword, `boxes.${i}.${j}`, {});
                const boxPath = `${path}/boxes/${i}/${j}`;
                boxes.push((
                    <div className={bem('box', { blocked, circled, shaded })}
                        key={`box-${i}-${j}`}>
                        <BoxControls onToggleBlock={() => set(`${boxPath}/blocked`, !blocked)}
                            onToggleCircle={() => set(`${boxPath}/circled`, !circled)}
                            onToggleShade={() => set(`${boxPath}/shaded`, !shaded)} />
                    </div>
                ));
            }
            rows.push((
                <div className='editor__row'
                    key={`row-${i}`}>
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

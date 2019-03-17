import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { bemNamesFactory } from 'bem-names';
import { get } from 'lodash';

import * as selectors from '../editor/selectors';

const bem = bemNamesFactory('crossword-preview');

const enhance = compose(
    firebaseConnect(({ id }) => ([
        `/crosswords/${id}`,
    ])),
    connect((state, props) => ({
        crossword: selectors.getCrossword(state, { crosswordId: props.id }),
        metadata: props,
    }))
);

const drawBoxes = ({ rows, boxes }) => {
    const rowElements = [];
    for (let row = 0; row < rows; row += 1) {
        const boxElements = [];
        for (let column = 0; column < rows; column += 1) {
            boxElements.push(<div key={`box-${row}-${column}`}
                className={bem('box', {
                    blocked: get(boxes, [row, column, 'blocked']),
                })}>{get(boxes, [row, column, 'content'])}</div>);
        }
        rowElements.push(<div key={`row-${row}`} className={bem('row')}>{boxElements}</div>);
    }
    return rowElements;
};

export default enhance(({ metadata, crossword }) => (
    <div className={bem()}>
        {
            crossword &&
            <div className={bem('grid', [`size-${crossword.rows}`])}>
                { drawBoxes(crossword) }
            </div>
        }
        <a href={`/${metadata.id}`}>
            {metadata.title || 'Untitled'}
        </a>
    </div>
));

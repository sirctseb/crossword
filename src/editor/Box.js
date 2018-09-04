import React, { Component } from 'react';
import { bemNamesFactory } from 'bem-names';
import propTypes from 'prop-types';

import FirebaseChange from '../undo/FirebaseChange';
import BoxControls from './BoxControls';

export default class Box extends Component {
    constructor(props) {
        super(props);

        this.onFocus = this.onFocus.bind(this);
    }

    onFocus() {
        this.props.onBoxFocus(this.props.row, this.props.column);
    }

    render() {
        const bem = bemNamesFactory('box');
        const {
            box: {
                blocked, circled, shaded, content,
            }, undoHistory, clueLabel, cursorAnswer: active,
            row, column,
        } = this.props;

        return (
            <div className={
                bem(
                    {
                        blocked, circled, shaded, active,
                    },
                    [`at-${row}-${column}`],
                )}
            tabIndex={!blocked ? '0' : undefined}
            ref={this.props.onRef}
            onKeyPress={(evt) => {
                if (/[A-z]/.test(evt.key)) {
                    undoHistory.add(FirebaseChange.FromValues(
                        this.props.boxRef.child('content'),
                        evt.key,
                        content,
                    ));
                }
            }}
            onFocus={this.onFocus}
            onKeyDown={this.onKeyDown}>
                <BoxControls boxRef={this.props.boxRef}
                    box={this.props.box}
                    onBlock={this.props.onBlock} />
                {
                    clueLabel &&
                    <div className={bem('clue-index')}>
                        {clueLabel}
                    </div>
                }
                { content }
            </div>
        );
    }
}

Box.propTypes = {
    row: propTypes.number.isRequired,
    column: propTypes.number.isRequired,
    box: propTypes.shape({
        blocked: propTypes.boolean,
        circled: propTypes.boolean,
        shaded: propTypes.boolean,
    }).isRequired,
    boxRef: propTypes.object.isRequired,
    undoHistory: propTypes.object.isRequired,
    clueLabel: propTypes.number,
    onBlock: propTypes.func.isRequired,
    onBoxFocus: propTypes.func.isRequired,
};

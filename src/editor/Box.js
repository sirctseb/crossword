import React, { Component } from 'react';
import { bemNamesFactory } from 'bem-names';
import propTypes from 'prop-types';

import FirebaseChange from '../undo/FirebaseChange';
import BoxControls from './BoxControls';
import RebusInput from './RebusInput';

export default class Box extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rebus: false,
        };

        this.handleFocus = this.handleFocus.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleRebusClose = this.handleRebusClose.bind(this);
    }

    handleFocus() {
        this.props.onBoxFocus(this.props.row, this.props.column);
    }
    handleMouseDown(evt) {
        if (this.props.focused) {
            this.setState({ rebus: true });
            // when state goes to { rebus: true }, the input is rendered
            // and we focus the input element in RebusInput.componentDidMount
            // we have to preventDefault here so that we don't immediately
            // yank it back to the box
            evt.preventDefault();
        }
    }
    handleRebusClose(content) {
        this.setContent(content);
        this.setState({ rebus: false });
    }

    setContent(content) {
        this.props.undoHistory.add(FirebaseChange.FromValues(
            this.props.boxRef.child('content'),
            content,
            this.props.box.content,
        ));
    }

    render() {
        const bem = bemNamesFactory('box');
        const {
            box: {
                blocked, circled, shaded, content,
            }, clueLabel, cursorAnswer: active,
            row, column,
        } = this.props;
        const { rebus } = this.state;

        return (
            <div
                className={
                    bem(
                        {
                            blocked, circled, shaded, active,
                        },
                        [`at-${row}-${column}`],
                    )}
                tabIndex={!blocked ? '0' : undefined}
                ref={this.props.onRef}
                onKeyPress={(evt) => {
                    if (/[A-Za-z]/.test(evt.key)) {
                        this.setContent(evt.key);
                    }
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Backspace') {
                        this.setContent(null);
                    }
                }}
                onFocus={this.handleFocus}
                onMouseDown={this.handleMouseDown}>
                <BoxControls boxRef={this.props.boxRef}
                    box={this.props.box}
                    onBlock={this.props.onBlock} />
                {
                    rebus &&
                    <RebusInput
                        content={content}
                        onClose={this.handleRebusClose} /> }
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

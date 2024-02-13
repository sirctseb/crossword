import React, { PureComponent } from 'react';
import { bemNamesFactory } from 'bem-names';
import propTypes from 'prop-types';

import BoxControls from './BoxControls';
import RebusInput from './RebusInput';

const targetFocused = ({ currentTarget }) => document.activeElement === currentTarget;

export default class Box extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            rebus: false,
        };
    }

    handleFocus = () => {
        this.props.onBoxFocus(this.props.row, this.props.column);
    }

    handleMouseDown = (evt) => {
        if (this.props.cursor) {
            this.setState({ rebus: true });
            // when state goes to { rebus: true }, the input is rendered
            // and we focus the input element in RebusInput.componentDidMount
            // we have to preventDefault here so that we don't immediately
            // yank it back to the box
            evt.preventDefault();
        }
    }

    handleRebusClose = (content = this.props.box.content) => {
        this.setContent(content);
        this.setState({ rebus: false });
    }

    handleOnBlock = () => {
        const { row, column, box: { blocked } } = this.props;
        this.props.onBlock(row, column, !blocked);
    }

    handleToggleAttribute = (attribute) => {
        const { row, column, box } = this.props;

        this.props.makeUndoableChange(
            `boxes/${row}/${column}/${attribute}`,
            !box[attribute],
            box[attribute]
        );
    }

    setContent(newContent) {
        const { row, column, box: { content } } = this.props;
        this.props.makeUndoableChange(
            `boxes/${row}/${column}/content`,
            newContent,
            content
        );
        this.props.onAfterSetContent(newContent);
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
                onKeyPress={(evt) => {
                    if (/^[A-Za-z]$/.test(evt.key) && targetFocused(evt)) {
                        this.setContent(evt.key);
                    }
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Backspace' && targetFocused(evt)) {
                        this.setContent(null);
                    }
                }}
                onFocus={this.handleFocus}
                onMouseDown={this.handleMouseDown}>
                <BoxControls onToggleAttribute={this.handleToggleAttribute}
                    box={this.props.box}
                    onBlock={this.handleOnBlock} />
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
        blocked: propTypes.bool,
        circled: propTypes.bool,
        shaded: propTypes.bool,
        content: propTypes.string,
    }).isRequired,
    cursor: propTypes.bool.isRequired,
    makeUndoableChange: propTypes.func.isRequired,
    clueLabel: propTypes.number,
    onBlock: propTypes.func.isRequired,
    onBoxFocus: propTypes.func.isRequired,
    onAfterSetContent: propTypes.func.isRequired,
};

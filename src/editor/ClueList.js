import React, { Component } from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';
import { get } from 'lodash';

const displayNames = {
    across: 'Across',
    down: 'Down',
};

export default class ClueList extends Component {
    render() {
        const bem = bemNamesFactory('clue-list');
        const {
            clueLabels, clueData, clueInput, direction, actions: { changeClue },
        } = this.props;

        return (
            <div className='clue-list'>
                {displayNames[direction]}
                {
                    clueLabels.map(({ row, column, label }) =>
                        <div key={label}
                            className={bem('clue')}>
                            {label}.
                            <input type='text'
                                className={bem('clue-input')}
                                value={(
                                    row === clueInput.row &&
                                    column === clueInput.column &&
                                    clueInput.direction === 'across' &&
                                    clueInput.value
                                ) || get(clueData, `${row}.${column}`, '')}
                                onChange={(evt) => {
                                    changeClue({
                                        value: evt.target.value, row, column, direction: 'across',
                                    });
                                }}
                                onBlur={this.props.onClueBlur}
                            />
                        </div>)
                }
            </div>
        );
    }
}

ClueList.propTypes = {
    direction: propTypes.oneOf(['across', 'down']).isRequired,
    clueLabels: propTypes.arrayOf(propTypes.object).isRequired,
    clueData: propTypes.oneOfType([propTypes.object, propTypes.array]).isRequired,
    clueInput: propTypes.object.isRequired,
    actions: propTypes.object.isRequired,
    onClueBlur: propTypes.func.isRequired,
};
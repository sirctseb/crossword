import React, { Component } from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

export default class Statistics extends Component {
    render() {
        const bem = bemNamesFactory('statistics');
        const { acrossCount, downCount } = this.props;

        return (
            <div className={bem()}>
                <div className={bem('total-count')}>
                    {acrossCount + downCount} answers
                </div>
                <div className={bem('across-count')}>
                </div>
            </div>
        );
    }
}

Statistics.propTypes = {
    acrossCount: propTypes.number.isRequired,
    downCount: propTypes.number.isRequired,
};

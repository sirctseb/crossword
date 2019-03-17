import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import { getUserCrosswords } from './selectors';
import Wait from '../Wait';
import CrosswordPreview from './CrosswordPreview';

const bem = bemNamesFactory('preview-list');

const enhance = compose(
    firebaseConnect(props => ([
        `users/${props.userId}/crosswords`,
    ])),
    connect((state, props) => ({
        crosswords: getUserCrosswords(state, props),
    })),
    Wait
);

class PreviewList extends Component {
    render() {
        const { crosswords, children } = this.props;
        return (
            <div className={bem()}>
                <div className={bem('title')}>
                    { children }
                </div>
                <div className={bem('list')}>
                    {
                        Object.keys(crosswords).map(id =>
                            <CrosswordPreview id={id} key={id}
                                {...crosswords[id]} />)
                    }
                </div>
            </div>
        );
    }
}

PreviewList.propTypes = {
    crosswords: PropTypes.object.isRequired,
};

export default enhance(PreviewList);

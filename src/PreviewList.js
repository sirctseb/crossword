import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';

import { getUserCrosswords } from './user/selectors';
import Wait from './Wait';
import CrosswordPreview from './CrosswordPreview';

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
        const { crosswords } = this.props;
        return (
            <div className='preview-list'>
                {
                    Object.keys(crosswords).map(id =>
                        <CrosswordPreview id={id} key={id}
                            {...crosswords[id]} />)
                }
            </div>
        );
    }
}

PreviewList.propTypes = {
    crosswords: PropTypes.object.isRequired,
};

export default enhance(PreviewList);

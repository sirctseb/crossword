import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';

import { getUserCrosswords } from './user/selectors';
// import CrosswordPreview from './CrosswordPreview';
const CrosswordPreview = ({ id }) => <div>{ id }</div>;

const enhance = compose(
    firebaseConnect(props => ([
        `users/${props.userId}/crosswords`,
    ])),
    connect((state, props) =>
        getUserCrosswords(state, props) ||
        {
            loading: true,
        })
);

class PreviewList extends Component {
    render() {
        return (
            <div className='preview-list'>
                {
                    Object.keys(this.props.crosswords).map(id =>
                        <CrosswordPreview id={id} key={id} />)
                }
            </div>
        );
    }
}

PreviewList.propTypes = {
    crosswords: PropTypes.object,
};

export default enhance(PreviewList);

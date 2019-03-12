import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';

import { getUserCrosswords } from './user/selectors';
import CrosswordPreview from './CrosswordPreview';

const enhance = compose(
  firebaseConnect(props => ([
    `users/${props.userId}/crosswords`,
  ])),
  connect((state, props) => ({
    crosswords: getUserCrosswords(state, props),
    loading: !getUserCrosswords(state, props),
  })),
);

class PreviewList extends Component {
  render() {
    const { loading, crosswords } = this.props;
    return (
      <div className='preview-list'>
        {
          !loading &&
                    Object.keys(crosswords).map(id =>
                      <CrosswordPreview id={id} key={id}
                        {...crosswords[id]} />)
        }
      </div>
    );
  }
}

PreviewList.propTypes = {
  crosswords: PropTypes.object,
};

export default enhance(PreviewList);

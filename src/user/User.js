import React, { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';

import * as selectors from './selectors';

import PreviewList from '../PreviewList';

const enhance = compose(
  firebaseConnect(props => ([
    `users/${props.params.userId}`,
  ])),
  connect((state, props) =>
    (selectors.getUserData(state, props) ?
      {
        ...selectors.getUserData(state, props),
        userId: props.params.userId,
      } :
      {
        loading: true,
      })),
);

class User extends Component {
  render() {
    const { loading, crosswords, userId } = this.props;
    if (loading) {
      return <div>JUST WAIT</div>;
    }
    return (
      <div>
        {
          Object.keys(crosswords).map(id => (
            <div key={id}>
              <a href={`/${id}`}>
                {crosswords[id].title || 'Untitled'}
              </a>
            </div>
          ))
        }
        <PreviewList userId={userId} />
      </div>
    );
  }
}

User.propTypes = {
  crosswords: propTypes.shape({
    title: propTypes.string,
  }),
};

export default enhance(User);

import React, { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';

import * as selectors from './selectors';

const enhance = compose(
  firebaseConnect(props => ([
    `users/${props.params.userId}`,
  ])),
  connect((state, props) =>
    selectors.getUserData(state, props) ||
        {
          loading: true,
        }),
);

class User extends Component {
  render() {
    const { loading, crosswords } = this.props;
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';
import Wait from '../Wait';

import { getUserId } from './selectors';
import PreviewList from './PreviewList';
import WordList from './WordList';

const bem = bemNamesFactory('user');

// const Section = ({ children }) => (
//     <div className={bem('section')}>
//         <div className={bem('divider')}>
//             {children}
//         </div>
//     </div>
// );

class User extends Component {
  render() {
    const { userId } = this.props;
    return (
      <div className={bem()}>
        <PreviewList userId={userId}>
                    My Crosswords
        </PreviewList>
        <WordList userId={userId} />
      </div>
    );
  }
}

User.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default connect(state => ({
  userId: getUserId(state),
}))(Wait(User));

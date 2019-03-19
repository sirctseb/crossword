import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import { getWordlist } from './selectors';
import Wait from '../Wait';

const bem = bemNamesFactory('word-list');

const emptyWordList = {};
const enhance = compose(
  firebaseConnect(({ userId }) => ([
    `/users/${userId}/wordlist`,
  ])),
  connect((state, props) => ({
    wordlist: getWordlist(state, { userId: props.userId }) || emptyWordList,
  })),
  Wait,
);

class WordList extends Component {
  state = { newValue: '' }

  handleNewValueChange = ({ target: { value } }) => this.setState({ newValue: value })
  handleNewValueAdd = () => {
    const { newValue } = this.state;
    const { userId } = this.props;
    if (newValue.length > 0) {
      this.props.firebase.ref().child(`users/${userId}/wordlist`).push({
        word: newValue,
      });
    }
    this.setState({ newValue: '' });
  }

  render() {
    return (
      <div bem={bem()}>
        <div bem={bem('list')}>
          {
            Object.values(this.props.wordlist).map(({ word }) => word)
          }
        </div>
        <div bem={bem('add')}>
          <input value={this.state.newValue}
            onChange={this.handleNewValueChange} />
          <div onClick={this.handleNewValueAdd}>
                        +
          </div>
        </div>
      </div>
    );
  }
}

WordList.propTypes = {
  wordlist: PropTypes.objectOf(PropTypes.shape({
    word: PropTypes.string.isRequired,
    usedBy: PropTypes.objectOf(PropTypes.bool),
  })).isRequired,
};

export default enhance(WordList);

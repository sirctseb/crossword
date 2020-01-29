import React, { useState } from 'react';
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
    path: `/users/${props.userId}/wordlist`,
  })),
  Wait,
);

const WordList = ({ wordlist, firebase, path }) => {
  const [newValue, setNewValue] = useState('');

  const [fbRef] = useState(firebase.ref().child(path));

  const handleNewValueChange = ({ target: { value } }) => setNewValue(value);

  const handleNewValueAdd = () => {
    if (newValue.length > 0) {
      fbRef.push({ word: newValue });
    }
    setNewValue('');
  };

  const handleDelete = key => fbRef.child(key).remove();

  return (
    <div className={bem()}>
      <div className={bem('title')}>
        Word List
      </div>
      <div className={bem('list')}>
        {
          Object.entries(wordlist).map(([key, { word }]) => (
            <div className={bem('entry')} key={key}>
              {word}
              <div className={bem('delete')}
                onClick={() => handleDelete(key)}>
                -
              </div>
            </div>
          ))
        }
      </div>
      <div className={bem('add')}>
        <input value={newValue} onChange={handleNewValueChange} />
        <div onClick={handleNewValueAdd}> + </div>
      </div>
    </div>
  );
};

WordList.propTypes = {
  wordlist: PropTypes.objectOf(PropTypes.shape({
    word: PropTypes.string.isRequired,
    usedBy: PropTypes.objectOf(PropTypes.bool),
  })).isRequired,
  firebase: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
};

export default enhance(WordList);

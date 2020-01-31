import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFirebaseConnect, useFirebase } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import { getWordlist } from './selectors';

const bem = bemNamesFactory('word-list');

const WordList = ({ userId }) => {
  const path = `/users/${userId}/wordlist`;

  const firebase = useFirebase();
  useFirebaseConnect([path], [userId]);
  const wordlist = useSelector(getWordlist);


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
  userId: PropTypes.string.isRequired,
};

export default WordList;

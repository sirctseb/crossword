import React from 'react';
import { useSelector } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import { getUserCrosswords } from './selectors';
import CrosswordPreview from './CrosswordPreview';

const bem = bemNamesFactory('preview-list');

const PreviewList = ({ userId, children }) => {
  useFirebaseConnect(`users/${userId}/crosswords`);
  const crosswords = useSelector(getUserCrosswords);

  return (
    <div className={bem()}>
      <div className={bem('title')}>{children}</div>
      <div className={bem('list')}>
        {Object.keys(crosswords).map((id) => (
          <CrosswordPreview id={id} key={id} {...crosswords[id]} />
        ))}
      </div>
    </div>
  );
};

PreviewList.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default PreviewList;

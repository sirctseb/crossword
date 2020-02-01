import React from 'react';
import { useSelector } from 'react-redux';
import { bemNamesFactory } from 'bem-names';

import { getUserId } from './selectors';
import PreviewList from './PreviewList';
import WordList from './WordList';
import UserSection from './UserSection';

const bem = bemNamesFactory('user');

const User = () => {
  const userId = useSelector(getUserId) || null;

  return userId && <div className={bem()}>
    <UserSection>
      <PreviewList userId={userId}>
        My Crosswords
      </PreviewList>
    </UserSection>
    <UserSection>
      <WordList userId={userId} />
    </UserSection>
  </div>;
};

export default User;

import React, { useState } from 'react';
import { useFirebaseConnect, isLoaded } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { bemNamesFactory } from 'bem-names';
import Editor from '../editor/Editor';

const bem = bemNamesFactory('communal-crossword');

export default () => {
  const [selectedCrossword] = useState(null);

  useFirebaseConnect('/communalCrossword');
  const { communalCrossword } = useSelector(({ firebase: { data } }) => data);
  if (!isLoaded(communalCrossword)) {
    return 'Loading...';
  }

  const { current } = communalCrossword;
  const focusedCrossword = selectedCrossword || current;
  const editing = focusedCrossword === current;

  return <div className={bem()}>
    Communal Crossword
    {
      editing &&
      <Editor id={current} showSuggestions={false} showThemeEntries={false} showClues={false} />
    }
  </div>;
};

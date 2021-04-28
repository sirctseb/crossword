import React, { useState } from 'react';
import { useFirebaseConnect, isLoaded } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { bemNamesFactory } from 'bem-names';
import Editor from '../editor/Editor';
import CrosswordPreview from '../user/CrosswordPreview';
import ArchiveList from './ArchiveList';
import CommunalEditLayout from './CommunalEditLayout';
import Extras from './Extras';

const bem = bemNamesFactory('communal-crossword');

const Selection = {
  none: 'none',
  current: 'current',
};

export default () => {
  const [selectedCrossword, setSelectedCrossword] = useState(Selection.current);

  useFirebaseConnect('/communalCrossword');
  const communalCrossword = useSelector((state) => state.firebase.data.communalCrossword);
  if (!isLoaded(communalCrossword)) {
    return 'Loading...';
  }

  const { current, archive } = communalCrossword;
  const focusedCrossword = selectedCrossword || current;
  const editing = focusedCrossword === current || focusedCrossword === Selection.current;
  // I think it would be more correct to use firebase.ordered for this,
  // but getting the archive into ordered and current into data has been hard
  const archiveList = Object.values(archive);

  return (
    <div className={bem()}>
      <h2>Communal Crossword</h2>
      {editing && (
        <CommunalEditLayout onPreviousClick={() => setSelectedCrossword(Selection.none)}>
          <CrosswordPreview id={archiveList[archiveList.length - 1]} />
          <Extras id={current}>
            <Editor id={current} showSuggestions={false} showThemeEntries={false} showClues={false} />
          </Extras>
        </CommunalEditLayout>
      )}
      {!editing && (
        <ArchiveList
          archiveList={archiveList}
          focusedCrossword={focusedCrossword}
          current={current}
          onCurrentClick={() => setSelectedCrossword(current)}
        />
      )}
    </div>
  );
};

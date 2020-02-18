import React, { useState } from 'react';
import { useFirebaseConnect, isLoaded } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { bemNamesFactory } from 'bem-names';
import Editor from '../editor/Editor';
import CrosswordPreview from '../user/CrosswordPreview';

const bem = bemNamesFactory('communal-crossword');

// TODO weak enforcement of props here
const CommunalEditLayout = ({ children }) => <div className='communal-edit-layout'>
  <div className='communal-edit-layout__previous'>
    <div className='communal-edit-layout__relative-reset'>
      <div className='communal-edit-layout__previous-actuator'>
        &lt;
      </div>
      <div className='communal-edit-layout__previews'>
        { children[0] }
      </div>
    </div>
  </div>
  <div className='communal-edit-layout__editor-container'>
    { children[1] }
  </div>
</div>;

export default () => {
  const [selectedCrossword] = useState(null);

  useFirebaseConnect('/communalCrossword');
  const communalCrossword = useSelector(state => state.firebase.data.communalCrossword);
  if (!isLoaded(communalCrossword)) {
    return 'Loading...';
  }

  const { current, archive } = communalCrossword;
  const focusedCrossword = selectedCrossword || current;
  const editing = focusedCrossword === current;
  // I think it would be more correct to use firebase.ordered for this,
  // but getting the archive into ordered and current into data has been hard
  const archiveList = Object.values(archive);

  return <div className={bem()}>
    Communal Crossword
    {
      editing && <CommunalEditLayout>
        <CrosswordPreview id={archiveList[0]} />
        <Editor id={current} showSuggestions={false} showThemeEntries={false} showClues={false} />
      </CommunalEditLayout>
    }
    {
      !editing && 'VIEW MODE!'
    }
  </div>;
};

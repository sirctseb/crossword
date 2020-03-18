import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFirebaseConnect, isLoaded } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { bemNamesFactory } from 'bem-names';
import Editor from '../editor/Editor';
import CrosswordPreview from '../user/CrosswordPreview';

const bem = bemNamesFactory('communal-crossword');

const CommunalEditLayout = ({ children, onPreviousClick }) => <div className='communal-edit-layout'>
  <div className='communal-edit-layout__previous' onClick={onPreviousClick}>
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

CommunalEditLayout.propTypes = {
  onPreviousClick: PropTypes.func.isRequired,
};


const ArchiveList = ({ archiveList, current, onCurrentClick }) => <div className='archive-list'>
  <div className='archive-list__list'>
    {
      archiveList.map(id => <CrosswordPreview id={id} />)
    }
  </div>
  <div className='archive-list__current' onClick={onCurrentClick}>
    <div className='archive-list__relative-reset'>
      <div className='archive-list__current-actuator'>
        &gt;
      </div>
      <div className='archive-list__previews'>
        <CrosswordPreview id={current} />
      </div>
    </div>
  </div>
</div>;

ArchiveList.propTypes = {
  archiveList: PropTypes.arrayOf(PropTypes.string).isRequired,
  focusedCrossword: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  onCurrentClick: PropTypes.func.isRequired,
};

const Selection = {
  none: 'none',
  current: 'current',
};

export default () => {
  const [selectedCrossword, setSelectedCrossword] = useState(Selection.current);

  useFirebaseConnect('/communalCrossword');
  const communalCrossword = useSelector(state => state.firebase.data.communalCrossword);
  if (!isLoaded(communalCrossword)) {
    return 'Loading...';
  }

  const { current, archive } = communalCrossword;
  const focusedCrossword = selectedCrossword || current;
  const editing = focusedCrossword === current || focusedCrossword === Selection.current;
  // I think it would be more correct to use firebase.ordered for this,
  // but getting the archive into ordered and current into data has been hard
  const archiveList = Object.values(archive);

  return <div className={bem()}>
    Communal Crossword
    {
      editing && <CommunalEditLayout onPreviousClick={() => setSelectedCrossword(Selection.none)}>
        <CrosswordPreview id={archiveList[0]} />
        <Editor id={current} showSuggestions={false} showThemeEntries={false} showClues={false} />
      </CommunalEditLayout>
    }
    {
      !editing && <ArchiveList archiveList={archiveList} focusedCrossword={focusedCrossword}
        current={current} onCurrentClick={() => setSelectedCrossword(current)} />
    }
  </div>;
};

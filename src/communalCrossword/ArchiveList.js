import React from 'react';
import PropTypes from 'prop-types';
import CrosswordPreview from '../user/CrosswordPreview';

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

export default ArchiveList;

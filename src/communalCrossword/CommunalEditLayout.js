import React from 'react';
import PropTypes from 'prop-types';

const CommunalEditLayout = ({ children, onPreviousClick }) => (
  <div className="communal-edit-layout">
    <div className="communal-edit-layout__previous" onClick={onPreviousClick}>
      <div className="communal-edit-layout__relative-reset">
        <div className="communal-edit-layout__previous-actuator">&lt;</div>
        <div className="communal-edit-layout__previews">{children[0]}</div>
      </div>
    </div>
    <div className="communal-edit-layout__editor-container">{children[1]}</div>
  </div>
);

CommunalEditLayout.propTypes = {
  onPreviousClick: PropTypes.func.isRequired,
};

export default CommunalEditLayout;

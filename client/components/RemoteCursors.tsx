import React from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

const bem = bemNamesFactory('remote-cursors');

const RemoteCursors = ({ cursors }) =>
  cursors && (
    <div className={bem()}>
      {cursors.map(({ color, displayName, photoUrl }) => (
        <div className={bem('cursor')} style={{ backgroundColor: `#${color}` }}>
          <div className={bem('cursor-details')}>
            <div className={bem('cursor-name')}>{displayName}</div>
            <img src={photoUrl} />
          </div>
        </div>
      ))}
    </div>
  );

RemoteCursors.propTypes = {
  cursors: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string,
      PhotoUrl: PropTypes.string,
      color: PropTypes.string,
    })
  ),
};

export default RemoteCursors;

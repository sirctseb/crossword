import React from 'react';
import { bemNamesFactory } from 'bem-names';

const bem = bemNamesFactory('remote-cursors');

interface Cursor {
  displayName: string;
  photoUrl: string;
  color: string;
}

interface RemoteCursorsProps {
  cursors?: Cursor[];
}

const RemoteCursors: React.FC<RemoteCursorsProps> = ({ cursors = null }) =>
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

export default RemoteCursors;

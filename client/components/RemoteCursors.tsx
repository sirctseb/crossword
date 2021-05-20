import React from 'react';

interface Cursor {
  displayName: string;
  photoUrl: string;
  color: string;
}

interface RemoteCursorsProps {
  cursors?: Cursor[];
}

import styles from './RemoteCursors.module.scss';

const RemoteCursors: React.FC<RemoteCursorsProps> = ({ cursors = null }) =>
  cursors && (
    <div className={styles.remoteCursors}>
      {cursors.map(({ color, displayName, photoUrl }) => (
        <div className={styles.cursor} style={{ backgroundColor: `#${color}` }}>
          <div className={styles.details}>
            <div>{displayName}</div>
            <img src={photoUrl} />
          </div>
        </div>
      ))}
    </div>
  );

export default RemoteCursors;
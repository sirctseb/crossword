import React from 'react';

interface Cursor {
  id: string;
  displayName?: string;
  photoUrl?: string;
  color?: string;
}

interface RemoteCursorsProps {
  cursors?: Cursor[];
}

import styles from './RemoteCursors.module.scss';

const RemoteCursors: React.FC<RemoteCursorsProps> = ({ cursors = null }) =>
  cursors && (
    <div className={styles.remoteCursors}>
      {cursors.map(({ id, color, displayName, photoUrl }) => (
        <div key={id} className={styles.cursor} style={{ backgroundColor: `#${color}` }}>
          <div className={styles.details}>
            <div>{displayName || 'Unknown puzzler'}</div>
            {photoUrl && <img src={photoUrl} />}
          </div>
        </div>
      ))}
    </div>
  );

export default RemoteCursors;

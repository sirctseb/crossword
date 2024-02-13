import React from 'react';
import bem from 'bem-names';

export default ({ children }) => (
    <div className={bem('user-section')}>
        {children}
    </div>
);


import React from 'react';
import { Route } from 'react-router';

import App from './App';
import Editor from './editor/Editor';

export default (
    <Route path='/' component={App}>
        <Route path=':crosswordId' component={Editor} />
    </Route>
);

import React from 'react';
import { Route } from 'react-router';

import App from './App';
import Editor from './editor/Editor';
import User from './user/User';

export default (
    <Route path='/' component={App}>
        <Route path='/user' component={User} />
        <Route path=':crosswordId' component={Editor} />
    </Route>
);

import React from 'react';
import { IndexRoute, Route } from 'react-router';

import App from './App';
import Editor from './editor/Editor';

export default (
  <Route path='/' component={App}>
    <IndexRoute component={Editor} />
  </Route>
);

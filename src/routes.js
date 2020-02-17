import React from 'react';
import { Route, Switch } from 'react-router-dom';

import App from './App';
import CommunalCrossword from './communalCrossword';
import Editor from './editor/Editor';
import User from './user/User';

export default (
  <Route>
    <App>
      <Switch>
        <Route path='/user'>
          <User />
        </Route>
        <Route path='/:crosswordId'>
          {
            ({ match: { params: { crosswordId } } }) => <Editor id={crosswordId} />
          }
        </Route>
        <Route path='/' exact>
          <CommunalCrossword />
        </Route>
      </Switch>
    </App>
  </Route>
);

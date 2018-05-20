import React from 'react';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { reactReduxFirebase, firebaseStateReducer } from 'react-redux-firebase';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import firebase from 'firebase';

import routes from './routes';
import editorReducer from './editor/reducer';

import './styles/main.scss';

const firebaseConfig = {
  apiKey: 'AIzaSyCKj_BRXYrNVGLbTlYtq517O7hxpPnZBZ8',
  authDomain: 'crossword-dev.firebaseapp.com',
  databaseURL: 'https://crossword-dev.firebaseio.com',
  projectId: 'crossword-dev',
  storageBucket: 'crossword-dev.appspot.com',
  messagingSenderId: '960799145845',
};

firebase.initializeApp(firebaseConfig);

// eslint-disable-next-line
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    firebase: firebaseStateReducer,
    routing: routerReducer,
    editor: editorReducer,
  }),
  composeEnhancers(
    applyMiddleware(createLogger(), thunk),
    reactReduxFirebase(firebase),
  ),
);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>,
  document.getElementById('react-root'),
);

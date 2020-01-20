import React from 'react';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { firebaseReducer, ReactReduxFirebaseProvider } from 'react-redux-firebase';
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
    firebase: firebaseReducer,
    routing: routerReducer,
    editor: editorReducer,
  }),
  composeEnhancers(applyMiddleware(createLogger(), thunk)),
);

const history = syncHistoryWithStore(browserHistory, store);

const rrfProps = {
  firebase,
  dispatch: store.dispatch,
  config: {},
};

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <Router history={history}>
        {routes}
      </Router>
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById('react-root'),
);

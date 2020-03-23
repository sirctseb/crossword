import React from 'react';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { firebaseReducer, ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { BrowserRouter as Router } from 'react-router-dom';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { configure } from 'react-hotkeys';
import suggestionsReducer from './suggestions/reducer';
import firebase from './firebaseApp';

import routes from './routes';

import './styles/main.scss';

configure({
  allowCombinationSubmatches: true,
});

// eslint-disable-next-line
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    firebase: firebaseReducer,
    suggestions: suggestionsReducer,
  }),
  composeEnhancers(applyMiddleware(createLogger(), thunk)),
);

const rrfProps = {
  firebase,
  dispatch: store.dispatch,
  config: {},
};

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <Router>
        {routes}
      </Router>
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById('react-root'),
);

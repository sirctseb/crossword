import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { useHistory, Link } from 'react-router-dom';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';

import { getAuth } from './selectors';
import firebaseAuthConfig from '../config/firebaseAuth';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const history = useHistory();
  const firebase = useFirebase();
  const auth = useSelector(getAuth);

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleHideLogin = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  const handleNew = () => {
    const fbRef = firebase.ref();
    const cwRef = fbRef.push();
    fbRef
      .update({
        [`crosswords/${cwRef.key}`]: { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${auth.uid}/crosswords/${cwRef.key}`]: {
          title: 'Untitled',
        },
        [`permissions/${cwRef.key}`]: { owner: auth.uid },
      })
      .then(() => history.push(`/${cwRef.key}`));
  };

  return (
    <header className="header">
      <h1 className="header__heading">Crossword</h1>
      <nav className="header__nav">
        {auth.isEmpty && !showLogin && (
          <a className="header__nav-link" onClick={handleShowLogin}>
            login
          </a>
        )}
        {!auth.isEmpty && (
          <a className="header__nav-link" onClick={handleLogout}>
            logout
          </a>
        )}
        {!auth.isEmpty && (
          <a className="header__nav-link" onClick={handleNew}>
            new
          </a>
        )}
        {!auth.isEmpty && (
          <Link className="header__nav-link" to={'/user'}>
            user
          </Link>
        )}
      </nav>
      {showLogin && (
        <div className="header__login-controls">
          <FirebaseAuth uiConfig={firebaseAuthConfig} firebaseAuth={firebase.auth()} />
          <a className="header__hide-login-button" onClick={handleHideLogin}>
            hide
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;

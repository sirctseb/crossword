import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Link from 'next/link';
import firebase from '../firebase/app';
import { firebaseAuth } from '../firebase/auth';
import FirebaseAuth from '../firebase/FirebaseAuth';

import firebaseAuthConfig from '../firebase/authConfig';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const auth = useRecoilValue(firebaseAuth);
  const { push } = useRouter();

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
    const fbRef = firebase.database().ref();
    const cwRef = fbRef.push();
    if (!auth.isEmpty && auth.isLoaded) {
      fbRef
        .update({
          [`crosswords/${cwRef.key}`]: { rows: 15, symmetric: true, title: 'untitled' },
          [`users/${auth.uid}/crosswords/${cwRef.key}`]: {
            title: 'Untitled',
          },
          [`permissions/${cwRef.key}`]: { owner: auth.uid },
        })
        .then(() => push(`/${cwRef.key}`));
    }
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
          // <a className="header__nav-link" onClick={handleNew}>
          <a className="header__nav-link">new</a>
        )}
        {!auth.isEmpty && (
          <Link href={'/user'}>
            <a className="header__nav-link">user</a>
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

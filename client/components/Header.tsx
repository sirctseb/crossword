import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Link from 'next/link';
import firebase from '../firebase/app';
import { firebaseAuth } from '../firebase/auth';
import FirebaseAuth from '../firebase/FirebaseAuth';

import firebaseAuthConfig from '../firebase/authConfig';

import styles from './Header.module.scss';

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
    <header className={styles.header}>
      <h1>Crossword</h1>
      <nav className={styles.nav}>
        {auth.isEmpty && !showLogin && (
          <a className={styles.navLink} onClick={handleShowLogin}>
            login
          </a>
        )}
        {!auth.isEmpty && (
          <a className={styles.navLink} onClick={handleLogout}>
            logout
          </a>
        )}
        {!auth.isEmpty && (
          // <a className={styles.navLink} onClick={handleNew}>
          <a className={styles.navLink}>new</a>
        )}
        {!auth.isEmpty && (
          <Link href={'/user'}>
            <a className={styles.navLink}>user</a>
          </Link>
        )}
      </nav>
      {showLogin && (
        <div>
          <FirebaseAuth uiConfig={firebaseAuthConfig} firebaseAuth={firebase.auth()} />
          <a onClick={handleHideLogin}>hide</a>
        </div>
      )}
    </header>
  );
};

export default Header;

"use client";

import React, { useCallback, useState } from "react";
import { push, ref, update } from "firebase/database";
import { useRecoilValue } from "recoil";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FirebaseAuth } from "../FirebaseAuth";
import { getFirebaseAuth, getFirebaseDatabase } from "../../firebase";
import { authAtom } from "../../firebase-recoil/atoms";

import "./header.scss";

interface HeaderProps {
  onLogout: () => void;
  onCreateNew: () => void;
  loggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  onCreateNew,
  loggedIn,
}) => {
  const [showLogin, setShowLogin] = useState(false);

  const handleShowLogin = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      setShowLogin(true);
    },
    [setShowLogin]
  );

  const handleHideLogin = useCallback(() => {
    setShowLogin(false);
  }, [setShowLogin]);

  const handleLogout = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      onLogout();
    },
    [onLogout]
  );

  const handleNew = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      onCreateNew();
    },
    [onCreateNew]
  );

  return (
    <header className="header">
      <h1 className="header__heading">Crossword</h1>
      <nav className="header__nav">
        {!loggedIn && !showLogin && (
          <a
            className="header__nav-link"
            href="/login"
            onClick={handleShowLogin}
          >
            login
          </a>
        )}
        {loggedIn && (
          <>
            <a
              className="header__nav-link"
              href="/logout"
              onClick={handleLogout}
            >
              logout
            </a>
            <a className="header__nav-link" href="/new" onClick={handleNew}>
              new
            </a>
            <Link className="header__nav-link" href="/user">
              user
            </Link>
          </>
        )}
      </nav>
      {showLogin && (
        <div className="header__login-controls">
          <FirebaseAuth />
          <a className="header__hide-login-button" onClick={handleHideLogin}>
            hide
          </a>
        </div>
      )}
    </header>
  );
};

export const ConnectedHeader = () => {
  const auth = getFirebaseAuth();
  const { isEmpty } = useRecoilValue(authAtom);
  const { push: pushRoute } = useRouter();

  const loggedIn = !isEmpty;

  const handleLogout = useCallback(() => {
    auth.signOut();
  }, [auth]);

  const handleCreateNew = useCallback(() => {
    const pushed = push(ref(getFirebaseDatabase()));
    update(ref(getFirebaseDatabase()), {
      [`crosswords/${pushed.key}`]: {
        rows: 15,
        symmetric: true,
        title: "untitled",
      },
      [`users/${auth.currentUser?.uid}/crosswords/${pushed.key}`]: {
        title: "Untitled",
      },
      [`permissions/${pushed.key}`]: { owner: auth.currentUser?.uid },
    }).then(() => {
      pushRoute(`/${pushed.key}`);
    });
  }, [auth.currentUser?.uid, pushRoute]);

  return (
    <Header
      loggedIn={loggedIn}
      onLogout={handleLogout}
      onCreateNew={handleCreateNew}
    />
  );
};

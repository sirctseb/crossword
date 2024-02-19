import React, { useCallback, useState } from "react";
import { FirebaseAuth } from "../FirebaseAuth";
import { useRecoilValue } from "recoil";
import { makeAuthAtom } from "../../firebase-recoil/auth";
import { getFirebaseApp, getFirebaseAuth } from "../../firebase";

import "./header.scss";

interface HeaderProps {
  onLogout: () => void;
  onCreateNew: () => Promise<void>;
  loggedIn: boolean;
}

export const HeaderPresentation: React.FC<HeaderProps> = ({
  onLogout,
  onCreateNew,
  loggedIn,
}) => {
  const [showLogin, setShowLogin] = useState(false);

  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
  }, []);

  const handleHideLogin = useCallback(() => {
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    onLogout();
  }, []);

  const handleNew = useCallback(() => {
    onCreateNew();
    // const fbRef = this.props.firebase.ref();
    // const cwRef = fbRef.push();
    // const {
    //   auth: { uid },
    // } = this.props;
    // fbRef
    //   .update({
    //     [`crosswords/${cwRef.key}`]: {
    //       rows: 15,
    //       symmetric: true,
    //       title: "untitled",
    //     },
    //     [`users/${uid}/crosswords/${cwRef.key}`]: {
    //       title: "Untitled",
    //     },
    //     [`permissions/${cwRef.key}`]: { owner: uid },
    //   })
    //   .then(() => this.props.router.push(`/${cwRef.key}`));
  }, []);

  return (
    <header className="header">
      <h1 className="header__heading">Crossword</h1>
      <nav className="header__nav">
        {!loggedIn && !showLogin && (
          <a className="header__nav-link" onClick={handleShowLogin}>
            login
          </a>
        )}
        {loggedIn && (
          <>
            <a className="header__nav-link" onClick={handleLogout}>
              logout
            </a>
            <a className="header__nav-link" onClick={handleNew}>
              new
            </a>
            <a className="header__nav-link" href={"/user"}>
              user
            </a>
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

const app = getFirebaseApp();
const authAtom = makeAuthAtom(app);

export const Header = () => {
  const auth = getFirebaseAuth();
  const { isEmpty } = useRecoilValue(authAtom);
  const loggedIn = !isEmpty;

  const handleLogout = useCallback(() => {
    auth.signOut();
  }, [auth]);

  return (
    <HeaderPresentation
      loggedIn={loggedIn}
      onLogout={handleLogout}
      onCreateNew={async () => await Promise.resolve()}
    />
  );
};

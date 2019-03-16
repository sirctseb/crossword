import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withFirebase } from 'react-redux-firebase';
import { withRouter } from 'react-router';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';

import firebaseAuthConfig from '../config/firebaseAuth';

class Header extends Component {
    state = {
        showLogin: false,
    }

    handleShowLogin = () => {
        this.setState({ showLogin: true });
    }
    handleHideLogin = () => {
        this.setState({ showLogin: false });
    }
    handleLogout = () => {
        this.props.firebase.auth().signOut();
    }
    handleNew = () => {
        const fbRef = this.props.firebase.ref();
        const cwRef = fbRef.push();
        const { auth: { uid } } = this.props;
        fbRef.update({
            [`crosswords/${cwRef.key}`]: { rows: 15, symmetric: true, title: 'untitled' },
            [`users/${uid}/crosswords/${cwRef.key}`]: {
                title: 'Untitled',
            },
            [`permissions/${cwRef.key}`]: { owner: uid },
        }).then(() => this.props.router.push(`/${cwRef.key}`));
    }

    render() {
        const { auth, firebase } = this.props;
        return (
            <header className='header'>
                <h1 className='header__heading'>
                    Crossword
                </h1>
                <nav className='header__nav'>
                    {
                        (auth.isEmpty && !this.state.showLogin) &&
                            <a className='header__nav-link'
                                onClick={this.handleShowLogin}>
                                login
                            </a>
                    }
                    {
                        !auth.isEmpty &&
                            <a className='header__nav-link'
                                onClick={this.handleLogout}>
                                logout
                            </a>
                    }
                    {
                        !auth.isEmpty &&
                            <a className='header__nav-link'
                                onClick={this.handleNew}>
                                new
                            </a>
                    }
                    {
                        !auth.isEmpty &&
                            <a className='header__nav-link'
                                href={'/user'}>
                                user
                            </a>
                    }
                </nav>
                {
                    this.state.showLogin &&
                    <div className='header__login-controls'>
                        <FirebaseAuth uiConfig={firebaseAuthConfig}
                            firebaseAuth={firebase.auth()} />
                        <a className='header__hide-login-button'
                            onClick={this.handleHideLogin}>
                            hide
                        </a>
                    </div>
                }
            </header>
        );
    }
}

Header.propTypes = {
    auth: PropTypes.object.isRequired,
    firebase: PropTypes.object.isRequired,
};

export default compose(
    withFirebase,
    withRouter,
    connect(({ firebase: { auth } }) => ({ auth })),
)(Header);

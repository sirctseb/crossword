import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withFirebase } from 'react-redux-firebase';
import { withRouter } from 'react-router';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';

import firebaseAuthConfig from '../config/firebaseAuth';

import CrosswordModel from './model/Crossword';

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
    fbRef.update({
      [`crosswords/${cwRef.key}`]: CrosswordModel.newCrossword(),
      [`users/${this.props.auth.uid}/crosswords/${cwRef.key}`]: {
        title: 'Untitled',
      },
    });
    this.props.router.push(`/${cwRef.key}`);
  }

  render() {
    const { auth, firebase } = this.props;
    return (
      <div className='header'>
        <h1 className='header__heading'>
                    Crossword
        </h1>
        <div className='header__controls'>
          {
            (auth.isEmpty && !this.state.showLogin) &&
                            <a className='header__show-login-button'
                              onClick={this.handleShowLogin}>
                                login
                            </a>
          }
          {
            !auth.isEmpty &&
                            <a className='header__logout-button'
                              onClick={this.handleLogout}>
                                logout
                            </a>
          }
          {
            !auth.isEmpty &&
                            <a className='header__new-button'
                              onClick={this.handleNew}>
                                new
                            </a>
          }
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
        </div>
      </div>
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

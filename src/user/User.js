import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';
import Wait from '../Wait';

import { getUserId } from './selectors';
import PreviewList from './PreviewList';
import WordList from './WordList';
import UserSection from './UserSection';

const bem = bemNamesFactory('user');

class User extends Component {
    render() {
        const { userId } = this.props;
        return (
            <div className={bem()}>
                <UserSection>
                    <PreviewList userId={userId}>
                        My Crosswords
                    </PreviewList>
                </UserSection>
                <UserSection>
                    <WordList userId={userId} />
                </UserSection>
            </div>
        );
    }
}

User.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default connect(state => ({
    userId: getUserId(state),
}))(Wait(User));

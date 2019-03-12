import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import PreviewList from '../PreviewList';

const bem = bemNamesFactory('user');

class User extends Component {
    render() {
        const { userId } = this.props.params;
        return (
            <div className={bem()}>
                <PreviewList userId={userId} />
            </div>
        );
    }
}

User.propTypes = {
    params: PropTypes.shape({
        userId: PropTypes.string.isRequired,
    }).isRequired,
};

export default User;

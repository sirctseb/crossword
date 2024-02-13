import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import { getWordlist } from './selectors';
import Wait from '../Wait';

const bem = bemNamesFactory('word-list');

const emptyWordList = {};
const enhance = compose(
    firebaseConnect(({ userId }) => ([
        `/users/${userId}/wordlist`,
    ])),
    connect((state, props) => ({
        wordlist: getWordlist(state, { userId: props.userId }) || emptyWordList,
        path: `/users/${props.userId}/wordlist`,
    })),
    Wait,
);

class WordList extends Component {
    state = { newValue: '' }

    componentDidMount() {
        this.fbRef = this.props.firebase.ref().child(this.props.path);
    }

    handleNewValueChange = ({ target: { value } }) => this.setState({ newValue: value })
    handleNewValueAdd = () => {
        const { newValue } = this.state;
        if (newValue.length > 0) {
            this.fbRef.push({
                word: newValue,
            });
        }
        this.setState({ newValue: '' });
    }
    handleDelete = key => this.fbRef.child(key).remove()

    render() {
        return (
            <div className={bem()}>
                <div className={bem('title')}>
                    Word List
                </div>
                <div className={bem('list')}>
                    {
                        Object.entries(this.props.wordlist).map(([key, { word }]) => (
                            <div className={bem('entry')} key={key}>
                                {word}
                                <div className={bem('delete')}
                                    onClick={() => this.handleDelete(key)}>
                                    -
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className={bem('add')}>
                    <input value={this.state.newValue}
                        onChange={this.handleNewValueChange} />
                    <div onClick={this.handleNewValueAdd}>
                        +
                    </div>
                </div>
            </div>
        );
    }
}

WordList.propTypes = {
    wordlist: PropTypes.objectOf(PropTypes.shape({
        word: PropTypes.string.isRequired,
        usedBy: PropTypes.objectOf(PropTypes.bool),
    })).isRequired,
};

export default enhance(WordList);

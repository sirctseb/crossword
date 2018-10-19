import React, { Component } from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

import UndoHistory from '../undo/UndoHistory';
import FirebaseChange from '../undo/FirebaseChange';

class BoxControls extends Component {
    render() {
        const bem = bemNamesFactory('box-controls');
        const { boxRef, box: { blocked, circled, shaded } } = this.props;
        const undoHistory = UndoHistory.getHistory('crossword');

        return (
            <div className='box-controls'>
                <div className={bem('block', { blocked })}
                    onMouseDown={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                    }}
                    onClick={this.props.onBlock} />
                {
                    !blocked && <div className={bem('circle', { circled })}
                        onMouseDown={(evt) => {
                            evt.preventDefault();
                            evt.stopPropagation();
                        }}
                        onClick={(evt) => {
                            undoHistory.add(FirebaseChange.FromValues(
                                boxRef.child('circled'),
                                !circled,
                                circled,
                            ));
                            evt.stopPropagation();
                        }}/>
                }
                {
                    !blocked && <div className={bem('shade', { shaded })}
                        onMouseDown={(evt) => {
                            evt.preventDefault();
                            evt.stopPropagation();
                        }}
                        onClick={(evt) => {
                            undoHistory.add(FirebaseChange.FromValues(
                                boxRef.child('shaded'),
                                !shaded,
                                shaded,
                            ));
                            evt.stopPropagation();
                        }}/>
                }
            </div>
        );
    }
}

BoxControls.propTypes = {
    boxRef: propTypes.object.isRequired,
    box: propTypes.object.isRequired,
    onBlock: propTypes.func.isRequired,
};

export default BoxControls;

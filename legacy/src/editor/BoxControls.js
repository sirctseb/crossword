import React, { Component } from 'react';
import propTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

class BoxControls extends Component {
    killEvent = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
    }

    handleToggleCircle = (evt) => {
        this.props.onToggleAttribute('circled');
        evt.stopPropagation();
    }

    handleToggleShade = (evt) => {
        this.props.onToggleAttribute('shaded');
        evt.stopPropagation();
    }

    render() {
        const bem = bemNamesFactory('box-controls');
        const {
            box: {
                blocked, circled, shaded,
            },
        } = this.props;

        return (
            <div className='box-controls'>
                <div className={bem('block', { blocked })}
                    onMouseDown={this.killEvent}
                    onClick={this.props.onBlock} />
                {
                    !blocked && <div className={bem('circle', { circled })}
                        onMouseDown={this.killEvent}
                        onClick={this.handleToggleCircle}/>
                }
                {
                    !blocked && <div className={bem('shade', { shaded })}
                        onMouseDown={this.killEvent}
                        onClick={this.handleToggleShade}/>
                }
            </div>
        );
    }
}

BoxControls.propTypes = {
    box: propTypes.object.isRequired,
    onBlock: propTypes.func.isRequired,
    onToggleAttribute: propTypes.func.isRequired,
};

export default BoxControls;

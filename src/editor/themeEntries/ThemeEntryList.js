import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bemFactory } from 'bem-names';

class ThemeEntryList extends Component {
    render() {
        const bem = bemFactory('theme-entry-list');
        const { entries, onDelete } = this.props;
        return (
            <div className={bem()}>
                {
                    entries.map(({ text, used }) =>
                        <div className={bem('entry')}>
                            <div className={bem('text', { used })}>{ text }</div>
                            <div className={bem('delete')}
                                onClick={() => onDelete(text)}>x</div>
                        </div>)
                }
            </div>
        );
    }
}

ThemeEntryList.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.shapeOf({
        text: PropTypes.string.isRequired,
        used: PropTypes.boolean.isRequired,
    })),
    onDelete: PropTypes.func.isRequired,
};

export default ThemeEntryList;

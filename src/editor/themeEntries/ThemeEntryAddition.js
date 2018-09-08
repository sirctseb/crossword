import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bemNamesFactory } from 'bem-names';

class ThemeEntryAddition extends Component {
  constructor(props) {
    super(props);
    this.state = { input: '' };
  }
  render() {
    const bem = bemNamesFactory('theme-entry-addition');
    return (
      <div className={bem()}>
        <input className={bem('input')}
          value={this.state.input}
          onChange={evt => this.setState({ input: evt.target.value })}/>
        <div className={bem('add')}
          onClick={() => {
            this.props.onAdd(this.state.input);
            this.setState({ input: '' });
          }}>
                +
        </div>
      </div>
    );
  }
}

ThemeEntryAddition.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default ThemeEntryAddition;

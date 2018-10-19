import React, { Component } from 'react';
import PropTypes from 'prop-types';
import enhanceWithClickOutside from 'react-click-outside';

class RebusInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.content,
    };
  }

  handleClickOutside() {
    this.props.onClose(this.state.value);
  }

  componentDidMount() {
    this.inputElement.focus();
  }

  render() {
    return (
      <div className='rebus-input'>
        <input className='rebus-input__input'
          ref={(ref) => { this.inputElement = ref; }}
          value={this.state.value || ''}
          onChange={evt => this.setState({ value: evt.target.value })}/>
      </div>
    );
  }
}

RebusInput.propTypes = {
  onClose: PropTypes.func.isRequired,
  content: PropTypes.string,
};

export default enhanceWithClickOutside(RebusInput);

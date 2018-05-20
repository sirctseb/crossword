import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';

const enhance = compose(
  firebaseConnect([
    'crossword',
  ]),
  connect(({ firebase: { data: { crossword } } }) => ({
    crossword,
  })),
);

class Editor extends Component {
  render() {
    if (!this.props.crossword) {
      return 'WAIT!';
    }
    const rows = [];
    for (let i = 0; i < this.props.crossword.rows; i += 1) {
      const boxes = [];
      for (let j = 0; j < this.props.crossword.rows; j += 1) {
        boxes.push((
          <div className='editor__box'
            key={`box-${i}-${j}`}>
          </div>
        ));
      }
      rows.push((
        <div className='editor__row'
          key={`row-${i}`}>
          {boxes}
        </div>
      ));
    }
    return (
      <div className='editor'>
        <input type='number'
          className='editor__input'
          value={this.props.crossword.rows}
          onChange={evt => this.props.firebase.set('crossword/rows', evt.target.value)} />
        {rows}
      </div>
    );
  }
}

export default enhance(Editor);

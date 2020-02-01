import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';
import { bemNamesFactory } from 'bem-names';
import { get } from 'lodash';

import { makeGetCrossword } from '../editor/selectors';

const bem = bemNamesFactory('crossword-preview');

const drawBoxes = ({ rows, boxes }) => {
  const rowElements = [];
  for (let row = 0; row < rows; row += 1) {
    const boxElements = [];
    for (let column = 0; column < rows; column += 1) {
      boxElements.push(<div key={`box-${row}-${column}`}
        className={bem('box', {
          blocked: get(boxes, [row, column, 'blocked']),
        })}>{get(boxes, [row, column, 'content'])}</div>);
    }
    rowElements.push(<div key={`row-${row}`} className={bem('row')}>{boxElements}</div>);
  }
  return rowElements;
};

const CrosswordPreview = ({ id, title }) => {
  useFirebaseConnect(`/crosswords/${id}`);
  // TODO wouldn't this be functionally equivalent to
  // const getCrossword = useState(makeGetCrossword());
  const getCrossword = useMemo(makeGetCrossword, []);
  // TODO wait what? Couldn't we curry the id when we make the selector?
  const crossword = useSelector(state => getCrossword(state, { crosswordId: id }));

  return <div className={bem()}>
    {
      crossword &&
      <div className={bem('grid', [`size-${crossword.rows}`])}>
        {drawBoxes(crossword)}
      </div>
    }
    <a href={`/${id}`}>
      { title }
    </a>
  </div>;
};

CrosswordPreview.defaultProps = {
  title: 'Untitled',
};

CrosswordPreview.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default CrosswordPreview;

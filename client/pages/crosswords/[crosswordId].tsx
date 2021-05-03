import React from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { Crosswords } from '../../firebase-recoil/data';

const paramValue = (value: string | string[] | undefined): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  throw new Error('Invalid query parameter value');
};

const CrosswordPage: React.FC = () => {
  const { query, isReady } = useRouter();

  if (!isReady) {
    return <>Skeleton view</>;
  }

  const crosswordId = paramValue(query.crosswordId);

  return <CrosswordContainer crosswordId={crosswordId} />;
};

interface CrosswordContainerProps {
  crosswordId: string;
}

const CrosswordContainer: React.FC<CrosswordContainerProps> = ({ crosswordId }) => {
  const crossword = useRecoilValue(Crosswords({ crosswordId }));
  return <pre>{JSON.stringify(crossword, undefined, 2)}</pre>;
};

export default CrosswordPage;

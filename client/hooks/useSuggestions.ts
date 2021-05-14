import { Direction } from '../firebase-recoil/data';

const useSuggestions = (acrossPattern: string, downPattern: string): Record<Direction, string[]> => {
  // TODO download and cache suggestions by pattern
  return {
    across: [],
    down: [],
  };
};

export default useSuggestions;

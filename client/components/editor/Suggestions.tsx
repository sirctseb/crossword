import React from 'react';
import { Direction } from '../../firebase-recoil/data';

import useSuggestions from '../../hooks/useSuggestions';

const renderSuggestions = (suggestions: string[]) =>
  suggestions.length > 0 ? (
    suggestions.map((suggestion) => (
      <div className={styles.suggestion} key={suggestion}>
        {suggestion}
      </div>
    ))
  ) : (
    <div className={styles.noSuggestions}>no matches</div>
  );

interface SuggestionsProps {
  theme: Record<Direction, string[]>;
  global: Record<Direction, string[]>;
}

import styles from './Suggestions.module.scss';

const Suggestions: React.FC<SuggestionsProps> = ({ theme, global }) => {
  const across = [...theme[Direction.across], ...global[Direction.across]];
  const down = [...theme[Direction.down], ...global[Direction.down]];

  return (
    <div className={styles.suggestions}>
      <div className={styles.list}>
        Across
        <div>{renderSuggestions(across)}</div>
      </div>
      <div className={styles.list}>
        Down
        <div>{renderSuggestions(down)}</div>
      </div>
    </div>
  );
};

interface SuggestionsContainerProps {
  theme: Record<Direction, string[]>;
  acrossPattern: string;
  downPattern: string;
}

const SuggestionsContainer: React.FC<SuggestionsContainerProps> = ({ theme, acrossPattern, downPattern }) => {
  const global = useSuggestions(acrossPattern, downPattern);
  return <Suggestions theme={theme} global={global} />;
};

export default SuggestionsContainer;

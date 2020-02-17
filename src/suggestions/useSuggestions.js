import { useSelector } from 'react-redux';

const getSuggestions = state => state.suggestions;

export default (acrossPattern, downPattern) => {
  const suggestions = useSelector(getSuggestions);
  return {
    across: suggestions[acrossPattern] || [],
    down: suggestions[downPattern] || [],
  };
};

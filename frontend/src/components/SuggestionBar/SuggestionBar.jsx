import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faFootballBall, faCloudSun, faMusic, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const suggestions = [
  { text: 'into a cat doing podcast', icon: faMicrophone },
  { text: 'What\'s happening in football this week?', icon: faFootballBall },
  { text: 'Weather around me', icon: faCloudSun },
  { text: 'Latest Top 10 Trending Songs worldwide?', icon: faMusic },
  { text: 'Best places to visit in 2025 for peace of mind', icon: faMapMarkerAlt },
];

const SuggestionsBar = ({ onSuggest }) => {
  return (
    <div className="suggestions-bar">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="suggestion-pill"
          onClick={() => onSuggest(suggestion.text)}
        >
          <FontAwesomeIcon icon={suggestion.icon} className="icon" />
          <span>{suggestion.text}</span>
        </div>
      ))}
    </div>
  );
};

export default SuggestionsBar;


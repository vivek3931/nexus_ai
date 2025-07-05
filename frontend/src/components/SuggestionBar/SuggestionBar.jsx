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
    // Main container for suggestions, centered with responsive grid layout
    // Corresponds to .suggestions-bar
    <div className="flex flex-wrap justify-center gap-4 mt-[30px] w-full max-w-[700px] mx-auto px-4">
      {suggestions.map((suggestion, index) => (
        // Individual suggestion item with enhanced styling
        // Corresponds to .suggestion-pill
        <div
          key={index}
          className="flex items-center gap-2.5 rounded-[25px] py-3 px-5 text-[var(--text-light)] text-[15px] font-normal
                     cursor-pointer bg-[var(--glass-background)] border border-[var(--glass-border)]
                     backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)]
                     transition-all duration-[var(--transition-slow)]
                     hover:bg-[var(--glass-hover-bg)] hover:border-[rgba(108,92,231,0.3)]
                     hover:-translate-y-px hover:shadow-[0_12px_40px_var(--glass-shadow),inset_0_1px_0_rgba(255,255,255,0.15)]"
          onClick={() => onSuggest(suggestion.text)}
          role="button"
          tabIndex={0}
          aria-label={`Suggest: ${suggestion.text}`}
        >
          {/* Icon styling - Corresponds to .suggestion-pill .icon */}
          <FontAwesomeIcon
            icon={suggestion.icon}
            className="text-[16px] text-[var(--text-muted)] transition-colors duration-[var(--transition-base)]
                       group-hover:text-[var(--primary-accent)]"
          />
          {/* Text styling */}
          <span className="text-sm font-medium text-[var(--text-light)]">{suggestion.text}</span>
        </div>
      ))}
    </div>
  );
};

export default SuggestionsBar;
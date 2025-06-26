// ai-layout-project/frontend/src/components/SearchBar/SearchBar.jsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Add searchTerm prop to receive value from parent (App.jsx)
const SearchBar = ({ onSearch, isLoading, searchTerm: propSearchTerm }) => {
  // Use propSearchTerm to initialize internal state, and update it when prop changes
  const [searchTerm, setSearchTerm] = useState(propSearchTerm);

  useEffect(() => {
    setSearchTerm(propSearchTerm);
  }, [propSearchTerm]); // Re-run effect whenever propSearchTerm changes

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    if (searchTerm.trim() && !isLoading) { // Prevent search if loading
      onSearch(searchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) { // Prevent search if loading
      handleSearchClick();
    }
  };

  return (
    <div className="search-bar-container" style={{marginTop: '20px'}}>
      <div className="search-input-wrapper">
        <FontAwesomeIcon icon={faImage} className="icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Create a webpage for"
          value={searchTerm} // Controlled component: value comes from state
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading} // Disable input when loading
        />
        <button className="search-button" onClick={handleSearchClick} disabled={isLoading}>
          <FontAwesomeIcon icon={faArrowRight} className="icon" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
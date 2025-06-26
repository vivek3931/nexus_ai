// src/components/MobileHeader/MobileHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons'; // Import icons needed for mobile header

// Props: onMenuToggle to handle sidebar opening/closing, isSidebarOpen to decide which icon to show
// Optional: onNewChat, menuCount if these actions/data are relevant for the mobile header's fixed icons
const MobileHeader = ({ onMenuToggle, isSidebarOpen, onNewChat, menuCount = 88 }) => {
  return (
    <header className="mobile-header">
      <FontAwesomeIcon
        icon={isSidebarOpen ? faTimes : faBars} // Toggle icon: 'X' when open, 'Hamburger' when closed
        className="menu-toggle-icon"
        onClick={onMenuToggle} // Calls the toggle function passed from App.jsx
      />
      <span className="app-title-mobile">SOUL AI</span> {/* Your app title for mobile */}
      
      {/* Optional: Add icons/buttons similar to your desktop header here for mobile */}
      {/* These will be aligned to the right using the flexbox properties in CSS */}
      <div className="header-nav" style={{ marginLeft: 'auto' }}>
          <FontAwesomeIcon 
            icon={faPlus} 
            className="header-icon" 
            onClick={onNewChat} // Assuming this button triggers a new chat on mobile too
          />
          <button className="header-menu-btn">
              <FontAwesomeIcon icon={faThumbsUp} /> {/* Example icon */}
              <span>{menuCount}</span> {/* Use dynamic prop if needed */}
          </button>
      </div>
    </header>
  );
};

export default MobileHeader;
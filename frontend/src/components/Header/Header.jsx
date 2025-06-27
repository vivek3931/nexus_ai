// src/components/Header/Header.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Ensure you import all icons used in this specific header
import { faPlus, faBars, faThLarge } from '@fortawesome/free-solid-svg-icons'; 
import logo from '../../assets/soul_logo.svg'; // Adjust the path as necessary

// Add props for functionality if these actions are relevant for desktop
const Header = ({ onNewChat, onOpenDesktopSidebar, menuCount = 88 }) => {
  return (
    <header className="header">
      <div className="header-logo" onClick={onOpenDesktopSidebar}>
        <span >Nexus AI</span>
        <img src={logo} alt="Logo" />
      </div>
      <nav className="header-nav">
        <FontAwesomeIcon 
            icon={faPlus} 
            className="header-icon" 
            onClick={onNewChat} // Example: New chat on desktop
        />
        {/* If faBars on desktop also toggles sidebar, add a handler */}
        <FontAwesomeIcon 
            icon={faBars} 
            className="header-icon" 
            onClick={onOpenDesktopSidebar} 
        />
        <button className="header-menu-btn">
          <FontAwesomeIcon icon={faThLarge} />
          <span>{menuCount}</span> {/* Dynamic count */}
        </button>
      </nav>
    </header>
  );
};

export default Header;
// src/components/MobileHeader/MobileHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons'; 
import logo from '../../assets/soul_logo.svg'; // Adjust the path as necessary


const MobileHeader = ({ onMenuToggle, isSidebarOpen, onNewChat, menuCount = 88 }) => {
  return (
    <header className="mobile-header">
      <FontAwesomeIcon
        icon={isSidebarOpen ? faTimes : faBars} 
        className="menu-toggle-icon"
        onClick={onMenuToggle} 
      />
      <span className="app-title-mobile">NEXUS AI <img src={logo} alt="Logo" /></span> 

      <div className="header-nav" style={{ marginLeft: 'auto' }}>
          <FontAwesomeIcon 
            icon={faPlus} 
            className="header-icon" 
            onClick={onNewChat} 
          />
          <button className="header-menu-btn">
              <FontAwesomeIcon icon={faThumbsUp} />
              <span>{menuCount}</span>
          </button>
      </div>
    </header>
  );
};

export default MobileHeader;
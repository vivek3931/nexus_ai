import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faPlus,
  faGem,
  faChevronLeft,
  faChevronRight,
  faCog,
  faHouseChimney, // Added for Home/Dashboard
  faCreditCard // Added for Payment
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import logo from '../../assets/soul_logo.svg'; // Ensure this path is correct

const Header = ({
  isMobile,
  isSidebarOpen, // Controls mobile sidebar overlay
  toggleSidebar, // Toggles mobile sidebar overlay
  onNewChat,     // This prop comes from Layout
  menuCount = 88,
  isCollapsed, // Controls desktop sidebar collapse state (from Layout)
  toggleSidebarCollapse, // Toggles desktop sidebar collapse state (from Layout)
  // onShowMembership and onShowPayment props removed as they are handled by Link components now
  // This header will use the navigate() from react-router-dom directly for links
}) => {
  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] p-4
      shadow-lg border-b border-gray-800
      flex items-center
      ${isMobile ? 'justify-between' : 'justify-between pr-6 pl-4'} // Adjust padding for desktop layout
    `}>
      {/* Left Section - Mobile Menu Button & Logo/Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle Button (Hamburger/X) - Only visible on mobile */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-300 transition-colors p-2 -ml-2" // Adjust padding
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon
              icon={isSidebarOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
        )}

        {/* Logo/Title */}
        {/* Always visible on mobile. On desktop, visible unless sidebar is collapsed. */}
        {isMobile || !isCollapsed ? (
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="NEXUS AI Logo" className="h-8 w-8 object-contain" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-bold">
                AI
              </div>
            )}
            <span className="text-xl font-bold text-white whitespace-nowrap">
              NEXUS AI
            </span>
          </Link>
        ) : (
          // Placeholder when logo/title is hidden on desktop collapsed state to maintain flex alignment
          <div className="w-8 h-8"></div>
        )}
      </div>

      {/* Center Section - Desktop Navigation and New Chat button (Hidden on mobile) */}
      {!isMobile && (
        <nav className="flex-1 flex items-center justify-center gap-8">
          {/* New Chat Button (Desktop Primary) */}
          

          {/* Desktop Navigation Links */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faHouseChimney} className="text-base" />
            <span>Home</span>
          </Link>
          <Link
            to="/membership"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faGem} className="text-base" />
            <span>Membership</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faCog} className="text-base" />
            <span>Settings</span>
          </Link>
          
        </nav>
      )}

      <div className="flex items-center gap-4">
        

          <button
            onClick={onNewChat} // Using the onNewChat prop from Layout
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium
                       bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700
                       transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            aria-label="Start a new chat conversation"
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
            <span>New Chat</span>
          </button>


        
      </div>
    </header>
  );
};

export default Header;
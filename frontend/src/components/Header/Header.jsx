import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Plus, Gem, Home, Settings } from 'lucide-react';
import logo from '../../assets/soul_logo.svg';
import { Link, useLocation } from 'react-router-dom';

const Header = ({
  isMobile,
  isSidebarOpen,
  toggleSidebar,
  onNewChat,
  isCollapsed,
  toggleSidebarCollapse,
}) => {
  const headerRef = useRef(null);
  const newChatBtnRef = useRef(null);
  const location = useLocation();

  // Refs for navigation links to measure their position/size
  const homeLinkRef = useRef(null);
  const membershipLinkRef = useRef(null);
  const settingsLinkRef = useRef(null);

  // State for the active indicator's style (width, left, top, height)
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
    top: 0,
    height: 0,
    opacity: 0,
  });

  // Effect to update the active link indicator's position and size
  useEffect(() => {
    if (isMobile) {
      setIndicatorStyle({ width: 0, left: 0, top: 0, height: 0, opacity: 0 }); // Hide indicator on mobile
      return;
    }

    const updateIndicator = () => {
      let currentRef = null;
      const path = location.pathname;

      if (path.startsWith('/dashboard')) {
        currentRef = homeLinkRef;
      } else if (path.startsWith('/membership')) {
        currentRef = membershipLinkRef;
      } else if (path.startsWith('/settings')) {
        currentRef = settingsLinkRef;
      }

      if (currentRef && currentRef.current) {
        const { offsetLeft, offsetWidth, offsetTop, offsetHeight } = currentRef.current;
        setIndicatorStyle({
          width: offsetWidth,
          left: offsetLeft,
          top: offsetTop,
          height: offsetHeight,
          opacity: 1,
        });
      } else {
        setIndicatorStyle({ width: 0, left: 0, top: 0, height: 0, opacity: 0 });
      }
    };

    updateIndicator();
    // Re-evaluate on window resize to adjust positions
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname, isMobile]);

  // Add subtle parallax effect on scroll
  useEffect(() => {
    if (!headerRef.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      headerRef.current.style.transform = `translateY(${Math.min(scrollY * 0.2, 5)}px)`;
      headerRef.current.style.opacity = `${1 - Math.min(scrollY / 200, 0.1)}`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation improvements
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        toggleSidebar();
        newChatBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, toggleSidebar]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
      style={{
        background: 'rgba(var(--background-dark-rgb), 0.85)',
        backdropFilter: 'var(--glass-backdrop-filter)',
        WebkitBackdropFilter: 'var(--glass-backdrop-filter)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 1px 20px rgba(0, 0, 0, 0.1)',
        height: 'var(--header-height)',
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        willChange: 'transform, opacity'
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle - Enhanced for touch devices */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{
              color: 'var(--text-light)',
              touchAction: 'manipulation'
            }}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isSidebarOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        {!isMobile && (
          <button
            onClick={toggleSidebarCollapse}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ color: 'var(--text-light)' }}
          >
            {isCollapsed ? (
              <Menu size={20} aria-hidden="true" />
            ) : (
              <X size={20} aria-hidden="true" />
            )}
          </button>
        )}

        {/* Logo/Title - Optimized for performance */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 focus:outline-none"
          aria-label="Home"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            }}
          >
            <img
              src={logo}
              alt=""
              className="w-5 h-5"
              aria-hidden="true"
              loading="eager"
              decoding="async"
            />
          </div>
          {(!isMobile || !isCollapsed) && (
            <span
              className="lg:text-xl text-sm font-semibold whitespace-nowrap "
              style={{
                color: 'var(--text-accent)',
                opacity: isCollapsed ? 0 : 1,
                transition: 'opacity 0.2s ease-out'
              }}
            >
              NEXUS AI
            </span>
          )}
        </Link>
      </div>

      {/* Center Section - Desktop Navigation */}
      {!isMobile && (
        <nav
          className="flex items-center gap-2 relative"
          aria-label="Main navigation"
        >
          {/* Active indicator box */}
          <div
            className="absolute rounded-lg" // Keep rounded-lg
            style={{
              background: 'var(--background-tertiary)', // Use the specified background variable
              border: '2px solid var(--primary-accent)', // Add a border here
              transition: 'width 0.3s ease-out, left 0.3s ease-out, top 0.3s ease-out, height 0.3s ease-out, opacity 0.3s ease-out',
              // Removed boxShadow
              ...indicatorStyle, // Apply dynamic dimensions and position
            }}
          ></div>

          <Link
            ref={homeLinkRef}
            to="/dashboard"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none  z-[2]"
            style={{ color: location.pathname.startsWith('/dashboard') ? 'var(--text-light)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/dashboard')) {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <Home size={16} aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link
            ref={membershipLinkRef}
            to="/membership"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none  z-[2]"
            style={{ color: location.pathname.startsWith('/membership') ? 'var(--text-light)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/membership')) {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <Gem size={16} aria-hidden="true" />
            <span>Membership</span>
          </Link>

          <Link
            ref={settingsLinkRef}
            to="/settings"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none z-[2]"
            style={{ color: location.pathname.startsWith('/settings') ? 'var(--text-light)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/settings')) {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <Settings size={16} aria-hidden="true" />
            <span>Settings</span>
          </Link>
        </nav>
      )}

      {/* Right Section - New Chat Button */}
      <div className="flex items-center">
        <button
          ref={newChatBtnRef}
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 font-medium  lg:px-4 py-2 rounded-lg lg:text-sm text-xs transition-all duration-200 hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20"
          style={{
            background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))',
            color: 'var(--text-accent)',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            touchAction: 'manipulation'
          }}
          aria-label="Start a new chat conversation"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="whitespace-nowrap">New Chat</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
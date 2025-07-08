import React, { useEffect, useRef } from 'react';
import { Menu, X, Plus, Gem, Home, Settings } from 'lucide-react';
import logo from '../../assets/soul_logo.svg';

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

  // Add subtle parallax effect on scroll
  useEffect(() => {
    if (!headerRef.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      headerRef.current.style.transform = `translateY(${Math.min(scrollY * 0.5, 10)}px)`;
      headerRef.current.style.opacity = `${1 - Math.min(scrollY / 100, 0.2)}`;
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
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu size={20} aria-hidden="true" />
            ) : (
              <X size={20} aria-hidden="true" />
            )}
          </button>
        )}

        {/* Logo/Title - Optimized for performance */}
        <a 
          href="/" 
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
        </a>
      </div>

      {/* Center Section - Desktop Navigation */}
      {!isMobile && (
        <nav 
          className="flex items-center gap-2"
          aria-label="Main navigation"
        >
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Home size={16} aria-hidden="true" />
            <span>Home</span>
          </a>
          
          <a
            href="/membership"
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Gem size={16} aria-hidden="true" />
            <span>Membership</span>
          </a>
          
          <a
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Settings size={16} aria-hidden="true" />
            <span>Settings</span>
          </a>
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
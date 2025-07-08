import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faGem,
  faCog,
  faClock,
  faTrashCan,
  faSearch,
  faHistory,
  faXmark,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

// Helper function (keep as is)
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600 / 24)} days ago`;
  return `${Math.floor(diffInSeconds / (3600 * 24 * 30))} months ago`;
};

const ChatHistory = ({
  history,
  onSelectChat,
  onNewChat,
  selectedChatTurnId,
  onDeleteChat,
  isLoading = false,
  isOpen,
  closeSidebar,
  isMobile,
  toggleSidebarCollapse,
  isCollapsed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  const safeHistory = Array.isArray(history) ? history : [];

  const filteredHistory = safeHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteChat = useCallback((chatObject, e) => {
    e.stopPropagation();
    setShowConfirmDelete(chatObject.id);
  }, []);

  const confirmDelete = useCallback((chatId) => {
    onDeleteChat(chatId);
    setShowConfirmDelete(null);
  }, [onDeleteChat]);

  const cancelDelete = useCallback(() => {
    setShowConfirmDelete(null);
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete all ${safeHistory.length} chats? This action cannot be undone.`)) {
      safeHistory.forEach(chat => onDeleteChat(chat.id));
    }
  }, [safeHistory, onDeleteChat]);

  const handleKeyDown = useCallback((e, chatObject) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectChat(chatObject.id);
      if (isMobile && isOpen) {
        closeSidebar();
      }
    }
  }, [onSelectChat, isMobile, isOpen, closeSidebar]);

  return (
    // Equivalent to .sidebar-container
    <div
      className={`
        flex flex-col flex-shrink-0
        ${isMobile
          ? 'fixed inset-y-0 left-0 transform shadow-xl z-50 transition-transform duration-300 ease-out' // Mobile positioning
          : 'relative transition-all duration-300 ease-out' // Desktop positioning (no fixed)
        }
        ${isMobile && isOpen ? 'translate-x-0' : (isMobile ? '-translate-x-full' : 'translate-x-0')}
        h-full
      `}
      style={{
        width: isCollapsed ? '80px' : 'var(--sidebar-width)', // Using var for desktop width
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--background-dark)',
        padding: '20px 15px', // py-5 px-4
        borderRadius: '16px', // rounded-2xl
        marginRight: '20px', // mr-5
      }}
    >
      {/* Collapse/Expand Button (Desktop only, positioned relative to the sidebar) */}
      {!isMobile && (
        <button
          onClick={toggleSidebarCollapse}
          className="absolute -right-3 top-6 rounded-full p-1 z-50 shadow-md"
          style={{
            backgroundColor: 'var(--background-tertiary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-muted)',
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronLeft}
            className="text-sm"
          />
        </button>
      )}

      {/* Mobile close button (only visible when mobile sidebar is open) */}
        
        <div
          className={`pb-5 mb-5 ${isCollapsed ? 'px-0' : 'px-0'}`}
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          {/* Equivalent to .new-chat-button */}
        <button
          className={`
            flex items-center justify-center gap-2 w-full p-3.5 border-none
            font-medium cursor-pointer rounded-xl text-sm lg:md:mt-0 
            shadow-lg
          `}
          style={{
            color: 'var(--text-light)',
            transition: 'all var(--transition-slow)',
            backgroundColor: 'rgba(108, 92, 231, 0.1)', 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.2)'; 
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onClick={() => {
            onNewChat();
            if (isMobile && isOpen) closeSidebar();
          }}
          disabled={isLoading}
          aria-label="Start a new chat conversation"
        >
          <FontAwesomeIcon icon={faPlus} className="text-white " />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Equivalent to .sidebar-section */}
      <div className="flex-grow flex flex-col">
        {/* Search section - Hidden when collapsed */}
        {!isCollapsed && safeHistory.length > 3 && (
          <div className="mb-5 px-0">
            <div
              className="flex items-center p-2 rounded-xl text-sm transition-all duration-300"
              style={{
                backgroundColor: 'var(--background-tertiary)',
                color: 'var(--text-muted)',
                border: '1px solid rgba(51, 51, 51, 0.5)', // var(--border-color) with 0.5 opacity
              }}
            >
              <FontAwesomeIcon icon={faSearch} className="text-sm mr-2 ml-1" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow bg-transparent outline-none text-text-light placeholder-text-placeholder"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1 rounded-full transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Equivalent to .recent-chats-section */}
        <div className="mb-3">
          {!isCollapsed && (
            // Equivalent to .section-header
            <div className="flex items-center justify-between mb-4 px-1">
              {/* Equivalent to .sidebar-section-title */}
              <h3
                className="text-xs font-semibold uppercase tracking-wider flex items-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <FontAwesomeIcon icon={faHistory} className="mr-2" style={{ color: 'rgba(108, 92, 231, 0.8)' }} />
                Recent Chats
                {searchTerm && (
                  <span className="ml-2 text-xs opacity-70">
                    ({filteredHistory.length})
                  </span>
                )}
              </h3>
              {safeHistory.length > 0 && (
                // Equivalent to .clear-all-button
                <button
                  className="border-none text-xs cursor-pointer px-2 py-1 rounded transition-colors duration-200"
                  style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary-accent)';
                    e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={handleClearAll}
                  aria-label={`Clear all ${safeHistory.length} chats`}
                  title="Clear all chat history"
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {!isCollapsed ? (
            <>
              {searchTerm && filteredHistory.length === 0 ? (
                <div className="text-center py-8 px-4" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">No chats found matching "{searchTerm}"</p>
                  <button
                    className="mt-4 text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(42, 42, 42, 0.5)', 
                      color: 'var(--text-light)',
                    }}
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </button>
                </div>
              ) : filteredHistory.length > 0 ? (
                // Equivalent to .chat-history-list
                <div className="flex flex-col gap-2 flex-grow overflow-y-auto custom-scrollbar pr-1 lg:max-h-[300px] max-h-[200px]">
                  {filteredHistory.map((chatObject) => (
                    // Equivalent to .chat-history-item
                    <div
                      key={chatObject.id}
                      className={`
                          p-2.5 ${isCollapsed ? 'p-3' : 'p-2.5'}  rounded-lg cursor-pointer transition-all duration-200 relative
                      `}
                      style={{
                        backgroundColor: selectedChatTurnId === chatObject.id
                          ? 'rgba(108, 92, 231, 0.25)' // .active background
                          : 'rgba(255, 255, 255, 0.03)', // default background
                        border: selectedChatTurnId === chatObject.id
                          ? '1px solid var(--primary-accent)' // .active border
                          : '1px solid rgba(255, 255, 255, 0.05)', // default border
                      }}
                      onMouseEnter={(e) => {
                        if (selectedChatTurnId !== chatObject.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(108, 92, 231, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedChatTurnId !== chatObject.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                      onClick={() => {
                        onSelectChat(chatObject.id);
                        if (isMobile && isOpen) closeSidebar();
                      }}
                      onKeyDown={(e) => handleKeyDown(e, chatObject)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select chat: ${chatObject.title}`}
                    >
                      {/* Equivalent to .chat-item-content */}
                      <div className="flex flex-col gap-2">
                        {/* Equivalent to .chat-item-header */}
                        <div className="flex items-start justify-between gap-2.5">
                          {/* Equivalent to .chat-item-query */}
                          <span
                            className="flex-grow text-sm leading-tight break-words"
                            style={{ color: 'var(--text-light)' }}
                            title={chatObject.title}
                          >
                            {chatObject.title.length > 40
                              ? `${chatObject.title.substring(0, 37)}...`
                              : chatObject.title}
                          </span>
                          {/* Equivalent to .chat-item-actions */}
                          <div
                            className="flex-shrink-0 transition-opacity duration-200 absolute right-3 top-3 group-hover:opacity-100"
                            style={{ opacity: showConfirmDelete === chatObject.id ? 1 : 0 }} // Always show if confirming delete
                          >
                            {showConfirmDelete === chatObject.id ? (
                              <div
                                className="flex items-center gap-1 rounded-lg p-1"
                                style={{ backgroundColor: 'rgba(42, 42, 42, 0.8)' }}
                              >
                                <button
                                  className="text-xs font-bold px-1.5 py-0.5 rounded transition-colors duration-200"
                                  style={{ color: 'var(--success-color)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(chatObject.id);
                                  }}
                                  title="Confirm delete"
                                >
                                  ✓
                                </button>
                                <button
                                  className="text-xs font-bold px-1.5 py-0.5 rounded transition-colors duration-200"
                                  style={{ color: 'var(--error-color)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelDelete();
                                  }}
                                  title="Cancel delete"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              // Equivalent to .delete-chat-button
                              <button
                                className="border-none cursor-pointer p-1 rounded text-xs transition-all duration-200"
                                style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#ff6b6b'; // Specific hover color from CSS
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'var(--text-muted)';
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onClick={(e) => handleDeleteChat(chatObject, e)}
                                aria-label={`Delete chat: ${chatObject.title}`}
                                title="Delete this chat"
                              >
                                <FontAwesomeIcon icon={faTrashCan} />
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Equivalent to .chat-item-footer */}
                        <div
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {/* Equivalent to .timestamp-icon */}
                          <FontAwesomeIcon icon={faClock} className="text-[0.7rem]" />
                          {/* Equivalent to .chat-item-timestamp */}
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(chatObject.timestamp))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Equivalent to .no-history-message
                <div
                  className="flex flex-col items-center justify-center text-center py-8 px-4"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: 'rgba(42, 42, 42, 0.3)', // var(--background-tertiary) with 0.3 opacity
                      border: '1px solid rgba(51, 51, 51, 0.3)', // var(--border-color) with 0.3 opacity
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHistory}
                      className="text-4xl opacity-30 mb-3"
                      style={{ color: 'rgba(108, 92, 231, 0.2)' }}
                    />
                    <p className="text-sm mb-4">No recent chats</p>
                    <p className="text-xs opacity-70 mb-4" style={{ color: 'var(--text-placeholder)' }}>
                      Start a conversation to see your chat history here
                    </p>
                    {/* Equivalent to .start-new-chat-button */}
                    <button
                      className="flex items-center justify-center gap-2 py-2.5 px-4 border-none text-sm cursor-pointer rounded-lg shadow-md"
                      style={{
                        transition: 'all var(--transition-slow)',
                        color: 'var(--text-light)',
                        background: 'linear-gradient(to right, rgba(108, 92, 231, 0.8), rgba(162, 155, 254, 0.8))', // primary-accent/80 to secondary-accent/80
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgba(108, 92, 231, 0.8), rgba(162, 155, 254, 0.8))';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={onNewChat}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Start your first chat</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center pt-4 space-y-4">
              {safeHistory.slice(0, 5).map((chatObject) => (
                <button
                  key={chatObject.id}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                  `}
                  style={{
                    backgroundColor: selectedChatTurnId === chatObject.id
                      ? 'linear-gradient(to bottom right, var(--primary-accent), var(--secondary-accent))'
                      : 'var(--background-tertiary)',
                    color: selectedChatTurnId === chatObject.id
                      ? 'var(--text-light)'
                      : 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedChatTurnId !== chatObject.id) {
                      e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChatTurnId !== chatObject.id) {
                      e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
                    }
                  }}
                  onClick={() => {
                    onSelectChat(chatObject.id);
                    if (isMobile && isOpen) closeSidebar();
                  }}
                  title={chatObject.title}
                >
                  {chatObject.title.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Equivalent to .sidebar-footer */}
      <div
        className="mt-3 pt-3 flex flex-col gap-2"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        {/* Equivalent to .sidebar-menu-item */}
        <Link
          to="/membership"
          className="flex items-center gap-3 py-2 px-2 cursor-pointer rounded-lg text-sm transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)' }} // primary-accent/10
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.2)'} // primary-accent/20
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.1)'}
          >
            <FontAwesomeIcon icon={faGem} style={{ color: 'var(--primary-accent)' }} />
          </div>
          {!isCollapsed && <span>Upgrade Plan</span>}
        </Link>
        {/* Equivalent to .sidebar-menu-item */}
        <Link
          to="/settings"
          className="flex items-center gap-3 py-2 px-2 cursor-pointer rounded-lg text-sm transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ backgroundColor: 'rgba(162, 155, 254, 0.1)' }} // secondary-accent/10
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(162, 155, 254, 0.2)'} // secondary-accent/20
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(162, 155, 254, 0.1)'}
          >
            <FontAwesomeIcon icon={faCog} style={{ color: 'var(--secondary-accent)' }} />
          </div>
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
};

export default ChatHistory;
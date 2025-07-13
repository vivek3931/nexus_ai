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
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

const ChatHistory = ({
  history,
  onSelectChat,
  onNewChat,
  selectedChatTurnId,
  onDeleteChat,
  isLoading = false,
  isOpen, // This prop might be used by the parent to control sidebar visibility (e.g., for mobile overlay)
  closeSidebar, // This prop might be used by the parent for mobile sidebar close
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

  // New function to handle navigation link clicks
  const handleNavLinkClick = useCallback(() => {
    if (isMobile && isOpen) {
      closeSidebar();
    }
  }, [isMobile, isOpen, closeSidebar]);

  return (
    // The main sidebar container.
    // Apply transitions for desktop (`!isMobile`) based on `isCollapsed` state.
    // Ensure `w-full` for mobile or the desired `w-[Xpx]` for desktop expanded/collapsed states.
    <div
      className={`flex flex-col h-full overflow-hidden 
                  ${!isMobile ? 'transition-all duration-300 ease-in-out' : 'w-full'}
                  ${!isMobile && (isCollapsed ? 'w-20' : 'w-64')}
                  `} // Adjust w-20 and w-64 to your desired collapsed/expanded widths
      style={{
        // Define default desktop width for the sidebar
        width: !isMobile ? (isCollapsed ? '80px' : '256px') : '100%', // Use specific pixel values for control
      }}
    >
      {/* Collapse/Expand Button (Desktop only) */}
      {!isMobile && (
        <button
          onClick={toggleSidebarCollapse}
          className="absolute -right-3 top-6 rounded-full p-1 z-50 shadow-md transition-all duration-200"
          style={{
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronLeft}
            className="text-sm"
          />
        </button>
      )}

      {/* Content Container with proper padding */}
      {/* This inner div's width needs to be managed carefully if it's dependent on the sidebar's overall width */}
      <div className="flex flex-col h-full p-4 overflow-hidden ">
        {/* Header Section */}
        <div
          className="pb-4 mb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          {/* New Chat Button */}
          <Link to={'/dashboard'}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--primary-accent-low-opacity)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-accent-medium-opacity)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-accent-low-opacity)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => {
              onNewChat();
              if (isMobile && isOpen) closeSidebar();
            }}
            disabled={isLoading}
            aria-label="Start a new chat conversation"
          >
            <FontAwesomeIcon icon={faPlus} style={{ color: 'var(--text-primary)' }} />
            {!isCollapsed && <span>New Chat</span>}
          </Link>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search Section */}
          {!isCollapsed && safeHistory.length > 3 && (
            <div className="mb-4 flex-shrink-0">
              <div
                className="flex items-center p-2 rounded-xl text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <FontAwesomeIcon icon={faSearch} className="text-sm mr-2 ml-1" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-text-muted"
                  style={{ color: 'var(--text-primary)' }}
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

          {/* Chat History Section */}
          <div className="flex-1 flex flex-col min-h-0">
            {!isCollapsed && (
              <div className="flex items-center justify-between mb-4 px-1 flex-shrink-0">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider flex items-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <FontAwesomeIcon icon={faHistory} className="mr-2" style={{ color: 'var(--primary-accent)' }} />
                  Recent Chats
                  {searchTerm && (
                    <span className="ml-2 text-xs opacity-70">
                      ({filteredHistory.length})
                    </span>
                  )}
                </h3>
                {safeHistory.length > 0 && (
                  <button
                    className="text-xs cursor-pointer px-2 py-1 rounded transition-colors duration-200"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--primary-accent)';
                      e.currentTarget.style.backgroundColor = 'var(--primary-accent-low-opacity)';
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

            {/* Chat List - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!isCollapsed ? (
                <>
                  {searchTerm && filteredHistory.length === 0 ? (
                    <div className="text-center py-8 px-4" style={{ color: 'var(--text-muted)' }}>
                      <p className="text-sm">No chats found matching "{searchTerm}"</p>
                      <button
                        className="mt-4 text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          color: 'var(--text-primary)',
                        }}
                        onClick={() => setSearchTerm('')}
                      >
                        Clear search
                      </button>
                    </div>
                  ) : filteredHistory.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {filteredHistory.map((chatObject) => (
                        <Link to={'/dashboard'}
                          key={chatObject.id}
                          className="p-2.5 rounded-lg cursor-pointer transition-all duration-200 relative group"
                          style={{
                            backgroundColor: selectedChatTurnId === chatObject.id
                              ? 'var(--primary-accent-medium-opacity)'
                              : 'var(--background-tertiary)',
                            border: selectedChatTurnId === chatObject.id
                              ? '1px solid var(--primary-accent)'
                              : '1px solid var(--border-primary)',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedChatTurnId !== chatObject.id) {
                              e.currentTarget.style.backgroundColor = 'var(--primary-accent-low-opacity)';
                              e.currentTarget.style.borderColor = 'var(--primary-accent-medium-opacity)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedChatTurnId !== chatObject.id) {
                              e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
                              e.currentTarget.style.borderColor = 'var(--border-primary)';
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
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2.5">
                              <span
                                className="flex-grow text-sm leading-tight break-words"
                                style={{ color: 'var(--text-primary)' }}
                                title={chatObject.title}
                              >
                                {chatObject.title.length > 40
                                  ? `${chatObject.title.substring(0, 37)}...`
                                  : chatObject.title}
                              </span>
                              <div
                                className="flex-shrink-0 transition-opacity duration-200 absolute right-3 top-3 opacity-0 group-hover:opacity-100"
                                style={{ opacity: showConfirmDelete === chatObject.id ? 1 : 'inherit' }}
                              >
                                {showConfirmDelete === chatObject.id ? (
                                  <div
                                    className="flex items-center gap-1 rounded-lg p-1"
                                    style={{ backgroundColor: 'var(--background-secondary)' }}
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
                                  <button
                                    className="p-1 rounded text-xs transition-all duration-200"
                                    style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = 'var(--error-color)';
                                      e.currentTarget.style.backgroundColor = 'var(--error-color-low-opacity)';
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
                            <div
                              className="flex items-center gap-1.5 text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <FontAwesomeIcon icon={faClock} className="text-[0.7rem]" />
                              <span className="text-xs">
                                {formatDistanceToNow(new Date(chatObject.timestamp))}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center text-center py-8 px-4"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <div
                        className="rounded-xl p-6"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faHistory}
                          className="text-4xl opacity-30 mb-3"
                          style={{ color: 'var(--primary-accent)' }}
                        />
                        <p className="text-sm mb-4">No recent chats</p>
                        <p className="text-xs opacity-70 mb-4" style={{ color: 'var(--text-muted)' }}>
                          Start a conversation to see your chat history here
                        </p>
                        <button
                          className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm cursor-pointer rounded-lg shadow-md transition-all duration-200"
                          style={{
                            color: 'var(--text-primary)',
                            background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent-darker), var(--secondary-accent-darker))';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))';
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
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                      style={{
                        backgroundColor: selectedChatTurnId === chatObject.id
                          ? 'var(--primary-accent)'
                          : 'var(--background-secondary)',
                        color: selectedChatTurnId === chatObject.id
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedChatTurnId !== chatObject.id) {
                          e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedChatTurnId !== chatObject.id) {
                          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
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
        </div>

        {/* Footer */}
        <div
          className="mt-4 pt-4 flex flex-col gap-2 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-primary)' }}
        >
          {/* Upgrade Plan Link */}
          <Link
            to="/membership"
            className="flex items-center gap-3 py-2 px-2 cursor-pointer rounded-lg text-sm transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            onClick={handleNavLinkClick}
            role="button"
            tabIndex={0}
          >
            <div
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: 'var(--primary-accent-low-opacity)' }}
            >
              <FontAwesomeIcon icon={faGem} style={{ color: 'var(--primary-accent)' }} />
            </div>
            {!isCollapsed && <span>Upgrade Plan</span>}
          </Link>

          {/* Settings Link */}
          <Link
            to="/settings"
            className="flex items-center gap-3 py-2 px-2 cursor-pointer rounded-lg text-sm transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            onClick={handleNavLinkClick}
            role="button"
            tabIndex={0}
          >
            <div
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: 'var(--secondary-accent-low-opacity)' }}
            >
              <FontAwesomeIcon icon={faCog} style={{ color: 'var(--secondary-accent)' }} />
            </div>
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faGem,
  faCog,
  faClock,
  faEllipsisVertical,
  faTrashCan,
  faSearch,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

// Using built-in date formatting instead of date-fns
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

// Add isOpen and closeSidebar to props
const ChatHistory = ({ 
  history, 
  onSelectChat, 
  onNewChat, 
  selectedChatTurnId,
  onDeleteChat,
  isLoading = false,
  isOpen, // <-- ADD THIS PROP
  closeSidebar // <-- ADD THIS PROP for potential overlay click
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  const filteredHistory = history.filter(chat =>
    chat.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteChat = useCallback((chatTurn, e) => {
    e.stopPropagation();
    setShowConfirmDelete(chatTurn.id);
  }, []);

  const confirmDelete = useCallback((chatId) => {
    onDeleteChat(chatId);
    setShowConfirmDelete(null);
  }, [onDeleteChat]);

  const cancelDelete = useCallback(() => {
    setShowConfirmDelete(null);
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete all ${history.length} chats? This action cannot be undone.`)) {
      history.forEach(chat => onDeleteChat(chat.id));
    }
  }, [history, onDeleteChat]);

  const handleKeyDown = useCallback((e, chatTurn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectChat(chatTurn);
      if (isOpen) { // If sidebar is open on mobile, close it after selection
          closeSidebar(); 
      }
    }
  }, [onSelectChat, isOpen, closeSidebar]);

  // IMPORTANT: Conditionally apply the 'sidebar-open' class
  const sidebarClasses = `sidebar-container ${isOpen ? 'sidebar-open' : ''}`;

  return (
    // Apply the dynamic class name here
    <div className={sidebarClasses}> 
      {/* Top section with new chat button */}
      <div className="sidebar-header">
        <button 
          className="new-chat-button glass-effect"
          onClick={() => {
              onNewChat();
              if (isOpen) { // If sidebar is open on mobile, close it after new chat
                  closeSidebar(); 
              }
          }}
          disabled={isLoading}
          aria-label="Start a new chat conversation"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search section */}
      {history.length > 3 && (
        <div className="sidebar-search" style={{ marginBottom: '20px' }}>
          <div className="search-input-wrapper" style={{ 
            padding: '8px 12px', 
            fontSize: '14px',
            borderRadius: '12px'
          }}>
            <FontAwesomeIcon icon={faSearch} className="icon" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>
      )}

      {/* Recent chats section */}
      <div className="sidebar-section recent-chats-section">
        <div className="section-header">
          <h3 className="sidebar-section-title">
            <FontAwesomeIcon icon={faHistory} style={{ marginRight: '8px' }} />
            Recent Chats
            {searchTerm && (
              <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                ({filteredHistory.length})
              </span>
            )}
          </h3>
          {history.length > 0 && (
            <button 
              className="clear-all-button"
              onClick={handleClearAll}
              aria-label={`Clear all ${history.length} chats`}
              title="Clear all chat history"
            >
              Clear All
            </button>
          )}
        </div>

        {searchTerm && filteredHistory.length === 0 ? (
          <div className="no-history-message">
            <p>No chats found matching "{searchTerm}"</p>
            <button 
              className="start-new-chat-button glass-effect"
              onClick={() => setSearchTerm('')}
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            >
              Clear search
            </button>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="chat-history-list">
            {filteredHistory.map((chatTurn) => (
              <div
                key={chatTurn.id}
                className={`chat-history-item ${selectedChatTurnId === chatTurn.id ? 'active' : ''}`}
                onClick={() => {
                    onSelectChat(chatTurn);
                    if (isOpen) { // If sidebar is open on mobile, close it after selection
                        closeSidebar(); 
                    }
                }}
                onKeyDown={(e) => handleKeyDown(e, chatTurn)}
                tabIndex={0}
                role="button"
                aria-label={`Select chat: ${chatTurn.query}`}
              >
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="chat-item-query" title={chatTurn.query}>
                      {chatTurn.query.length > 40 
                        ? `${chatTurn.query.substring(0, 37)}...` 
                        : chatTurn.query}
                    </span>
                    <div className="chat-item-actions">
                      {showConfirmDelete === chatTurn.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="delete-chat-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(chatTurn.id);
                            }}
                            style={{ color: '#ff6b6b', fontSize: '0.7rem' }}
                            title="Confirm delete"
                          >
                            ✓
                          </button>
                          <button 
                            className="delete-chat-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelDelete();
                            }}
                            style={{ fontSize: '0.7rem' }}
                            title="Cancel delete"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="delete-chat-button"
                          onClick={(e) => handleDeleteChat(chatTurn, e)}
                          aria-label={`Delete chat: ${chatTurn.query}`}
                          title="Delete this chat"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="chat-item-footer">
                    <FontAwesomeIcon icon={faClock} className="timestamp-icon" />
                    <span className="chat-item-timestamp">
                      {formatDistanceToNow(new Date(chatTurn.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-history-message">
            <FontAwesomeIcon 
              icon={faHistory} 
              style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '12px' }} 
            />
            <p>No recent chats</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '16px' }}>
              Start a conversation to see your chat history here
            </p>
            <button 
              className="start-new-chat-button glass-effect"
              onClick={onNewChat}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Start your first chat</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="sidebar-footer">
        <div className="sidebar-menu-item" role="button" tabIndex={0}>
          <FontAwesomeIcon icon={faGem} className="menu-item-icon" />
          <span>Explore Gems</span>
        </div>
        <div className="sidebar-menu-item" role="button" tabIndex={0}>
          <FontAwesomeIcon icon={faCog} className="menu-item-icon" />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
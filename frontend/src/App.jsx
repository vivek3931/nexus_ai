// ai-layout-project/frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header'; // Existing Desktop Header
import MobileHeader from './components/MobileHeader/MobileHeader'; // NEW: Import Mobile Header
import SearchBar from './components/SearchBar/SearchBar';
import SuggestionsBar from './components/SuggestionBar/SuggestionBar';
import SoulX3Box from './components/SoulX3Box/SoulX3Box';
import ResultsDisplay from './components/ResultDisplay/ResultDisplay';
import Footer from './components/Footer/Footer';
import ChatHistory from './components/ChatHistory/ChatHistory';

// Import FontAwesome icons needed directly within App.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faHeart, faThumbsUp, faShareAlt, faEllipsisH, faSpinner } from '@fortawesome/free-solid-svg-icons'; 

// Import your logo asset
import logo from '../src/assets/soul_logo.svg'; // Ensure the path is correct based on your project structure

function App() {
  // --- State Management ---
  const [currentResult, setCurrentResult] = useState(null); // Holds the currently displayed AI response
  const [isLoading, setIsLoading] = useState(false);       // To show loading state during API calls
  const [error, setError] = useState(null);               // To handle and display errors
  const [chatHistory, setChatHistory] = useState([]);     // State for all chat turns (query + response)
  const [searchTermInSearchBar, setSearchTermInSearchBar] = useState(''); // Controls SearchBar's input value
  const [selectedChatTurn, setSelectedChatTurn] = useState(null); // To store the currently viewed chat object from history
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls mobile sidebar visibility
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State to detect mobile screen size based on CSS breakpoint

  const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Base API URL from environment variable or default to 

  // --- Sidebar Toggle Functions ---
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev); // Toggles the sidebar open/closed state
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false); // Explicitly closes the sidebar
  };

  // --- useEffect to update isMobile state on window resize ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Updates isMobile based on the defined CSS breakpoint
    };

    window.addEventListener('resize', handleResize); // Attach event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up on component unmount
  }, []); // Empty dependency array means this runs once on component mount

  // --- useEffect to load chat history from localStorage on initial render ---
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        // Optionally, display the last chat in history if available on load
        if (parsedHistory.length > 0) {
          setCurrentResult(parsedHistory[0].response);
          setSelectedChatTurn(parsedHistory[0]); // Also set as selected
          setSearchTermInSearchBar(parsedHistory[0].query); // Populate search bar with the last query
        }
      }
    } catch (e) {
      console.error("Failed to load or parse chat history from localStorage:", e);
      // If data is corrupted, clear it to prevent continuous errors
      localStorage.removeItem('chatHistory');
    }
  }, []); // Empty dependency array means this runs once on component mount

  // --- useEffect to save chat history to localStorage whenever it changes ---
  useEffect(() => {
    // Only save if history is not empty to avoid saving an empty array unnecessarily
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } else {
      localStorage.removeItem('chatHistory'); // Clear item if history becomes empty
    }
  }, [chatHistory]); // Runs whenever chatHistory state changes

  // --- API Call Function ---
  const handleSearch = async (searchTerm) => {
    setSearchTermInSearchBar(searchTerm); // Keep search bar value updated with current search
    console.log('Search initiated for:', searchTerm);
    setIsLoading(true); // Set loading state
    setError(null);      // Clear any previous errors
    setCurrentResult(null); // Clear previous results immediately for a fresh display


    try {
      const response = await fetch(`${BASE_API_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentResult(data); // Set the new current result to be displayed

      // --- Add or Update the new chat turn in history ---
      const newChatTurn = {
        id: Date.now().toString(), // Simple unique ID based on timestamp
        query: searchTerm,
        response: data,
        timestamp: new Date().toISOString(), // Store ISO string for easy date parsing
      };

      setChatHistory((prevHistory) => {
        // Check if the current search term is the same as the most recent history item's query
        // If so, update that item's response (useful for "regenerate" features or simply refining a query)
        if (prevHistory.length > 0 && prevHistory[0].query === searchTerm) {
          return [{ ...prevHistory[0], response: data, timestamp: newChatTurn.timestamp }, ...prevHistory.slice(1)];
        }
        // Otherwise, add the new chat turn to the beginning of the array (most recent first)
        return [newChatTurn, ...prevHistory];
      });
      setSelectedChatTurn(newChatTurn); // Select the newly created/updated chat

    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  // --- Suggestion Bar Handler ---
  const handleSuggest = (suggestion) => {
    setSearchTermInSearchBar(suggestion); // Update search bar with the clicked suggestion
    handleSearch(suggestion); // Initiate search with the suggestion
  };

  // --- Function to handle selecting a past chat from history ---
  const handleSelectChatFromHistory = (chatTurn) => {
    setCurrentResult(chatTurn.response); // Display the selected chat's response
    setSearchTermInSearchBar(chatTurn.query); // Populate search bar with selected query
    setError(null); // Clear any existing errors
    setIsLoading(false); // Ensure loading state is off
    setSelectedChatTurn(chatTurn); // Set the selected chat for highlighting in history
    if (isMobile) { // Only close sidebar if on mobile view
      closeSidebar();
    }
  };

  // --- Function to handle "New Chat" (App-level) ---
  const handleNewChatAppLevel = () => {
    setCurrentResult(null); // Clear displayed results
    setSearchTermInSearchBar(''); // Clear search bar input
    setError(null); // Clear any errors
    setIsLoading(false); // Ensure loading is off
    setSelectedChatTurn(null); // Deselect any active chat history item
    if (isMobile) { // Only close sidebar if on mobile view
      closeSidebar();
    }
  };

  // Determine if initial placeholder content (logo, placeholder answer, suggestions) should be shown
  const showInitialContent = !isLoading && !error && !currentResult;

  // --- Render Cycle ---
  return (
    <div className="App">
      {/* Conditional Rendering of Header based on screen size */}
      {isMobile ? (
        <MobileHeader 
          onMenuToggle={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
          onNewChat={handleNewChatAppLevel} // Pass new chat handler to mobile header
        />
      ) : (
        <Header 
          onNewChat={handleNewChatAppLevel} // Pass new chat handler to desktop header
          onOpenDesktopSidebar={toggleSidebar} // Pass toggle for desktop sidebar if faBars should trigger it
        />
      )}

      {/* Sidebar Overlay - Appears only on mobile when the sidebar is open */}
      {isSidebarOpen && isMobile && ( // Only show overlay if sidebar is open AND on mobile
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main layout container for sidebar and main content area */}
      <div className="main-layout">
        {/* Chat History / Sidebar Component */}
        <ChatHistory
          history={chatHistory}
          onSelectChat={handleSelectChatFromHistory}
          onNewChat={handleNewChatAppLevel}
          selectedChatTurnId={selectedChatTurn?.id}
          isLoading={isLoading}
          isOpen={isSidebarOpen} // Pass the sidebar open/closed state
          closeSidebar={closeSidebar} // Pass the function to close the sidebar
        />

        {/* Main content area: logo, search bar, suggestions, and results */}
        <main className="chat-interface-main">
          {showInitialContent && (
            <div className="main-logo">
              <img src={logo} alt="SOUL AI 2025" /> {/* Updated alt text */}
            </div>
          )}
          
          {/* Search Bar Component */}
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            searchTerm={searchTermInSearchBar} 
          />

          {/* Loading State Display */}
          {isLoading && (
            <div className="loading-state glass-effect"> {/* Added glass-effect for consistency */}
              <FontAwesomeIcon icon={faSpinner} spin size="2x" color="var(--primary-accent)" />
              <p>Thinking...</p>
            </div>
          )}

          {/* Error State Display */}
          {error && (
            <div className="error-state glass-effect"> {/* Added glass-effect for consistency */}
              <p className="error-message">Error: {error}</p>
              <p>Please try again or refine your query.</p>
            </div>
          )}

          {/* Initial Content Placeholder */}
          {showInitialContent && (
            <>
              <SoulX3Box />
              <SuggestionsBar onSuggest={handleSuggest} />
              <div className="answer-section-placeholder glass-effect">
                <h2 className="result-section-title">
                  <FontAwesomeIcon icon={faMagic} />
                  Answer
                </h2>
                <div className="answer-interaction-icons">
                  <FontAwesomeIcon icon={faHeart} className="icon" />
                  <FontAwesomeIcon icon={faThumbsUp} className="icon" />
                  <FontAwesomeIcon icon={faShareAlt} className="icon" />
                  <FontAwesomeIcon icon={faEllipsisH} className="icon" />
                </div>
              </div>
            </>
          )}

          {/* Results Display Component - Renders only when data is available and not loading/error */}
          {currentResult && !isLoading && !error && <ResultsDisplay data={currentResult} />}
        </main>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default App;


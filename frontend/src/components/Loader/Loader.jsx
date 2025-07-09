import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header/Header";
import ChatHistory from "./components/Sidebar/Sidebar";
import SearchBar from "./components/SearchBar/SearchBar";
import Loader from "./components/Loader/Loader"; // <-- Make sure this path is correct based on your file structure

const Layout = ({
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
  onNewChat,
  chatHistory,
  onSelectChat,
  onDeleteChat,
  selectedChatTurnId,
  isLoading, // This prop controls your loader's visibility
  onSearch,
  searchTermInSearchBar,
  currentSearchType,
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar when switching to desktop
      if (!mobile && isSidebarOpen) {
        closeSidebar();
      }
      
      // Auto-expand sidebar when switching to mobile if collapsed
      if (mobile && isCollapsed) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, closeSidebar, isCollapsed]);

  // Body overflow handling for mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "contain";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebarCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Dynamic sidebar width calculation
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return isCollapsed ? 80 : 280;
  };

  const sidebarWidth = getSidebarWidth();

  // Mobile sidebar width - responsive to screen size
  const getMobileSidebarWidth = () => {
    if (window.innerWidth < 375) return '85vw'; // Very small screens
    if (window.innerWidth < 480) return '80vw'; // Small phones
    return '320px'; // Default mobile width
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-dark)] text-white font-sans">
      {/* Header */}
      <Header
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNewChat={onNewChat}
        isCollapsed={isCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 relative">
        {/* Sidebar */}
        <aside 
          className={`
            fixed top-16 left-0 bottom-0 z-40
            transition-all duration-300 ease-out
            shadow-xl
            ${isMobile 
              ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')
              : 'translate-x-0'}
            h-[calc(100vh-4rem)]
            will-change-transform
            ${isMobile && !isSidebarOpen ? 'pointer-events-none' : ''}          
          `}
          style={{
            width: isMobile 
              ? (isSidebarOpen ? getMobileSidebarWidth() : '0px')
              : `${sidebarWidth}px`
          }}
        >
          <ChatHistory
            isOpen={isSidebarOpen}
            closeSidebar={closeSidebar}
            history={chatHistory}
            onSelectChat={onSelectChat}
            onNewChat={onNewChat}
            onDeleteChat={onDeleteChat}
            selectedChatTurnId={selectedChatTurnId}
            isLoading={isLoading} // ChatHistory also uses this, ensure logic is separate for its own internal loaders vs. main loader
            isMobile={isMobile}
            toggleSidebarCollapse={toggleSidebarCollapse}
            isCollapsed={isCollapsed}
          />
        </aside>

        {/* Main Content */}
        <main
          className="flex-grow relative z-10 h-[calc(100vh-4rem)] min-w-0"
          style={{
            marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
            transition: 'margin-left 300ms ease-out'
          }}
        >
          {/* Mobile overlay */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={closeSidebar}
              onTouchStart={(e) => {
                e.preventDefault();
                closeSidebar();
              }}
            />
          )}

          {/* Content container */}
          <div className="h-full flex flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
              <div className="min-h-full p-2 sm:p-4 md:p-8 max-w-6xl mx-auto pb-32">
                {/* --- YOUR LOADER COMPONENT --- */}
                {isLoading && <Loader isLoading={isLoading} />} 
                {/* Your Loader component already handles its own display based on its internal isLoading,
                    but we pass it here for consistency if you ever want to control it from Layout. */}
                {/* IMPORTANT: Your Loader component already has `fixed inset-0 z-50` and `if (!isLoading) return null;`.
                   This means you don't need an extra wrapper div around it here. Just render it directly.
                   If you change your Loader's internal logic, you might re-introduce a wrapper here.
                */}
                {/* --- END LOADER IMPLEMENTATION --- */}

                <Outlet /> {/* This is where your routed content (e.g., chat interface) appears */}
              </div>
            </div>

            {/* Search Bar - Fixed at bottom */}
            <div className="flex-shrink-0 sticky bottom-0 z-30 w-full">
              <div className="backdrop-blur-lg bg-[var(--background-dark)]/95">
                <div className="max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-4">
                  <SearchBar
                    onSearch={onSearch}
                    isLoading={isLoading}
                    searchTerm={searchTermInSearchBar}
                    currentSearchType={currentSearchType}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
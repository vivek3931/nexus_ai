import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import Header from "./components/Header/Header";
import ChatHistory from "./components/Sidebar/Sidebar";
import SearchBar from "./components/SearchBar/SearchBar";
import Loader from "./components/Loader/Loader";

const Layout = ({
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
  onNewChat,
  chatHistory,
  onSelectChat,
  onDeleteChat,
  selectedChatTurnId,
  isLoading,
  onSearch,
  searchTermInSearchBar,
  currentSearchType,
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation hook
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine if the search bar should be shown
  // Adjust '/dashboard' to match your actual dashboard route path.
  // If you have sub-routes like /dashboard/settings, use startsWith:
  // const showSearchBar = location.pathname.startsWith('/dashboard');
  const showSearchBar = location.pathname === '/dashboard';


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

  // Simplified sidebar width calculation
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return isCollapsed ? 80 : 280;
  };

  const sidebarWidth = getSidebarWidth();

  // Mobile sidebar width
  const getMobileSidebarWidth = () => {
    if (window.innerWidth < 375) return '85vw';
    if (window.innerWidth < 480) return '80vw';
    return '320px';
  };

  return (
    <div className="flex flex-col min-h-screen font-sans"
         style={{
           backgroundColor: 'var(--primary-background-color)',
           color: 'var(--text-primary)'
         }}>
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
        {/* Sidebar - FIXED: Simplified positioning and styling */}
        <aside
          className={`
            fixed top-16 left-0 bottom-0 z-40
            transition-all duration-300 ease-out
            shadow-xl rounded-r-4xl
            ${isMobile
              ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')
              : 'translate-x-0'}
          `}
          style={{
            width: isMobile
              ? (isSidebarOpen ? getMobileSidebarWidth() : '0px')
              : `${sidebarWidth}px`,
            backgroundColor: 'var(--primary-background-color)', // Use primary background for consistency
            borderRight: !isMobile ? '1px solid var(--glass-border)' : 'none',
            // Remove the complex margin and padding - let ChatHistory handle its own spacing
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
            isLoading={isLoading}
            isMobile={isMobile}
            toggleSidebarCollapse={toggleSidebarCollapse}
            isCollapsed={isCollapsed}
          />
        </aside>

        {/* Main Content - FIXED: Simplified margin calculation */}
        <main
          className="flex-grow relative z-10 h-[calc(100dvh-4rem)] min-w-0"
          style={{
            marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
            transition: 'margin-left 300ms ease-out'
          }}
        >
          {/* Mobile overlay - FIXED: Positioned correctly */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              style={{ top: '4rem' }} // Start below header
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
                {isLoading && <Loader isLoading={isLoading} />}
                <Outlet />
              </div>
            </div>

            {/* Search Bar - Conditional rendering based on showSearchBar */}
            {showSearchBar && (
              <div className="flex-shrink-0 sticky bottom-0 z-30 w-full">
                <div className="backdrop-blur-lg lg:md:rounded-t-4xl md:lg:border-t overflow-hidden"
                     style={{
                       backgroundColor: 'var(--primary-background-color)',
                       borderTopColor: 'var(--glass-border)'
                     }}>
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
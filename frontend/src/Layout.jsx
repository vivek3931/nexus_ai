import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header/Header";
import ChatHistory from "./components/Sidebar/Sidebar";
import SearchBar from "./components/SearchBar/SearchBar";

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
            ${!isMobile 
              ? `w-${isCollapsed ? '20' : '72'} shadow-xl` 
              : isSidebarOpen 
                ? 'w-80 shadow-2xl' 
                : 'w-0 shadow-none'}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            h-[calc(100vh-4rem)]
            will-change-transform
          `}
          style={{
            width: !isMobile ? `${sidebarWidth}px` : isSidebarOpen ? '320px' : '0px'
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

        {/* Main Content */}
        <main
          className="flex-grow relative z-10 h-[calc(100vh-4rem)]"
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
              onTouchStart={closeSidebar}
            />
          )}

          {/* Content container */}
          <div className="h-full flex flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
              <div className="min-h-full p-4 md:p-8 max-w-6xl mx-auto pb-32">
                <Outlet />
              </div>
            </div>

            {/* Search Bar - Fixed at bottom */}
            <div className="flex-shrink-0 sticky bottom-0 z-30 w-full">
              <div className="backdrop-blur-lg bg-[var(--background-dark)]/95 ">
                <div className="max-w-4xl mx-auto p-4">
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
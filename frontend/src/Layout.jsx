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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && isSidebarOpen) {
        closeSidebar();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, closeSidebar]);

  useEffect(() => {
    // Prevent body scrolling when mobile sidebar is open
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebarCollapse = () => setIsCollapsed(!isCollapsed);

  // Use CSS custom properties for dynamic sidebar widths
  const sidebarStyles = {
    '--sidebar-width': isCollapsed ? '80px' : '280px'
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans"
      style={sidebarStyles}
    >
      {/* Header - fixed at the top */}
      <div className="lg:hidden md:hidden visible fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-zinc-800/50">
        <Header
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          onNewChat={onNewChat}
          isCollapsed={isCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
          onShowMembership={() => navigate("/membership")}
          onShowPayment={() => navigate("/payment")}
        />
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 pt-16 relative">
        {/* Sidebar (Chat History) - Fixed position */}
        <div className={`
          fixed top-1 left-0 bottom-0 z-40
          transition-all duration-300 ease-in-out
          ${!isMobile 
            ? 'w-[var(--sidebar-width)]' 
            : isSidebarOpen 
              ? 'w-80' 
              : 'w-0'
          }
          ${isMobile && !isSidebarOpen ? 'translate-x-[-100%]' : 'translate-x-0 z-50'}
        `}>
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
        </div>

        {/* Main Content Area */}
        <main
          className={`
            flex-grow relative z-10
            transition-all duration-300 ease-in-out
          
            ${!isMobile 
              ? 'ml-[var(--sidebar-width)]' 
              : 'ml-0'
            }
          `}
          style={{
            // Reserve space for search bar at bottom
             // Adjust based on your search bar height
                  ...(isMobile && {
                    minHeight: 'calc(100vh - 4rem)', // Full height minus header
                  })
          }}
        >
          {/* Mobile Overlay */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Content Container with proper scrolling */}
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* SearchBar Container - Fixed at bottom */}
      <div
        className={`
          fixed bottom-0 z-40
          backdrop-blur-xl bg-[#0a0a0a]/80
           border-zinc-800/50
          transition-all duration-300 ease-in-out
          ${!isMobile 
            ? 'left-[var(--sidebar-width)]' 
            : 'left-0'
          }
          right-0
          py-4 px-4
        `}
      >
        {/* Search bar with proper centering */}
        <div className="max-w-4xl mx-auto">
          <SearchBar
            onSearch={onSearch}
            isLoading={isLoading}
            searchTerm={searchTermInSearchBar}
            currentSearchType={currentSearchType}
          />
        </div>
      </div>

      {/* Additional styles for better glass morphism */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Layout;
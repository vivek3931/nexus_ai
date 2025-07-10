import { StrictMode, useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  ScrollRestoration,
  Navigate, // Used by ProtectedRoute for redirection
  Outlet, // Used by ProtectedRoute to render nested routes
} from "react-router-dom";

// Import your layout components
import Layout from "./Layout"; // Your Layout component (dashboard structure)
import AuthLayout from "./components/Auth/AuthLayout"; // Layout for auth pages

// Import your page components
import DashboardContent from "./App.jsx"; // Your main application content
import LoginForm from "./components/Login/Login.jsx";
import RegisterForm from "./components/Register/Register.jsx";
import Membership from "./components/MemberShip/MemberShip.jsx";
import SettingsPage from "./components/SettingPage/SettingPage.jsx";
import { SettingsProvider } from "./SettingContext/SettingContext.jsx";

// --- ProtectedRoute Component ---
// This component ensures that its child routes are only accessible if the user is authenticated.
// In a larger project, this would typically be in its own file (e.g., src/components/ProtectedRoute/ProtectedRoute.jsx)
const ProtectedRoute = ({ isAuthenticated, redirectPath = "/login" }) => {
  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to={redirectPath} replace />;
  }
  // If authenticated, render the child routes (which will be rendered by the <Outlet />)
  return <Outlet />;
};
// --- End ProtectedRoute Component ---

const Root = () => {
  // --- State Management for the entire application ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // General loading for any API call (e.g., AI search, PDF gen)
  const [initialAppLoading, setInitialAppLoading] = useState(true); // For initial app load from localStorage
  const [searchTermInSearchBar, setSearchTermInSearchBar] = useState("");
  const [currentResult, setCurrentResult] = useState(null); // Used for initial display of last AI response
  const [currentSearchType, setCurrentSearchType] = useState("text");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token;
  });
  const MAX_TRIAL_SEARCHES = 3;
  const TRIAL_DURATION_MINUTES = 30;
  const BASE_API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // --- Utility Functions ---
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isTrialExpired = useCallback(() => {
    if (isAuthenticated) return false;
    if (searchCount >= MAX_TRIAL_SEARCHES) return true;
    if (trialStartTime) {
      const now = new Date();
      const timeDiff = (now - trialStartTime) / (1000 * 60);
      if (timeDiff > TRIAL_DURATION_MINUTES) return true;
    }
    return false;
  }, [isAuthenticated, searchCount, trialStartTime]);

  const getRemainingSearches = useCallback(() => {
    if (isAuthenticated) return null;
    return Math.max(0, MAX_TRIAL_SEARCHES - searchCount);
  }, [isAuthenticated, searchCount]);

  const getRemainingTime = useCallback(() => {
    if (isAuthenticated || !trialStartTime) return null;
    const now = new Date();
    const timeDiff = (now - trialStartTime) / (1000 * 60);
    return Math.max(0, TRIAL_DURATION_MINUTES - timeDiff);
  }, [isAuthenticated, trialStartTime]);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setShowAuthPrompt(false);
  }, []);

  // Handler for cancelling authentication prompt
  const handleAuthCancel = useCallback(() => {
    setShowAuthPrompt(false);
  }, []);

  // --- Chat Management Handlers ---
  const handleNewChat = useCallback(() => {
    const newConversationId = Date.now().toString();
    const newConversationObj = {
      id: newConversationId,
      title: "New Chat",
      messages: [],
      timestamp: new Date().toISOString(),
    };

    setConversations((prevConversations) => [
      newConversationObj,
      ...prevConversations,
    ]);
    setActiveConversation(newConversationObj);

    // Reset all display states for a new chat
    setSearchTermInSearchBar("");
    setCurrentResult(null);
    setCurrentSearchType("text");
    setError(null);
    setIsLoading(false);
    setHasSearched(false);
  }, []);

  const handleSelectChatFromHistory = useCallback(
    (conversationId) => {
      const selected = conversations.find((conv) => conv.id === conversationId);
      if (selected) {
        setActiveConversation(selected);

        // Find the last AI response to display
        const lastAIMessage = selected.messages.findLast(
          (msg) => msg.role === "model"
        );
        const lastUserMessage = selected.messages.findLast(
          (msg) => msg.role === "user"
        );

        if (lastAIMessage) {
          setCurrentResult(lastAIMessage.response);
          setSearchTermInSearchBar(lastUserMessage?.query || "");
          setCurrentSearchType(lastUserMessage?.searchType || "text");
          setHasSearched(true);
        } else {
          // No AI response yet, but there might be user messages
          setCurrentResult(null);
          setSearchTermInSearchBar(lastUserMessage?.query || "");
          setCurrentSearchType(lastUserMessage?.searchType || "text");
          setHasSearched(selected.messages.length > 0);
        }

        setError(null);
        setIsLoading(false);
      }
      closeSidebar();
    },
    [conversations]
  );

  const handleDeleteChat = useCallback(
    (conversationId) => {
      setConversations((prev) => {
        const updatedConversations = prev.filter(
          (conv) => conv.id !== conversationId
        );

        // If we're deleting the active conversation, reset the display
        if (activeConversation && activeConversation.id === conversationId) {
          setActiveConversation(null);
          setSearchTermInSearchBar("");
          setCurrentResult(null);
          setCurrentSearchType("text");
          setHasSearched(false);
          setError(null);
          setIsLoading(false);
        }

        return updatedConversations;
      });
    },
    [activeConversation]
  );

  // --- Main Search/Query Handler (for AI Chat/Search) ---
  const handleSearch = async ({
    query,
    searchType = "text",
    imageUrl = null,
  }) => {
    if (isTrialExpired()) {
      setShowAuthPrompt(true);
      return;
    }

    if (!trialStartTime && !isAuthenticated) {
      setTrialStartTime(new Date());
    }

    setIsLoading(true); // General loading for the search
    setError(null);
    setCurrentResult(null); // Clear previous result for new search
    setSearchTermInSearchBar(query);
    setCurrentSearchType(searchType);
    setHasSearched(true);

    let conversationToUpdate = activeConversation;
    let isNewConversationCreated = false;

    if (!conversationToUpdate) {
      const newConversationId = Date.now().toString();
      conversationToUpdate = {
        id: newConversationId,
        title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
        messages: [],
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) => [conversationToUpdate, ...prev]);
      setActiveConversation(conversationToUpdate);
      isNewConversationCreated = true;
    }

    const userMessage = {
      id: Date.now().toString() + "-user",
      query: query,
      timestamp: new Date().toISOString(),
      searchType: searchType,
      imageUrl: imageUrl,
      role: "user",
    };

    // Update conversation title if it's still "New Chat" after the first user message
    if (
      conversationToUpdate.title === "New Chat" &&
      conversationToUpdate.messages.length === 0 &&
      !isNewConversationCreated
    ) {
      conversationToUpdate = {
        ...conversationToUpdate,
        title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id ? conversationToUpdate : conv
        )
      );
      setActiveConversation(conversationToUpdate);
    }

    // Ensure the timestamp of the active conversation is updated on new messages
    if (!isNewConversationCreated) {
      conversationToUpdate = {
        ...conversationToUpdate,
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id ? conversationToUpdate : conv
        )
      );
      setActiveConversation(conversationToUpdate);
    }

    // Add the user message to the current conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationToUpdate.id
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    try {
      const requestBody = { query: query };
      if (imageUrl) {
        requestBody.imageUrl = imageUrl;
      }

      // Always call the /api/search endpoint for the main AI response
      const response = await fetch(`${BASE_API_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAuthenticated && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`Data received from /api/search:`, data);

      const aiMessage = {
        id: Date.now().toString() + "-ai",
        response: data, // Store the full data object here
        timestamp: new Date().toISOString(),
        role: "model",
        query: query, // Store the query with the AI message for context
      };

      // Add the AI response message to the current conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );

      setCurrentResult(data); // Set current result for display

      if (!isAuthenticated) {
        setSearchCount((prev) => prev + 1); // Increment trial search count
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message || "An unexpected error occurred.");
      setCurrentResult(null);
      // On error, remove the user message if no AI response was received
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id
            ? {
                ...conv,
                messages: conv.messages.filter(
                  (msg) => msg.id !== userMessage.id
                ),
              }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for generating PDF from AI response
  const handleGeneratePdfClick = useCallback(
    async (turnId, textContent, originalQuery, googleLinks) => {
      if (!textContent || isLoading) {
        // Prevent multiple generations or if no content
        return;
      }

      setIsLoading(true); // Set general loading state
      setError(null);

      try {
        const response = await fetch(`${BASE_API_URL}/generate-pdf`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isAuthenticated && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          },
          body: JSON.stringify({
            textContent: textContent,
            originalQuery: originalQuery,
            googleLinks: googleLinks,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log(`PDF URL received from /api/generate-pdf:`, data.pdfUrl);

        // Find the active conversation and update the specific model message with the pdfUrl
        setConversations((prevConversations) =>
          prevConversations.map((conv) => {
            if (conv.id === activeConversation?.id) {
              // Ensure we are on the active conversation
              return {
                ...conv,
                messages: conv.messages.map((msg) => {
                  if (msg.id === turnId && msg.role === "model") {
                    return {
                      ...msg,
                      response: {
                        ...msg.response,
                        pdfUrl: data.pdfUrl, // Add the PDF URL to the response object
                      },
                    };
                  }
                  return msg;
                }),
              };
            }
            return conv;
          })
        );

        // Update currentResult if the PDF was generated for the currently displayed message
        if (
          activeConversation &&
          activeConversation.messages.find((msg) => msg.id === turnId)
        ) {
          setCurrentResult((prevResult) => ({
            ...prevResult,
            pdfUrl: data.pdfUrl,
          }));
        }
      } catch (err) {
        console.error("Error generating PDF:", err);
        setError(
          err.message || "An unexpected error occurred during PDF generation."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, isLoading, isAuthenticated, BASE_API_URL]
  ); // Add BASE_API_URL to dependencies

  const handleSuggest = useCallback(
    (suggestion) => {
      setSearchTermInSearchBar(suggestion);
      handleSearch({ query: suggestion, searchType: "text" });
    },
    [handleSearch]
  );

  // --- Local Storage Effects ---
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem("conversations");
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);

        if (parsedConversations.length > 0) {
          const firstConversation = parsedConversations[0];
          setActiveConversation(firstConversation);

          const lastAIMessage = firstConversation.messages?.findLast(
            (msg) => msg.role === "model"
          );
          const lastUserMessage = firstConversation.messages?.findLast(
            (msg) => msg.role === "user"
          );

          if (lastAIMessage) {
            setCurrentResult(lastAIMessage.response);
            setSearchTermInSearchBar(lastUserMessage?.query || "");
            setCurrentSearchType(lastUserMessage?.searchType || "text");
            setHasSearched(true);
          } else if (firstConversation.messages?.length > 0) {
            setSearchTermInSearchBar(lastUserMessage?.query || "");
            setCurrentSearchType(lastUserMessage?.searchType || "text");
            setHasSearched(true);
          }
        }
      }

      // Load trial data
      const savedSearchCount = localStorage.getItem("trialSearchCount");
      const savedTrialStart = localStorage.getItem("trialStartTime");
      const savedAuthStatus = localStorage.getItem("isAuthenticated");

      if (savedSearchCount) setSearchCount(parseInt(savedSearchCount));
      if (savedTrialStart) setTrialStartTime(new Date(savedTrialStart));
      if (savedAuthStatus === "true") setIsAuthenticated(true);
    } catch (e) {
      console.error("Failed to load data from localStorage:", e);
      // Clear corrupted data
      localStorage.removeItem("conversations");
      localStorage.removeItem("trialSearchCount");
      localStorage.removeItem("trialStartTime");
      // Reset state
      setConversations([]);
      setActiveConversation(null);
      setCurrentResult(null);
      setSearchTermInSearchBar("");
      setHasSearched(false);
    } finally {
      // IMPORTANT: Set initialAppLoading to false AFTER all initial data is loaded
      setInitialAppLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    } else {
      localStorage.removeItem("conversations");
    }
  }, [conversations]);

  // Update active conversation state when conversations array changes
  useEffect(() => {
    if (activeConversation) {
      const updatedActive = conversations.find(
        (conv) => conv.id === activeConversation.id
      );
      if (updatedActive) {
        setActiveConversation(updatedActive);
        // When active conversation updates, also update currentResult to reflect its latest AI message
        const lastAIMessage = updatedActive.messages?.findLast(
          (msg) => msg.role === "model"
        );
        if (lastAIMessage) {
          setCurrentResult(lastAIMessage.response);
        } else {
          setCurrentResult(null);
        }
      }
    }
  }, [conversations, activeConversation?.id]); // Depend on activeConversation.id for re-evaluation

  // Save trial data to localStorage
  useEffect(() => {
    localStorage.setItem("trialSearchCount", searchCount.toString());
  }, [searchCount]);

  useEffect(() => {
    if (trialStartTime) {
      localStorage.setItem("trialStartTime", trialStartTime.toISOString());
    } else {
      localStorage.removeItem("trialStartTime"); // Clear if trialStartTime becomes null
    }
  }, [trialStartTime]);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  // Combine loading states for the Layout component
  const overallLoading = initialAppLoading || isLoading;

  // --- Router Configuration ---
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* --- Public Routes (Authentication) --- */}
        {/* These routes are accessible to all users, primarily for login/registration. */}
        <Route path="/" element={<AuthLayout />}>
          <Route
            index // This makes LoginForm the default route at "/"
            element={
              <LoginForm
                onSwitchForm={(path) => router.navigate(path)}
                onLoginSuccess={handleAuthSuccess}
              />
            }
          />
          <Route
            path="login" // Explicitly defines /login route
            element={
              <LoginForm
                onSwitchForm={(path) => router.navigate(path)}
                onLoginSuccess={handleAuthSuccess}
              />
            }
          />
          <Route
            path="register" // Defines /register route
            element={
              <RegisterForm onSwitchForm={(path) => router.navigate(path)} />
            }
          />
        </Route>

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route
            path="/"
            element={
              <Layout
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
                onNewChat={handleNewChat}
                chatHistory={conversations}
                onSelectChat={handleSelectChatFromHistory}
                onDeleteChat={handleDeleteChat}
                selectedChatTurnId={activeConversation?.id}
                isLoading={overallLoading} // Pass the combined loading state
                onSearch={handleSearch} // For SearchBar component
                searchTermInSearchBar={searchTermInSearchBar}
                currentSearchType={currentSearchType}
              />
            }
          >
            {/* Nested routes for the main dashboard content */}
            <Route
              path="dashboard" // Defines /dashboard route
              element={
                <DashboardContent
                  isLoading={isLoading} // Specific loading for search/PDF
                  error={error}
                  showInitialContent={
                    !activeConversation ||
                    activeConversation.messages.length === 0
                  }
                  currentResult={currentResult}
                  currentSearchType={currentSearchType}
                  onSearch={handleSearch} // For SuggestionsBar/initial search
                  searchTermInSearchBar={searchTermInSearchBar}
                  onSuggest={handleSuggest}
                  showAuthPrompt={showAuthPrompt}
                  handleAuthCancel={handleAuthCancel}
                  handleAuthSuccess={handleAuthSuccess}
                  isAuthenticated={isAuthenticated}
                  getRemainingSearches={getRemainingSearches}
                  getRemainingTime={getRemainingTime}
                  chatHistory={
                    activeConversation ? activeConversation.messages : []
                  }
                  selectedChatTurnId={activeConversation?.id}
                  hasSearched={hasSearched}
                  onGeneratePdfClick={handleGeneratePdfClick}
                />
              }
            />
            <Route path="membership" element={<Membership />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </>
    )
  );

  return (
    <RouterProvider router={router}>
      <ScrollRestoration />
    </RouterProvider>
  );
};

// Render the application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SettingsProvider>
      <Root />
    </SettingsProvider>
  </StrictMode>
);

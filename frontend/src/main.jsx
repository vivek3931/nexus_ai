import {
  StrictMode,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  ScrollRestoration,
  Navigate,
  Outlet,
} from "react-router-dom";

// Import your layout components
import Layout from "./Layout";
import AuthLayout from "./components/Auth/AuthLayout";

// Import your page components
import DashboardContent from "./App.jsx";
import LoginForm from "./components/Login/Login.jsx";
import RegisterForm from "./components/Register/Register.jsx";
import Membership from "./components/MemberShip/MemberShip.jsx";
import SettingsPage from "./components/SettingPage/SettingPage.jsx";
import ResetPassword from "./components/ResetPassword/ResetPassword.jsx";
import ForgotPassword from "./components/ForgetPassword/ForgetPassword.jsx";

// Import your Context Providers
import { AuthProvider, AuthContext } from "./AuthContext/AuthContext.jsx";
import { SettingsProvider } from "./SettingContext/SettingContext.jsx";
import Loader from "./components/Loader/Loader.jsx";

// --- ProtectedRoute Component ---
const ProtectedRoute = () => {
  // Consume AuthContext to get authentication status
  const { user, loading: authLoading } = useContext(AuthContext);

  if (authLoading) {
    return <Loader />;
  }

  // If not authenticated (user is null after loading), redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If authenticated, render the child routes
  return <Outlet />;
};
// --- End ProtectedRoute Component ---

const Root = () => {
  // Consume AuthContext for authentication status
  const {
    isAuthenticated,
    loading: authLoading,
    user,
  } = useContext(AuthContext);

  // --- State Management for the entire application (non-auth/settings related) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // Renamed from isLoading to be specific to searches
  const [initialAppLoading, setInitialAppLoading] = useState(true); // For initial app load from localStorage (conversations etc.)
  const [searchTermInSearchBar, setSearchTermInSearchBar] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [currentSearchType, setCurrentSearchType] = useState("text");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

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
    setIsSearching(false); // Use isSearching here
    setHasSearched(false);
  }, []);

  const handleSelectChatFromHistory = useCallback(
    (conversationId) => {
      const selected = conversations.find((conv) => conv.id === conversationId);
      if (selected) {
        setActiveConversation(selected);

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
          setCurrentResult(null);
          setSearchTermInSearchBar(lastUserMessage?.query || "");
          setCurrentSearchType(lastUserMessage?.searchType || "text");
          setHasSearched(selected.messages.length > 0);
        }

        setError(null);
        setIsSearching(false); // Use isSearching here
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

        if (activeConversation && activeConversation.id === conversationId) {
          setActiveConversation(null);
          setSearchTermInSearchBar("");
          setCurrentResult(null);
          setCurrentSearchType("text");
          setHasSearched(false);
          setError(null);
          setIsSearching(false); // Use isSearching here
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
    if (!isAuthenticated && isTrialExpired()) {
      setShowAuthPrompt(true);
      return; // Stop the search operation
    }

    if (!isAuthenticated && !trialStartTime) {
      setTrialStartTime(new Date());
    }

    // --- Rest of your existing handleSearch logic ---
    setIsSearching(true); // Set isSearching to true for search operations
    setError(null);
    setCurrentResult(null);
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

      const headers = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && localStorage.getItem("token")) {
        headers["x-auth-token"] = localStorage.getItem("token");
      }

      const response = await fetch(`${BASE_API_URL}/search`, {
        method: "POST",
        headers: headers,
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
        response: data,
        timestamp: new Date().toISOString(),
        role: "model",
        query: query,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );

      setCurrentResult(data);

      if (!isAuthenticated) {
        setSearchCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message || "An unexpected error occurred.");
      setCurrentResult(null);
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
      setIsSearching(false); // Set isSearching to false after search operation
    }
  };

  // Handler for generating PDF from AI response
  const handleGeneratePdfClick = useCallback(
    async (turnId, textContent, originalQuery, googleLinks) => {
      if (!textContent || isSearching) {
        // Use isSearching here too
        return;
      }

      setIsSearching(true); // Set isSearching to true for PDF generation
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated) {
        headers["x-auth-token"] = localStorage.getItem("token");
      }

      try {
        const response = await fetch(`${BASE_API_URL}/generate-pdf`, {
          method: "POST",
          headers: headers,
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

        setConversations((prevConversations) =>
          prevConversations.map((conv) => {
            if (conv.id === activeConversation?.id) {
              return {
                ...conv,
                messages: conv.messages.map((msg) => {
                  if (msg.id === turnId && msg.role === "model") {
                    return {
                      ...msg,
                      response: {
                        ...msg.response,
                        pdfUrl: data.pdfUrl,
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
        setIsSearching(false); // Set isSearching to false after PDF generation
      }
    },
    [activeConversation, isSearching, isAuthenticated, BASE_API_URL]
  );

  const handleSuggest = useCallback(
    (suggestion) => {
      setSearchTermInSearchBar(suggestion);
      handleSearch({ query: suggestion, searchType: "text" });
    },
    [handleSearch]
  );

  // --- Local Storage Effects ---
  useEffect(() => {
    // Only load conversations etc. if authLoading is complete
    if (!authLoading) {
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

        // Load trial data (only if not authenticated initially)
        if (!isAuthenticated) {
          const savedSearchCount = localStorage.getItem("trialSearchCount");
          const savedTrialStart = localStorage.getItem("trialStartTime");

          if (savedSearchCount) setSearchCount(parseInt(savedSearchCount));
          if (savedTrialStart) setTrialStartTime(new Date(savedTrialStart));
        } else {
          // If authenticated, ensure trial states are reset or irrelevant
          setSearchCount(0);
          setTrialStartTime(null);
          localStorage.removeItem("trialSearchCount");
          localStorage.removeItem("trialStartTime");
        }
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
        localStorage.removeItem("conversations");
        localStorage.removeItem("trialSearchCount");
        localStorage.removeItem("trialStartTime");
        setConversations([]);
        setActiveConversation(null);
        setCurrentResult(null);
        setSearchTermInSearchBar("");
        setHasSearched(false);
      } finally {
        setInitialAppLoading(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    } else {
      localStorage.removeItem("conversations");
    }
  }, [conversations]);

  useEffect(() => {
    if (activeConversation) {
      const updatedActive = conversations.find(
        (conv) => conv.id === activeConversation.id
      );
      if (updatedActive) {
        setActiveConversation(updatedActive);
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
  }, [conversations, activeConversation?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("trialSearchCount", searchCount.toString());
    } else {
      localStorage.removeItem("trialSearchCount");
    }
  }, [searchCount, isAuthenticated]);

  useEffect(() => {
    if (trialStartTime && !isAuthenticated) {
      localStorage.setItem("trialStartTime", trialStartTime.toISOString());
    } else {
      localStorage.removeItem("trialStartTime");
    }
  }, [trialStartTime, isAuthenticated]);

  // Define overallAppLoading specifically for the initial app load (including auth)
  const overallAppLoading = initialAppLoading || authLoading;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* --- Public Routes (Authentication) --- */}
        <Route path="/" element={<AuthLayout />}>
          <Route
            index
            element={
              <LoginForm onSwitchForm={(path) => router.navigate(path)} />
            }
          />
          <Route
            path="login"
            element={
              <LoginForm onSwitchForm={(path) => router.navigate(path)} />
            }
          />
          <Route
            path="register"
            element={
              <RegisterForm onSwitchForm={(path) => router.navigate(path)} />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
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
                // Pass overallAppLoading for the initial layout mount, not general search loading
                isLoading={overallAppLoading}
                onSearch={handleSearch}
                searchTermInSearchBar={searchTermInSearchBar}
                currentSearchType={currentSearchType}
              />
            }
          >
            <Route
              path="dashboard"
              element={
                <DashboardContent
                  isLoading={isSearching} // Pass isSearching specifically for search/PDF loading
                  error={error}
                  showInitialContent={
                    !activeConversation ||
                    activeConversation.messages.length === 0
                  }
                  currentResult={currentResult}
                  currentSearchType={currentSearchType}
                  onSearch={handleSearch}
                  searchTermInSearchBar={searchTermInSearchBar}
                  onSuggest={handleSuggest}
                  showAuthPrompt={showAuthPrompt}
                  handleAuthCancel={handleAuthCancel}
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

// Render the application, wrapping Root with both AuthProvider and SettingsProvider
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <Root />
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>
);

// src/main.jsx (Fixed version to prevent duplicate input/output)

import { StrictMode, useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

// Import your layout components
import Layout from "./Layout";
import AuthLayout from "./components/Auth/AuthLayout";

// Import your page components
import DashboardContent from "./App.jsx";
import LoginForm from "./components/Login/Login.jsx";
import RegisterForm from "./components/Register/Register.jsx";
import Membership from "./components/MemberShip/MemberShip.jsx";

const Root = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTermInSearchBar, setSearchTermInSearchBar] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [currentSearchType, setCurrentSearchType] = useState("text");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const isTrialExpired = () => {
    if (isAuthenticated) return false;
    if (searchCount >= MAX_TRIAL_SEARCHES) return true;
    if (trialStartTime) {
      const now = new Date();
      const timeDiff = (now - trialStartTime) / (1000 * 60);
      if (timeDiff > TRIAL_DURATION_MINUTES) return true;
    }
    return false;
  };

  const getRemainingSearches = () => {
    if (isAuthenticated) return null;
    return Math.max(0, MAX_TRIAL_SEARCHES - searchCount);
  };

  const getRemainingTime = () => {
    if (isAuthenticated || !trialStartTime) return null;
    const now = new Date();
    const timeDiff = (now - trialStartTime) / (1000 * 60);
    return Math.max(0, TRIAL_DURATION_MINUTES - timeDiff);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthPrompt(false);
    router.navigate("/dashboard");
  };

  const handleAuthCancel = () => {
    setShowAuthPrompt(false);
  };

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

    // Reset all display states
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

  // FIX: Simplified handleSearch to prevent duplicates
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
    } // Set search state immediately

    setSearchTermInSearchBar(query);
    setCurrentSearchType(searchType);
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    setCurrentResult(null); // Clear previous result to avoid duplicates // Determine the conversation to use

    let conversationToUpdate = activeConversation;
    let isNewConversationCreated = false; // Flag to track if a new conv was just made // Create new conversation if none exists

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
      isNewConversationCreated = true; // Mark as newly created
    } // Create user message

    const userMessage = {
      id: Date.now().toString() + "-user",
      query: query,
      timestamp: new Date().toISOString(),
      searchType: searchType,
      imageUrl: imageUrl,
      role: "user",
    };

    // Update conversation title if it's "New Chat" and this is the first message
    // and it wasn't a brand new conversation already titled from the query
    if (
      conversationToUpdate.title === "New Chat" &&
      conversationToUpdate.messages.length === 0 &&
      !isNewConversationCreated
    ) {
      conversationToUpdate = {
        ...conversationToUpdate,
        title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
        timestamp: new Date().toISOString(), // Update timestamp on first message too
      };
      // Update the conversations state with the new title
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id ? conversationToUpdate : conv
        )
      );
      setActiveConversation(conversationToUpdate); // Ensure activeConversation is also updated
    }

    // Also update the timestamp for ANY message sent to an existing chat,
    // so it moves to the top of "Recent Chats".
    // This handles subsequent messages in a conversation.
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
      setActiveConversation(conversationToUpdate); // Ensure activeConversation is also updated
    } // Add user message to conversation

    // IMPORTANT: Use the potentially updated `conversationToUpdate` here
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

      const data = await response.json(); // Create AI response message
      console.log("Data received from /api/search (before setting currentResult):", data); // ADD THIS LINE


      const aiMessage = {
        id: Date.now().toString() + "-ai",
        response: data,
        timestamp: new Date().toISOString(),
        role: "model",
        query: query, // Include original query for reference
      }; // Add AI message to conversation and update current result

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationToUpdate.id
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      ); // Set the current result (this should be the ONLY place currentResult is set during search)

      setCurrentResult(data);

      if (!isAuthenticated) {
        setSearchCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message || "An unexpected error occurred.");
      setCurrentResult(null); // Remove the user message if API call failed
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
  const handleSuggest = (suggestion) => {
    setSearchTermInSearchBar(suggestion);
    handleSearch({ query: suggestion, searchType: "text" });
  };

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

          // Load the last state from the first conversation
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
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    } else {
      localStorage.removeItem("conversations");
    }
  }, [conversations]);

  // Update active conversation when conversations change
  useEffect(() => {
    if (activeConversation) {
      const updatedActive = conversations.find(
        (conv) => conv.id === activeConversation.id
      );
      if (updatedActive) {
        setActiveConversation(updatedActive);
      }
    }
  }, [conversations]);

  // Save trial data
  useEffect(() => {
    localStorage.setItem("trialSearchCount", searchCount.toString());
  }, [searchCount]);

  useEffect(() => {
    if (trialStartTime) {
      localStorage.setItem("trialStartTime", trialStartTime.toISOString());
    }
  }, [trialStartTime]);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<AuthLayout />}>
          <Route
            index
            element={
              <LoginForm
                onSwitchForm={(path) => router.navigate(path)}
                onLoginSuccess={handleAuthSuccess}
              />
            }
          />
          <Route
            path="login"
            element={
              <LoginForm
                onSwitchForm={(path) => router.navigate(path)}
                onLoginSuccess={handleAuthSuccess}
              />
            }
          />
          <Route
            path="register"
            element={
              <RegisterForm onSwitchForm={(path) => router.navigate(path)} />
            }
          />
        </Route>

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
              isLoading={isLoading}
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
                isLoading={isLoading}
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
                handleAuthSuccess={handleAuthSuccess}
                isAuthenticated={isAuthenticated}
                getRemainingSearches={getRemainingSearches}
                getRemainingTime={getRemainingTime}
                chatHistory={
                  activeConversation ? activeConversation.messages : []
                }
                selectedChatTurnId={activeConversation?.id}
                hasSearched={hasSearched}
              />
            }
          />
          <Route path="membership" element={<Membership />} />
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);

import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faMagic, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Component imports
import CodeBlock from "./components/CodeBlock/CodeBlock";
import ResultsDisplay from "./components/ResultDisplay/ResultDisplay";
import SuggestionsBar from "./components/SuggestionBar/SuggestionBar";
import NexusX1Box from "./components/NexusX1Box/NexusX1Box";
import logo from './assets/soul_logo.svg';

// --- Helper Functions ---

/**
 * Determines if a query is likely related to code generation based on keywords.
 * @param {string} query - The user's input query.
 * @returns {boolean} - True if the query contains code-related keywords.
 */
const isCodeRelatedQuery = (query) => {
    if (!query || typeof query !== "string") return false;

    const codeKeywords = [
        "create", "make", "build", "develop", "code", "write", "generate",
        "html", "css", "javascript", "python", "java", "react", "vue", "angular",
        "node", "php", "sql", "function", "class", "component", "script",
        "program", "algorithm", "implement", "coding", "programming",
        "website", "app", "application", "api", "database", "frontend",
        "backend", "fullstack", "web development", "software",
    ];

    const lowerQuery = query.toLowerCase();
    return codeKeywords.some((keyword) => lowerQuery.includes(keyword));
};

/**
 * Extracts code blocks and surrounding text from a Markdown string.
 * @param {string} markdownString - The Markdown content from the model's response.
 * @returns {Array<Object>} - An array of parts, each being either a 'text' or 'code' object.
 */
const extractCodeBlocksAndText = (markdownString) => {
    if (!markdownString || typeof markdownString !== "string") return [];

    const parts = [];
    const regex = /(```(\w+)?\n([\s\S]*?)\n```)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(markdownString)) !== null) {
        // Add any text before the current code block
        if (match.index > lastIndex) {
            const textContent = markdownString.substring(lastIndex, match.index).trim();
            if (textContent) {
                parts.push({ type: "text", content: textContent });
            }
        }

        // Add the code block
        const language = match[2] || "plaintext";
        const sourceCode = match[3].trim();

        parts.push({
            type: "code",
            language,
            sourceCode,
            output: getSimulatedOutput(language),
        });

        lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last code block
    if (lastIndex < markdownString.length) {
        const remainingText = markdownString.substring(lastIndex).trim();
        if (remainingText) {
            parts.push({ type: "text", content: remainingText });
        }
    }

    return parts;
};

/**
 * Provides a simulated output message for different code languages.
 * @param {string} language - The programming language.
 * @returns {string} - A simulated output string.
 */
const getSimulatedOutput = (language) => {
    const outputs = {
        python: "Code executed successfully.",
        javascript: "Script executed without errors.",
        html: "HTML structure created. Open in browser to view.",
        css: "CSS styles applied.",
        default: "Code processed successfully."
    };
    return outputs[language] || outputs.default;
};

/**
 * Determines if a response should be rendered as code.
 * @param {string} query - The user's original query.
 * @param {string} responseText - The model's textual response.
 * @returns {boolean} - True if the response should be rendered as code.
 */
const shouldRenderAsCode = (query, responseText) => {
    return isCodeRelatedQuery(query) && responseText?.includes('```');
};

// --- Main App Component ---

/**
 * The main application component for the chat interface.
 */
function App({
    isLoading,
    error,
    onSuggest,
    showAuthPrompt,
    handleAuthCancel,
    handleAuthSuccess,
    isAuthenticated,
    getRemainingSearches,
    getRemainingTime,
    chatHistory,
    hasSearched,
    onGeneratePdfClick,
}) {
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    
    // Ensure chatHistory is always an array
    const safeChatHistory = useMemo(() => 
        Array.isArray(chatHistory) ? chatHistory : [], 
        [chatHistory]
    );
    
    // Determine if the welcome screen should be shown
    const shouldShowWelcomeScreen = useMemo(() =>
        safeChatHistory.length === 0 && !isLoading && !hasSearched,
        [safeChatHistory, isLoading, hasSearched]
    );

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [chatHistory, isLoading]);

    // Lock body scroll when authentication prompt is active
    useEffect(() => {
        if (showAuthPrompt) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [showAuthPrompt]);

    /**
     * Renders the content of a single model response turn.
     */
    const renderResponseContent = useCallback((turn) => {
        if (!turn.response) return null;

        // Safely extract answer text
        const answerText = (
            typeof turn.response.answer === 'object' && 
            turn.response.answer !== null && 
            typeof turn.response.answer.text === 'string'
        ) ? turn.response.answer.text 
          : (typeof turn.response.answer === 'string' ? turn.response.answer : null);

        const pdfUrl = turn.response.pdfUrl;
        const isCodeResponse = shouldRenderAsCode(turn.query, answerText);
        const hasSidebarContent = turn.response.images?.length > 0 || turn.response.googleLinks?.length > 0;
        const isImageAnalysis = turn.searchType === "image";

        let contentToRender;

        // PDF Rendering
        if (pdfUrl) {
            contentToRender = (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center p-4"
                >
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold py-2 px-4 rounded-md transition-all duration-200 shadow-sm flex items-center gap-2"
                        style={{
                            background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                            color: 'var(--text-accent)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, rgba(108, 92, 231, 0.9), rgba(162, 155, 254, 0.9))';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))';
                        }}
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Download Generated PDF
                    </a>
                </motion.div>
            );
        }
        // Image Analysis Results
        else if (isImageAnalysis && answerText) {
            contentToRender = (
                <div className="max-w-[100%] space-y-4">
                    {turn.imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg bg-gray-800 shadow-md"
                        >
                            <h3 className="text-lg font-semibold mb-2 text-gray-300">
                                Uploaded Image
                            </h3>
                            <img
                                src={turn.imageUrl}
                                alt="Analyzed content"
                                className="max-w-full h-auto rounded-lg border border-blue-500/50"
                            />
                        </motion.div>
                    )}
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-gray-800 shadow-md"
                    >
                        <h3 className="text-lg font-semibold mb-2 text-gray-300">
                            Analysis Results
                        </h3>
                        <Markdown remarkPlugins={[remarkGfm]}>{answerText}</Markdown>
                    </motion.div>
                    
                    {turn.response.googleLinks?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg bg-gray-800 shadow-md"
                        >
                            <h3 className="text-lg font-semibold mb-2 text-gray-300">
                                Related Links
                            </h3>
                            <ul className="space-y-2">
                                {turn.response.googleLinks.map((link, index) => (
                                    <li key={index}>
                                        <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            {link.title || link.url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>
            );
        }
        // Code Rendering
        else if (isCodeResponse && answerText && !pdfUrl) {
            const parts = extractCodeBlocksAndText(answerText);
            contentToRender = (
                <div className="max-w-[100%] space-y-4">
                    {parts.map((part, partIndex) => (
                        part.type === "text" ? (
                            <motion.div
                                key={partIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg text-gray-200 shadow-md"
                                style={{ backgroundColor: 'var(--background-secondary)' }}
                            >
                                <Markdown remarkPlugins={[remarkGfm]}>{part.content}</Markdown>
                            </motion.div>
                        ) : (
                            <CodeBlock
                                key={partIndex}
                                language={part.language}
                                sourceCode={part.sourceCode}
                                output={part.output}
                            />
                        )
                    ))}
                </div>
            );
        }
        // External Search Results
        else if (hasSidebarContent && answerText) {
            contentToRender = (
                <ResultsDisplay
                    data={turn.response}
                    searchType={turn.searchType}
                />
            );
        }
        // Default Text Rendering
        else if (answerText) {
            contentToRender = (
                <Markdown remarkPlugins={[remarkGfm]}>{answerText}</Markdown>
            );
        }
        // Fallback
        else {
            contentToRender = (
                <p className="text-gray-400">
                    No textual answer provided for this response.
                </p>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg max-w-[80%] break-words text-gray-200 shadow-md"
                style={{ backgroundColor: 'var(--background-secondary)' }}
            >
                {contentToRender}
            </motion.div>
        );
    }, [onGeneratePdfClick, isLoading]);

    return (
        <div className="flex-grow flex flex-col pt-8 pb-[100px] sm:pb-[120px] px-4 sm:px-8 custom-scrollbar">
            {/* Authentication Prompt Modal */}
            <AnimatePresence>
                {showAuthPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black/70 z-[100] backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-effect p-8 rounded-xl shadow-lg text-center max-w-sm w-full relative border"
                            style={{
                                backgroundColor: 'var(--background-secondary)',
                                borderColor: 'rgba(113, 128, 150, 0.5)',
                                color: 'var(--text-accent)',
                            }}
                        >
                            <button
                                onClick={handleAuthCancel}
                                className="absolute top-4 right-4 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold mb-4">
                                Continue with Free Account
                            </h2>
                            <p className="mb-6" style={{ color: 'var(--text-light)' }}>
                                You've used your free searches! Create a free account to continue
                                using our AI search.
                            </p>
                            <div className="flex flex-col space-y-4">
                                <button
                                    className="font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md"
                                    style={{
                                        backgroundColor: 'var(--primary-accent)',
                                        color: 'var(--text-accent)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.9)';
                                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(108, 92, 231, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--primary-accent)';
                                        e.currentTarget.style.boxShadow = '';
                                    }}
                                    onClick={handleAuthSuccess}
                                >
                                    Sign Up / Login
                                </button>
                                <button
                                    className="font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md"
                                    style={{
                                        backgroundColor: 'var(--background-tertiary)',
                                        color: 'var(--text-accent)',
                                    }}
                                    onMouseEnter={(e) => 
                                        e.currentTarget.style.backgroundColor = 'var(--border-color)'
                                    }
                                    onMouseLeave={(e) => 
                                        e.currentTarget.style.backgroundColor = 'var(--background-tertiary)'
                                    }
                                    onClick={handleAuthCancel}
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trial Status Bar */}
            {!isAuthenticated && (getRemainingSearches() !== null || getRemainingTime() !== null) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect p-4 rounded-lg flex items-center justify-between mb-8 shadow-md border"
                    style={{
                        backgroundColor: 'var(--background-secondary)',
                        borderColor: 'rgba(113, 128, 150, 0.5)',
                    }}
                >
                    <div className="trial-info text-sm" style={{ color: 'var(--text-light)' }}>
                        <span>Free Trial: </span>
                        {getRemainingSearches() !== null && (
                            <span>{getRemainingSearches()} searches left</span>
                        )}
                        {getRemainingTime() !== null && getRemainingTime() > 0 && (
                            <span> • {Math.ceil(getRemainingTime())} minutes remaining</span>
                        )}
                    </div>
                    <button
                        className="text-sm font-semibold py-2 px-4 rounded-md transition-all duration-200 shadow-sm"
                        style={{
                            background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                            color: 'var(--text-accent)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, rgba(108, 92, 231, 0.9), rgba(162, 155, 254, 0.9))';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))';
                        }}
                        onClick={() => navigate('/login')}
                    >
                        Get Unlimited Access
                    </button>
                </motion.div>
            )}

            {/* Main Content */}
            {shouldShowWelcomeScreen ? (
                // Welcome Screen
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center flex-grow"
                >
                    <div className="flex justify-center items-center h-64 mb-8">
                        {logo ? (
                            <motion.img
                                src={logo}
                                alt="nexus ai"
                                className="h-24 w-24 object-contain"
                                animate={isLoading ? { rotate: 360 } : { y: [0, 15, 0] }}
                                transition={isLoading ?
                                    { duration: 2, repeat: Infinity, ease: "linear" } :
                                    { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                                }
                            />
                        ) : (
                            <motion.svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-purple-600"
                                animate={isLoading ? { rotate: 360 } : { y: [0, 15, 0] }}
                                transition={isLoading ?
                                    { duration: 2, repeat: Infinity, ease: "linear" } :
                                    { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                                }
                            >
                                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
                            </motion.svg>
                        )}
                    </div>
                    <NexusX1Box />
                    <SuggestionsBar onSuggest={onSuggest} />
                </motion.div>
            ) : (
                // Chat History Display
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                    <AnimatePresence>
                        {safeChatHistory.map((turn, index) => (
                            <React.Fragment key={turn.id || index}>
                                {/* User Message */}
                                {turn.role === 'user' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start justify-end gap-3"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="p-3 rounded-lg max-w-[80%] break-words text-white shadow-md"
                                            style={{ backgroundColor: '#232136' }}
                                        >
                                            <Markdown remarkPlugins={[remarkGfm]}>
                                                {turn.query}
                                            </Markdown>
                                            {turn.searchType === "image" && turn.imageUrl && (
                                                <img
                                                    src={turn.imageUrl}
                                                    alt="User Upload"
                                                    className="mt-2 max-w-full h-auto rounded-lg border border-blue-500/50"
                                                />
                                            )}
                                        </motion.div>
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                                className="text-2xl text-gray-400"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Model Response */}
                                {turn.role === 'model' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div 
                                            className="w-10 h-10 lg:md:flex hidden rounded-full items-center justify-center" 
                                            style={{ backgroundColor: 'rgba(108, 92, 231, 0.3)' }}
                                        >
                                            <img
                                                src={logo}
                                                alt="logo img"
                                                className="w-8 h-8 object-contain"
                                            />
                                        </div>
                                        {renderResponseContent(turn)}
                                    </motion.div>
                                )}
                            </React.Fragment>
                        ))}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-3 mt-6"
                        >
                            <motion.img
                                src={logo}
                                alt="logo-img"
                                className="w-8 h-8"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <div 
                                className="p-3 rounded-lg max-w-[80%] text-gray-300 shadow-md" 
                                style={{ backgroundColor: 'var(--background-secondary)' }}
                            >
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Thinking...
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex flex-col items-center justify-center p-8 mt-8 glass-effect rounded-lg border"
                        style={{
                            backgroundColor: 'rgba(220, 53, 69, 0.2)',
                            borderColor: 'rgba(220, 53, 69, 0.5)',
                        }}
                    >
                        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--error-color)' }}>
                            Error: {error}
                        </p>
                        <p style={{ color: 'var(--text-light)' }}>
                            Please try again or refine your query.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
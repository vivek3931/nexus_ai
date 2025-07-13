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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    // Responsive handling
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
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
        console.log("Rendering turn:", turn); // Log the entire turn object for debugging
        if (!turn.response) {
            console.log("Turn has no response object.");
            return null;
        }

        // Safely extract answer text
        const answerText = (
            typeof turn.response.answer === 'object' && 
            turn.response.answer !== null && 
            typeof turn.response.answer.text === 'string'
        ) ? turn.response.answer.text 
          : (typeof turn.response.answer === 'string' ? turn.response.answer : null);

        console.log("Answer Text:", answerText);
        console.log("PDF URL:", turn.response.pdfUrl);
        console.log("Is Image Analysis (turn.searchType === 'image'):", turn.searchType === "image");
        console.log("Images (turn.response.images):", turn.response.images);
        console.log("Google Links (turn.response.googleLinks):", turn.response.googleLinks);
        console.log("Image URL (turn.imageUrl):", turn.imageUrl); // Log turn.imageUrl directly

        const pdfUrl = turn.response.pdfUrl;
        const isCodeResponse = shouldRenderAsCode(turn.query, answerText);
        const hasSidebarContent = turn.response.images?.length > 0 || turn.response.googleLinks?.length > 0;
        const isImageAnalysis = turn.searchType === "image";

        let contentToRender;

        // PDF Rendering
        if (pdfUrl) {
            console.log("Rendering PDF link.");
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
                        className="font-semibold py-3 px-4 rounded-md transition-all duration-200 shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                        style={{
                            background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                            color: 'white',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent-darker), var(--secondary-accent-darker))';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))';
                        }}
                    >
                        <FileText className="w-5 h-5" />
                        <span className="text-sm sm:text-base">Download Generated PDF</span>
                    </a>
                </motion.div>
            );
        }
        // Image Analysis Results (This branch handles cases where the main response is an image analysis)
        else if (isImageAnalysis && answerText) {
            console.log("Rendering Image Analysis results.");
            // ResultsDisplay is designed to handle image analysis with its own internal layout
            contentToRender = (
                <div className="w-full">
                    <ResultsDisplay
                        data={{ ...turn.response, imageUrl: turn.imageUrl }} // Pass turn.imageUrl here for the main image
                        searchType={turn.searchType}
                    />
                </div>
            );
        }
        // Code Rendering
        else if (isCodeResponse && answerText && !pdfUrl) {
            console.log("Rendering Code Response.");
            const parts = extractCodeBlocksAndText(answerText);
            contentToRender = (
                <div className="w-full space-y-4">
                    {parts.map((part, partIndex) => (
                        part.type === "text" ? (
                            <motion.div
                                key={partIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 sm:p-4 rounded-lg shadow-md"
                                style={{ backgroundColor: 'var(--background-secondary)', color: 'var(--text-primary)' }}
                            >
                                <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                                    <Markdown remarkPlugins={[remarkGfm]}>{part.content}</Markdown>
                                </div>
                            </motion.div>
                        ) : (
                            <div key={partIndex} className="w-full">
                                <CodeBlock
                                    language={part.language}
                                    sourceCode={part.sourceCode}
                                    output={part.output}
                                />
                            </div>
                        )
                    ))}
                </div>
            );
        }
        // External Search Results (using ResultsDisplay component for text, images, links)
        else if (hasSidebarContent && answerText) {
            console.log("Rendering External Search Results via ResultsDisplay.");
            contentToRender = (
                <div className="w-full">
                    <ResultsDisplay
                        data={turn.response} // ResultsDisplay expects data.images and data.googleLinks directly
                        searchType={turn.searchType}
                    />
                </div>
            );
        }
        // Default Text Rendering (plain Markdown without sidebars or special types)
        else if (answerText) {
            console.log("Rendering Default Text Response.");
            contentToRender = (
                <div className="prose prose-sm sm:prose-base prose-invert max-w-none" style={{ color: 'var(--text-primary)' }}>
                    <Markdown remarkPlugins={[remarkGfm]}>{answerText}</Markdown>
                </div>
            );
        }
        // Fallback
        else {
            console.log("Rendering Fallback: No textual answer provided.");
            contentToRender = (
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
                    No textual answer provided for this response.
                </p>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    p-3 sm:p-4 md:p-5 rounded-lg shadow-md
                    ${isMobile 
                        ? 'w-full max-w-none min-w-0' 
                        : 'max-w-[85%] min-w-[60%]'
                    }
                    break-words overflow-hidden
                `}
                style={{  color: 'var(--text-primary)' }}
            >
                {contentToRender}
            </motion.div>
        );
    }, [isMobile]);

    return (
        <div className="flex-grow flex flex-col pt-4 sm:pt-8 pb-[100px] sm:pb-[120px] px-2 sm:px-4 md:px-8 custom-scrollbar">
            {/* Authentication Prompt Modal */}
            <AnimatePresence>
                {showAuthPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black/70 z-[100] backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-effect p-6 sm:p-8 rounded-xl shadow-lg text-center max-w-sm w-full relative border"
                            style={{
                                backgroundColor: 'var(--background-secondary)',
                                borderColor: 'var(--border-primary)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <button
                                onClick={handleAuthCancel}
                                className="absolute top-4 right-4 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4">
                                Continue with Free Account
                            </h2>
                            <p className="mb-6 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                                You've used your free searches! Create a free account to continue
                                using our AI search.
                            </p>
                            <div className="flex flex-col space-y-4">
                                <button
                                    className="font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base"
                                    style={{
                                        backgroundColor: 'var(--primary-accent)',
                                        color: 'white',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--primary-accent-darker)';
                                        e.currentTarget.style.boxShadow = '0 4px 10px var(--primary-accent-medium-opacity)';
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
                                    className="font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base"
                                    style={{
                                        backgroundColor: 'var(--background-tertiary)',
                                        color: 'var(--text-primary)',
                                    }}
                                    onMouseEnter={(e) => 
                                        e.currentTarget.style.backgroundColor = 'var(--border-primary)'
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
                    className="glass-effect p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 shadow-md border space-y-2 sm:space-y-0"
                    style={{
                        backgroundColor: 'var(--background-secondary)',
                        borderColor: 'var(--border-primary)',
                    }}
                >
                    <div className="trial-info text-xs sm:text-sm text-center sm:text-left" style={{ color: 'var(--text-primary)' }}>
                        <span>Free Trial: </span>
                        {getRemainingSearches() !== null && (
                            <span>{getRemainingSearches()} searches left</span>
                        )}
                        {getRemainingTime() !== null && getRemainingTime() > 0 && (
                            <span> • {Math.ceil(getRemainingTime())} minutes remaining</span>
                        )}
                    </div>
                    <button
                        className="text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-md transition-all duration-200 shadow-sm w-full sm:w-auto"
                        style={{
                            background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                            color: 'white',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-accent-darker), var(--secondary-accent-darker))';
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
                    className="flex flex-col items-center justify-center flex-grow px-4"
                >
                    <div className="flex justify-center items-center h-48 sm:h-64 mb-6 sm:mb-8">
                        {logo ? (
                            <motion.img
                                src={logo}
                                alt="nexus ai"
                                className="h-16 w-16 sm:h-24 sm:w-24 object-contain"
                                animate={isLoading ? { rotate: 360 } : { y: [0, 15, 0] }}
                                transition={isLoading ?
                                    { duration: 2, repeat: Infinity, ease: "linear" } :
                                    { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                                }
                            />
                        ) : (
                            <motion.svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="sm:w-12 sm:h-12"
                                style={{ color: 'var(--primary-accent)' }}
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
                <div className="space-y-4 sm:space-y-6 max-w-full mx-auto w-full">
                    <AnimatePresence>
                        {safeChatHistory.map((turn, index) => (
                            <React.Fragment key={turn.id || index}>
                                {/* User Message */}
                                {turn.role === 'user' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start justify-end gap-2 sm:gap-3"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className={`
                                                p-3 sm:p-4 rounded-lg shadow-md
                                                ${isMobile 
                                                    ? 'max-w-[85%] min-w-[60%]' 
                                                    : 'max-w-[80%]'
                                                }
                                                break-words overflow-hidden
                                            `}
                                            style={{ backgroundColor: 'var(--user-message-bg)', color: 'var(--user-message-text)' }}
                                        >
                                            <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                                                <Markdown remarkPlugins={[remarkGfm]}>
                                                    {turn.query}
                                                </Markdown>
                                            </div>
                                            {turn.searchType === "image" && turn.imageUrl && (
                                                <img
                                                    src={turn.imageUrl}
                                                    alt="User Upload"
                                                    className="mt-2 w-full h-auto rounded-lg border"
                                                    style={{ borderColor: 'var(--border-primary)' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "[https://placehold.co/200x200/1e1e1e/FFFFFF?text=Image+Error](https://placehold.co/200x200/1e1e1e/FFFFFF?text=Image+Error)"; }}
                                                />
                                            )}
                                        </motion.div>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                             style={{ backgroundColor: 'var(--user-icon-bg)' }}>
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                                className="text-lg sm:text-2xl"
                                                style={{ color: 'var(--user-icon-color)' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Model Response */}
                                {turn.role === 'model' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-2 sm:gap-3"
                                    >
                                        <div 
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center flex-shrink-0 hidden sm:flex" 
                                            style={{ backgroundColor: 'var(--model-icon-bg)' }}
                                        >
                                            <img
                                                src={logo}
                                                alt="logo img"
                                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
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
                            className="flex items-start gap-2 sm:gap-3 mt-4 sm:mt-6"
                        >
                            <motion.img
                                src={logo}
                                alt="logo-img"
                                className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <div 
                                className="p-3 sm:p-4 rounded-lg shadow-md flex-1" 
                                style={{ backgroundColor: 'var(--background-secondary)', color: 'var(--text-primary)' }}
                            >
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                <span className="text-sm sm:text-base">Thinking...</span>
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
                        className="flex flex-col items-center justify-center p-4 sm:p-8 mt-4 sm:mt-8 glass-effect rounded-lg border"
                        style={{
                            backgroundColor: 'var(--error-color-low-opacity)',
                            borderColor: 'var(--error-color)',
                        }}
                    >
                        <p className="text-base sm:text-lg font-semibold mb-2 text-center" style={{ color: 'var(--error-color)' }}>
                            Error: {error}
                        </p>
                        <p className="text-sm sm:text-base text-center" style={{ color: 'var(--text-primary)' }}>
                            Please try again or refine your query.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;

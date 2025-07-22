import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faMagic, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import useAuth from your AuthContext
import { useAuth } from './AuthContext/AuthContext';

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

const handlePdfDownload = async (pdfUrl) => {
    try {
        console.log('Downloading PDF from:', pdfUrl);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `ai-response-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Download failed, trying fallback:', error);
        try {
            const response = await fetch(pdfUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ai-response-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (fetchError) {
            console.error('Fetch fallback failed:', fetchError);
            window.open(pdfUrl, '_blank');
        }
    }
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
        if (match.index > lastIndex) {
            const textContent = markdownString.substring(lastIndex, match.index).trim();
            if (textContent) {
                parts.push({ type: "text", content: textContent });
            }
        }

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

// Memoized component to prevent unnecessary re-renders
const MemoizedResultsDisplay = React.memo(({ data, searchType, turnId }) => {
    return (
        <div key={`search-results-${turnId}`} className="w-full">
            <ResultsDisplay data={data} searchType={searchType} />
        </div>
    );
});

const MemoizedImageAnalysisDisplay = React.memo(({ data, imageUrl, turnId }) => {
    return (
        <div key={`image-analysis-${turnId}`} className="w-full">
            <ResultsDisplay
                data={{ ...data, imageUrl }}
                searchType="image"
            />
        </div>
    );
});

// --- Main App Component ---

function App({
    isLoading,
    error,
    onSuggest,
    showAuthPrompt,
    handleAuthCancel,
    handleAuthSuccess,
    getRemainingSearches,
    getRemainingTime,
    chatHistory,
    hasSearched,
    onGeneratePdfClick,
}) {
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const isProSubscriber = user?.isProUser || false;

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

    // Stable memoized content rendering with proper dependencies
    const memoizedTurnContent = useMemo(() => {
        return safeChatHistory.map((turn, index) => {
            if (turn.role !== 'model' || !turn.response) {
                return { turn, content: null, turnId: turn.id || `turn-${index}` };
            }

            const turnId = turn.id || `turn-${index}`;
            const answerText = (
                typeof turn.response.answer === 'object' &&
                turn.response.answer !== null &&
                typeof turn.response.answer.text === 'string'
            ) ? turn.response.answer.text
              : (typeof turn.response.answer === 'string' ? turn.response.answer : null);

            const pdfUrl = turn.response.pdfUrl;
            const hasCodeBlocksInResponse = answerText && answerText.includes('```');
            const hasImagesInResponse = turn.response.images?.length > 0;
            const hasGoogleLinksInResponse = turn.response.googleLinks?.length > 0;
            const isImageAnalysisResponse = turn.searchType === "image";

            let contentToRender;

            if (isProSubscriber) {
                // Pro Subscriber: All features enabled
                if (pdfUrl) {
                    contentToRender = (
                        <div className="flex items-center justify-center p-4" key={`pdf-${turnId}`}>
                            <button
                                onClick={() => handlePdfDownload(pdfUrl)}
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
                            </button>
                        </div>
                    );
                }
                else if (isImageAnalysisResponse && answerText) {
                    contentToRender = (
                        <MemoizedImageAnalysisDisplay
                            data={turn.response}
                            imageUrl={turn.imageUrl}
                            turnId={turnId}
                        />
                    );
                }
                else if (hasCodeBlocksInResponse && answerText && !pdfUrl) {
                    const parts = extractCodeBlocksAndText(answerText);
                    contentToRender = (
                        <div className="w-full space-y-4" key={`code-blocks-${turnId}`}>
                            {parts.map((part, partIndex) => (
                                part.type === "text" ? (
                                    <div
                                        key={`text-${turnId}-${partIndex}`}
                                        className="p-3 sm:p-4 rounded-lg shadow-md"
                                        style={{ backgroundColor: 'var(--background-secondary)', color: 'var(--text-primary)' }}
                                    >
                                        <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                                            <Markdown remarkPlugins={[remarkGfm]}>{part.content}</Markdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`code-${turnId}-${partIndex}`} className="w-full">
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
                else if ((hasImagesInResponse || hasGoogleLinksInResponse) && answerText) {
                    contentToRender = (
                        <MemoizedResultsDisplay
                            data={turn.response}
                            searchType={turn.searchType}
                            turnId={turnId}
                        />
                    );
                }
                else if (answerText) {
                    contentToRender = (
                        <div className="prose prose-sm sm:prose-base prose-invert max-w-none" style={{ color: 'var(--text-primary)' }} key={`text-${turnId}`}>
                            <Markdown remarkPlugins={[remarkGfm]}>{answerText}</Markdown>
                        </div>
                    );
                }
                else {
                    contentToRender = (
                        <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }} key={`no-text-${turnId}`}>
                            No textual answer provided for this response.
                        </p>
                    );
                }
            }
            else {
                // Free User: Always show the basic text response if available
                if (answerText) {
                    contentToRender = (
                        <div className="w-full space-y-4" key={`free-${turnId}`}>
                            {/* Always show the text content */}
                            <div className="prose prose-sm sm:prose-base prose-invert max-w-none" style={{ color: 'var(--text-primary)' }}>
                                <Markdown remarkPlugins={[remarkGfm]}>{answerText}</Markdown>
                            </div>
                            
                            {/* Show upgrade prompt for Pro features if they exist */}
                            {(pdfUrl || hasImagesInResponse || hasGoogleLinksInResponse || hasCodeBlocksInResponse || isImageAnalysisResponse) && (
                                <div className="p-4 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300 text-center">
                                    <p className="font-semibold mb-2">Upgrade to Pro to unlock additional features!</p>
                                    <button
                                        onClick={() => navigate('/membership')}
                                        className="text-sm font-semibold py-2 px-4 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                                    >
                                        Learn More
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                } else {
                    // Fallback if no text answer
                    contentToRender = (
                        <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }} key={`fallback-${turnId}`}>
                            No textual answer provided for this response.
                        </p>
                    );
                }
            }

            return { turn, content: contentToRender, turnId };
        });
    }, [safeChatHistory, isProSubscriber, navigate]); // Stable dependencies only

    const renderResponseContent = useCallback((turnData) => {
        if (!turnData.content) return null;

        return (
            <div
                className={`
                    lg:md:p-3 md:p-5 rounded-lg shadow-md
                    ${isMobile
                        ? 'w-full max-w-none min-w-0'
                        : 'max-w-[85%] min-w-[60%]'
                    }
                    break-words overflow-hidden
                `}
                style={{ color: 'var(--text-primary)' }}
            >
                {turnData.content}
            </div>
        );
    }, [isMobile]);

    return (
        <div className="flex-grow flex flex-col pt-4 sm:pt-8 pb-[100px] sm:pb-[120px] lg:md:px-4 md:px-8 custom-scrollbar">
            {/* Authentication Prompt Modal */}
            <AnimatePresence>
                {showAuthPrompt && !isProSubscriber && (
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
            {!isAuthenticated && !isProSubscriber && (getRemainingSearches() !== null || getRemainingTime() !== null) && (
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
                        onClick={() => navigate('/membership')}
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
                                <path d="M12 12c-2-2.67-4-4-6-4a4 4 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
                            </motion.svg>
                        )}
                    </div>
                    <NexusX1Box isProSubscriber={isProSubscriber} />
                    <SuggestionsBar onSuggest={onSuggest} isProSubscriber={isProSubscriber} />
                </motion.div>
            ) : (
                // Chat History Display
                <div className="space-y-4 sm:space-y-6 max-w-full mx-auto w-full">
                    <AnimatePresence mode="popLayout">
                        {memoizedTurnContent.map((turnData, index) => (
                            <React.Fragment key={turnData.turnId}>
                                {/* User Message */}
                                {turnData.turn.role === 'user' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start justify-end gap-2 sm:gap-3"
                                        layout
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
                                                    {turnData.turn.query}
                                                </Markdown>
                                            </div>
                                            {turnData.turn.searchType === "image" && turnData.turn.imageUrl && (
                                                <img
                                                    src={turnData.turn.imageUrl}
                                                    alt="User Upload"
                                                    className="mt-2 w-full h-auto rounded-lg border"
                                                    style={{ borderColor: 'var(--border-primary)' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200/1e1e1e/FFFFFF?text=Image+Error"; }}
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
                                {turnData.turn.role === 'model' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-2 sm:gap-3"
                                        layout
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
                                        {renderResponseContent(turnData)}
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
                        animate={{ opacity: 1 }}
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
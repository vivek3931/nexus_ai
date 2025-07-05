// ai-layout-project/frontend/src/components/DashboardContent/DashboardContent.jsx

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faMagic, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CodeBlock from "./components/CodeBlock/CodeBlock"; // Adjust path if needed
import ResultsDisplay from "./components/ResultDisplay/ResultDisplay"; // Adjust path if needed
import SuggestionsBar from "./components/SuggestionBar/SuggestionBar"; // Adjust path if needed
import SoulX3Box from "./components/SoulX3Box/SoulX3Box"; // Adjust path if needed
import logo from '../src/assets/soul_logo.svg'
// Memoized helper functions (Keep as is)
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

const shouldRenderAsCode = (query, responseText) => {
    return isCodeRelatedQuery(query) && responseText?.includes('```');
};


function DashboardContent({
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
    hasSearched, // This prop is used here
}) {
    const messagesEndRef = useRef(null);
    const safeChatHistory = useMemo(() => Array.isArray(chatHistory) ? chatHistory : [], [chatHistory]);
    const shouldShowWelcomeScreen = useMemo(() =>
        safeChatHistory.length === 0 && !isLoading && !hasSearched,
        [safeChatHistory, isLoading, hasSearched]
    );
    const navigate = useNavigate();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end" // Changed to 'end' to ensure the very end of messages is visible
        });
    }, [chatHistory, isLoading]);

    // Lock body scroll when auth prompt is shown
    useEffect(() => {
        if (showAuthPrompt) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [showAuthPrompt]);

    const renderResponseContent = useCallback((turn) => {
        if (!turn.response) return null;

        if (turn.response.answer && typeof turn.response.answer.text === "string") {
            const answerText = turn.response.answer.text;
            const isCodeResponse = shouldRenderAsCode(turn.query, answerText);
            const hasSidebarContent = turn.response.images?.length > 0 || turn.response.googleLinks?.length > 0;

            if (isCodeResponse) {
                const parts = extractCodeBlocksAndText(answerText);
                return (
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
            } else if (hasSidebarContent) {
                return (
                    <ResultsDisplay
                        data={turn.response}
                        searchType={turn.searchType}
                    />
                );
            } else {
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg max-w-[80%] break-words text-gray-200 shadow-md"
                        style={{ backgroundColor: 'var(--background-secondary)' }}
                    >
                        <Markdown remarkPlugins={[remarkGfm]}>{answerText}</Markdown>
                    </motion.div>
                );
            }
        } else if (typeof turn.response === "string") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg max-w-[80%] break-words text-gray-200 shadow-md"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                >
                    <Markdown remarkPlugins={[remarkGfm]}>{turn.response}</Markdown>
                </motion.div>
            );
        }

        return (
            <div className="p-3 rounded-lg max-w-[80%] break-words text-gray-200 shadow-md" style={{ backgroundColor: 'var(--background-secondary)' }}>
                <div className="text-gray-400 italic">Unable to display response format</div>
            </div>
        );
    }, []); 

    return (
        
        <div className="flex-grow flex flex-col pt-8 pb-[100px] sm:pb-[120px] px-4 sm:px-8 custom-scrollbar"> 
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
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background-tertiary)'}
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
                        onClick={() => { navigate('/login'); }}
                    >
                        Get Unlimited Access
                    </button>
                </motion.div>
            )}

            {/* Chat messages / Welcome screen */}
            {shouldShowWelcomeScreen ? (
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
                    <SoulX3Box />
                    <SuggestionsBar onSuggest={onSuggest} />
                </motion.div>
            ) : (
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                    <AnimatePresence>
                        {safeChatHistory.map((turn, index) => (
                            <React.Fragment key={turn.id || index}>
                                {/* User message */}
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
                                            <Markdown remarkPlugins={[remarkGfm]}>{turn.query}</Markdown>
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

                                {/* Model response */}
                                {turn.role === 'model' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-10 h-10 lg:md:flex hidden rounded-full  items-center justify-center" style={{ backgroundColor: 'rgba(108, 92, 231, 0.3)'  }}>
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
                            <div className="p-3 rounded-lg max-w-[80%] text-gray-300 shadow-md" style={{ backgroundColor: 'var(--background-secondary)' }}>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Thinking...
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
            {/* Error Display - remains here, within DashboardContent, as it's directly related to search results */}
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
                        <p style={{ color: 'var(--text-light)' }}>Please try again or refine your query.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default React.memo(DashboardContent);
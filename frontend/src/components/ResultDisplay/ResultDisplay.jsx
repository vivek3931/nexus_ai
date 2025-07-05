import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagic,
    faShareAlt,
    faEllipsisH,
    faPlayCircle,
    faCopy,
    faLink,
    faImage,
    faCode,
    faFileText,
    faTimes,
    faCheck,
    faPrint,
    faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import logo from '../../assets/soul_logo.svg';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

// You might still want a global CSS file (e.g., src/index.css) for custom properties
// and keyframe animations that Tailwind doesn't directly handle with simple classes.
// For example:
// :root {
//   --header-height: 80px;
//   --footer-height: 60px;
//   --app-vertical-padding: 30px;
//   --primary-accent: #6C5CE7; /* Example purple */
//   --text-light: #E0E0E0; /* Example light text */
//   --text-muted: #A0A0A0; /* Example muted text */
//   --background-secondary: #2C2C2C; /* Example darker background */
//   --border-color: #444; /* Example border color */
//
//   /* Glass effect variables */
//   --glass-background: rgba(30, 30, 30, 0.6);
//   --glass-border: rgba(255, 255, 255, 0.1);
//   --glass-backdrop-filter: blur(15px);
//   --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
//
//   --transition-base: 0.3s ease;
//   --shadow-medium: 0 4px 10px rgba(0,0,0,0.3);
// }
//
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
//
// @keyframes paragraphFadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
//
// @keyframes pulse {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.5; }
// }


const ResultsDisplay = ({ data }) => {
    console.log("ResultsDisplay received data:", data);

    const [displayedParagraphs, setDisplayedParagraphs] = useState([]);
    const [displayKey, setDisplayKey] = useState(0);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [expandedImage, setExpandedImage] = useState(null);

    if (!data) {
        return (
            <div
                className="w-full max-w-5xl mx-auto mt-10 p-8 rounded-2xl min-h-[200px] bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)]"
                style={{
                    maxHeight: 'calc(100vh - (var(--header-height) + var(--footer-height) + (var(--app-vertical-padding) * 2) + 150px))',
                    overflowY: 'auto',
                    animation: 'fadeIn 0.5s ease-out forwards'
                }}
            >
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-semibold text-[var(--text-light)] flex items-center gap-3 m-0">
                        <FontAwesomeIcon icon={faMagic} className="text-2xl text-[var(--primary-accent)]" />
                        No Data
                    </h2>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-background)] backdrop-blur-[var(--glass-backdrop-filter)] border-[1px] border-[var(--glass-border)] shadow-[var(--glass-shadow)] text-[var(--text-light)] text-lg leading-relaxed overflow-x-auto break-words">
                    <p>We couldn't retrieve any information for your query. Please try again.</p>
                </div>
            </div>
        );
    }

    const { answer, images, socialHandles, googleLinks } = data;

    if (!answer || typeof answer.text !== 'string') {
        return (
            <div
                className="w-full max-w-5xl mx-auto mt-10 p-8 rounded-2xl min-h-[200px] bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)]"
                style={{
                    maxHeight: 'calc(100vh - (var(--header-height) + var(--footer-height) + (var(--app-vertical-padding) * 2) + 150px))',
                    overflowY: 'auto',
                    animation: 'fadeIn 0.5s ease-out forwards'
                }}
            >
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-semibold text-[var(--text-light)] flex items-center gap-3 m-0">
                        <FontAwesomeIcon icon={faMagic} className="text-2xl text-red-500" />
                        Unexpected Response Format
                    </h2>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-background)] backdrop-blur-[var(--glass-backdrop-filter)] border-[1px] border-[var(--glass-border)] shadow-[var(--glass-shadow)] text-[var(--text-light)] text-lg leading-relaxed overflow-x-auto break-words">
                    <p>The received data has an unexpected format. Expected `answer.text` to be a string.</p>
                    <pre className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-3 rounded-md text-gray-300">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    useEffect(() => {
        setDisplayedParagraphs([]);
        setDisplayKey(prevKey => prevKey + 1);
        setIsTypingComplete(false);

        const paragraphs = answer.text
            .split(/\n\s*\n/)
            .filter(p => p.trim() !== '')
            .map(p => p.trim());

        if (paragraphs.length === 0) {
            setIsTypingComplete(true);
            return;
        }

        let index = 0;
        const intervalId = setInterval(() => {
            if (index < paragraphs.length) {
                setDisplayedParagraphs(prev => [...prev, paragraphs[index]]);
                index++;
            } else {
                setIsTypingComplete(true);
                clearInterval(intervalId);
            }
        }, 80);

        return () => clearInterval(intervalId);
    }, [answer.text]);

    const containsCodeBlock = answer.text.includes('```');
    const shouldShowImages = (images && images.length > 0) && !containsCodeBlock;
    const shouldShowLinks = (googleLinks && googleLinks.length > 0);
    const shouldShowSocials = (socialHandles && socialHandles.length > 0);
    const shouldShowSidebar = shouldShowImages || shouldShowLinks || shouldShowSocials;

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopyFeedback(true);
            setTimeout(() => setShowCopyFeedback(false), 2000);
        } catch (err) {
            console.error("Failed to copy text:", err);
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setShowCopyFeedback(true);
            setTimeout(() => setShowCopyFeedback(false), 2000);
        }
    };

    const handleShare = async () => {
        const textToShare = displayedParagraphs.join("\n\n");
        try {
            await navigator.share({
                title: answer.title || "AI Response",
                text: textToShare,
            });
        } catch (err) {
            console.error('Error sharing:', err);
            handleCopy(textToShare);
        }
    };

    const handleVideoPlay = () => {
        setIsPlaying(true);
        console.log("Play video for:", answer.videoThumbnail?.src);
    };

    const markdownComponents = {
        p: ({ children }) => (
            <motion.p
                className="leading-relaxed text-[1.05em] text-[var(--text-light)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.p>
        ),
        code: ({ inline, children }) => (
            inline ? (
                <code className="bg-[rgba(108,92,231,0.2)] rounded-md px-1.5 py-0.5 font-mono text-sm text-[#a8e6cf]">
                    {children}
                </code>
            ) : (
                <motion.div
                    className="mt-4 bg-gray-800 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex justify-between items-center bg-gray-700 px-4 py-2 text-gray-300 text-sm">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCode} className="text-blue-400" />
                            Code Block
                        </span>
                        <button
                            onClick={() => handleCopy(children.toString())}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faCopy} className="mr-1" />
                            Copy
                        </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-gray-200">
                        <code className="block font-mono text-sm">
                            {children}
                        </code>
                    </pre>
                </motion.div>
            )
        ),
        a: ({ href, children }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary-accent)] hover:underline flex items-center gap-1 inline-flex"
            >
                {children} <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
            </a>
        ),
        h1: ({ children }) => (
            <motion.h1
                className="text-4xl font-bold text-[var(--primary-accent)] mt-6 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.h1>
        ),
        h2: ({ children }) => (
            <motion.h2
                className="text-3xl font-bold text-[var(--primary-accent)] mt-6 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.h2>
        ),
        h3: ({ children }) => (
            <motion.h3
                className="text-2xl font-semibold text-[var(--primary-accent)] mt-6 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.h3>
        ),
        h4: ({ children }) => (
            <motion.h4
                className="text-xl font-semibold text-[var(--primary-accent)] mt-6 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.h4>
        ),
        ul: ({ children }) => (
            <motion.ul
                className="mb-4 pl-5 list-disc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.ul>
        ),
        ol: ({ children }) => (
            <motion.ol
                className="mb-4 pl-5 list-decimal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.ol>
        ),
        li: ({ children }) => (
            <li className="mb-2">
                {children}
            </li>
        ),
        blockquote: ({ children }) => (
            <motion.blockquote
                className="border-l-4 border-[var(--primary-accent)] pl-4 py-2 italic text-[var(--text-muted)] my-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.blockquote>
        ),
        table: ({ children }) => (
            <motion.div
                className="overflow-x-auto my-4 rounded-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <table className="min-w-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--text-light)] rounded-md overflow-hidden">
                    {children}
                </table>
            </motion.div>
        ),
        td: ({ children }) => (
            <td className="p-3 border border-[var(--border-color)]">
                {children}
            </td>
        ),
        th: ({ children }) => (
            <th className="p-3 border border-[var(--border-color)] bg-[var(--primary-accent)] text-white text-left">
                {children}
            </th>
        ),
        strong: ({ children }) => (
            <strong className="font-bold text-[var(--primary-accent)]">
                {children}
            </strong>
        ),
        em: ({ children }) => (
            <em className="italic text-[var(--text-light)]">
                {children}
            </em>
        ),
        hr: () => (
            <motion.hr
                className="border-t border-[var(--border-color)] my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            />
        ),
    };

    return (
        <div
            className="w-full max-w-5xl mx-auto mt-10 flex flex-col gap-6 p-8 rounded-2xl min-h-[200px] bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)] custom-scrollbar"
            key={displayKey}
            style={{
                maxHeight: 'calc(100vh - (var(--header-height) + (var(--app-vertical-padding) * 2) + 150px))',
                overflowY: 'auto',
                animation: 'fadeIn 0.5s ease-out forwards'
            }}
        >
            <motion.div
                className="flex items-center justify-between mb-6 px-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-4">
                    <img src={logo} className="w-12 h-auto rounded-xl shadow-lg" alt="Logo" />
                </div>

                <div className="flex items-center gap-3 relative">
                    <AnimatePresence>
                        {showCopyFeedback && (
                            <motion.span
                                className="flex items-center gap-2 bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                Copied!
                            </motion.span>
                        )}
                    </AnimatePresence>

                    <FontAwesomeIcon
                        icon={faShareAlt}
                        className="text-xl text-[var(--text-light)] cursor-pointer opacity-70 transition-all duration-300 p-2 rounded-lg hover:opacity-100 hover:bg-[var(--glass-background)] hover:backdrop-blur-md hover:text-[var(--primary-accent)]"
                        onClick={handleShare}
                    />
                    <DropdownMenu
                        answerText={displayedParagraphs.join("\n\n")}
                        onCopySuccess={() => setShowCopyFeedback(true)}
                    />
                </div>
            </motion.div>

            <div className={`flex flex-wrap w-full items-start gap-6 ${shouldShowSidebar ? 'flex-col md:flex-row' : 'flex-col'}`}>
                <div
                    className="flex-1 w-full p-5 rounded-xl bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)] text-[var(--text-light)] text-lg leading-relaxed overflow-x-auto break-words relative"
                    style={{ minWidth: shouldShowSidebar ? '300px' : 'auto' }}
                >
                    <h3 className="text-2xl font-semibold text-[var(--primary-accent)] mb-4">{answer.title}</h3>

                    {!isTypingComplete && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-800/30 border border-purple-800/60 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                            <span className="text-xs text-purple-200">Generating</span>
                        </div>
                    )}

                    <AnimatePresence key={displayKey}>
                        {displayedParagraphs.map((paragraph, idx) => (
                            <motion.div
                                key={`${displayKey}-${idx}`}
                                className="mb-4" // Tailwind equivalent for margin-bottom
                                style={{ animationDelay: `${idx * 0.05}s`, animation: 'paragraphFadeIn 0.4s ease-out forwards' }} // Applying specific animation
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {paragraph}
                                </ReactMarkdown>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {!isTypingComplete && displayedParagraphs.length > 0 && (
                        <div className="inline-block w-0.5 h-6 bg-[var(--primary-accent)] rounded-full animate-pulse ml-1"></div>
                    )}

                    {answer.videoThumbnail && (
                        <motion.div
                            className="relative w-full mt-5 rounded-lg overflow-hidden cursor-pointer"
                            onClick={handleVideoPlay}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <img
                                src={answer.videoThumbnail.src}
                                alt={answer.videoThumbnail.alt || "Video Thumbnail"}
                                className="w-full h-auto block"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x450/1e1e1e/FFFFFF?text=Video+Thumbnail`; }}
                            />
                            <FontAwesomeIcon
                                icon={faPlayCircle}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl text-white/80 bg-black/50 rounded-full p-2 transition-all duration-300 hover:scale-110 hover:text-[var(--primary-accent)]"
                            />
                        </motion.div>
                    )}
                </div>

                {shouldShowSidebar && (
                    <div className="flex-1 w-full md:min-w-[280px] flex flex-col gap-5">
                        {shouldShowSocials && (
                            <motion.div
                                className="p-4 rounded-xl bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <h3 className="text-xl text-[var(--primary-accent)] mb-4">Social Handles</h3>
                                <div className="flex flex-col gap-2.5">
                                    {socialHandles.map((handle, index) => (
                                        <a href={handle.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center gap-2.5 text-[var(--text-muted)] no-underline transition-colors duration-300 hover:text-[var(--primary-accent)]">
                                            <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
                                            <span>{handle.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {shouldShowImages && (
                            <motion.div
                                className="p-4 rounded-xl bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <h3 className="text-xl text-[var(--primary-accent)] mb-4">Images from Google</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-2.5">
                                    {images.slice(0, 4).map((img, index) => (
                                        <motion.a
                                            key={index}
                                            href={img.src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => { e.preventDefault(); setExpandedImage(img.src); }}
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <img
                                                src={img.src}
                                                alt={img.alt || `Image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg transition-transform duration-300 cursor-pointer"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/1e1e1e/FFFFFF?text=Image+${index + 1}`; }}
                                            />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {shouldShowLinks && (
                            <motion.div
                                className="p-4 rounded-xl bg-[var(--glass-background)] border-[1px] border-[var(--glass-border)] backdrop-blur-[var(--glass-backdrop-filter)] shadow-[var(--glass-shadow)]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <h3 className="text-xl text-[var(--primary-accent)] mb-4">Related Links</h3>
                                <ul className="list-none p-0 m-0">
                                    {googleLinks.slice(0, 3).map((link, index) => (
                                        <motion.li
                                            key={index}
                                            className="mb-4 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--background-secondary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-medium)] last:mb-0"
                                            whileHover={{ y: -3, boxShadow: 'var(--shadow-medium)' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-accent)] no-underline font-bold text-lg block mb-1 hover:underline">
                                                {link.title}
                                            </a>
                                            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-1">
                                                {link.snippet}
                                            </p>
                                            <span className="text-[var(--text-muted)] text-xs block">
                                                {new URL(link.url).hostname}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {expandedImage && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedImage(null)}
                    >
                        <motion.div
                            className="relative max-w-4xl w-full max-h-[90vh]"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={expandedImage}
                                alt="Expanded view"
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <button
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                onClick={() => setExpandedImage(null)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function DropdownMenu({ answerText, onCopySuccess }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(answerText);
            onCopySuccess();
            setOpen(false);
        } catch (err) {
            console.error("Failed to copy text:", err);
            const textarea = document.createElement('textarea');
            textarea.value = answerText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            onCopySuccess();
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <FontAwesomeIcon
                icon={faEllipsisH}
                className="text-xl text-[var(--text-light)] cursor-pointer opacity-70 transition-all duration-300 p-2 rounded-lg hover:opacity-100 hover:bg-[var(--glass-background)] hover:backdrop-blur-md hover:text-[var(--primary-accent)]"
                onClick={() => setOpen(v => !v)}
            />

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="absolute right-0 top-[calc(100%+8px)] w-44 bg-[var(--glass-background)] backdrop-blur-[var(--glass-backdrop-filter)] rounded-xl shadow-[var(--glass-shadow)] border border-[var(--glass-border)] z-50 overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[var(--text-light)] bg-transparent border-none cursor-pointer transition-colors duration-[var(--transition-base)] hover:bg-gray-700/50 hover:text-[var(--primary-accent)]"
                            onClick={handleCopy}
                        >
                            <FontAwesomeIcon icon={faCopy} />
                            <span>Copy Text</span>
                        </button>
                        <button
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[var(--text-light)] bg-transparent border-none cursor-pointer transition-colors duration-[var(--transition-base)] hover:bg-gray-700/50 hover:text-[var(--primary-accent)]"
                            onClick={() => {
                                window.print();
                                setOpen(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faPrint} />
                            <span>Print</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResultsDisplay;
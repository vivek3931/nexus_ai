import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faMagic,
  faImage,
  faFileText,
  faLink,
  faCopy,
  faShareAlt,
  faEllipsisH,
  faTimes,
  faCheck,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/soul_logo.svg"; // Ensure this path is correct and the SVG is theme-neutral

const CopyDropdown = ({ text, onCopySuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      onCopySuccess();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)] focus:ring-opacity-50"
        aria-label="More options"
      >
        <FontAwesomeIcon icon={faEllipsisH} className="text-[var(--text-muted)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50 overflow-hidden" // Changed border-color to border-primary
          >
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-3 hover:bg-[var(--background-tertiary)] flex items-center gap-2 text-[var(--text-primary)] transition-colors focus:outline-none focus:bg-[var(--background-tertiary)]" // Changed text-light to text-primary
            >
              <FontAwesomeIcon icon={faCopy} className="text-sm" />
              Copy Text
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultsDisplay = ({ data, searchType = "text" }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  // Handle ESC key to close expanded image
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && expandedImage) {
        setExpandedImage(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [expandedImage]);

  if (!data || !data.answer?.text) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-[var(--background-secondary)] rounded-xl p-6 sm:p-8 shadow-lg text-center">
          <div className="text-[var(--text-muted)] mb-4">
            <FontAwesomeIcon icon={faTimes} size="2x" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2"> {/* Changed text-accent to text-primary */}
            No Results Available
          </h3>
          <p className="text-[var(--text-muted)] text-sm sm:text-base">
            We couldn't generate any results for this query.
          </p>
        </div>
      </div>
    );
  }

  const isImageAnalysis = searchType === "imageAnalysis";
  const { answer, images = [], googleLinks = [], imageUrl } = data;
  const hasSidebarContent = !isImageAnalysis && (images.length > 0 || googleLinks.length > 0);

  const markdownComponents = {
    p: ({ children }) => (
      <p className="mb-4 text-[var(--text-primary)] leading-relaxed last:mb-0 text-sm sm:text-base"> {/* Changed text-light to text-primary */}
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="text-xl sm:text-2xl font-bold my-4 text-[var(--text-primary)]"> {/* Changed text-accent to text-primary */}
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg sm:text-xl font-bold my-3 text-[var(--text-primary)]"> {/* Changed text-accent to text-primary */}
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base sm:text-lg font-bold my-2 text-[var(--text-primary)]"> {/* Changed text-accent to text-primary */}
        {children}
      </h3>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-1 text-[var(--text-primary)] text-sm sm:text-base">{children}</li> 
    ),
    code: ({ inline, children }) => (
      <code
        className={`${
          inline
            ? "bg-[var(--background-tertiary)] px-1.5 py-0.5 rounded text-[var(--text-primary)] text-sm" // Changed text-light to text-primary
            : "block bg-[var(--background-secondary)] p-3 rounded-lg my-2 overflow-x-auto text-[var(--text-primary)] text-sm" // Changed text-light to text-primary
        }`}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-[var(--background-secondary)] p-3 rounded-lg my-2 overflow-x-auto border border-[var(--border-primary)]"> {/* Changed border-color to border-primary */}
        {children}
      </pre>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--primary-accent)] hover:underline inline-flex items-center gap-1 break-words"
      >
        {children}
        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs flex-shrink-0" />
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 border border-[var(--border-primary)] rounded-lg"> {/* Changed border-color to border-primary */}
        <table className="min-w-full text-[var(--text-primary)] text-sm"> {/* Changed text-light to text-primary */}
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-[var(--border-primary)] px-3 py-2 bg-[var(--background-tertiary)] text-left font-medium"> {/* Changed border-color to border-primary */}
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-[var(--border-primary)] px-3 py-2"> {/* Changed border-color to border-primary */}
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--primary-accent)] pl-4 my-4 italic text-[var(--text-muted)] bg-[var(--background-tertiary)] py-2 rounded-r-lg">
        {children}
      </blockquote>
    ),
    img: ({ src, alt }) => (
      <div className="my-4">
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg border border-[var(--border-primary)] cursor-pointer hover:border-[var(--primary-accent)] transition-colors" // Changed border-color to border-primary
          onClick={() => setExpandedImage(src)}
        />
      </div>
    ),
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Analysis Results",
          text: answer.text,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy(answer.text);
        }
      }
    } else {
      handleCopy(answer.text);
    }
  };

  const handleCopyText = async (text = answer.text) => { // Renamed to avoid conflict with CopyDropdown's handleCopy
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto lg:md:px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <img src={logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate"> {/* Changed text-accent to text-primary */}
              {isImageAnalysis ? "Image Analysis" : "Search Results"}
            </h1>
            <p className="text-[var(--text-muted)] text-sm sm:text-base">
              {isImageAnalysis
                ? "Automatically generated from your image"
                : "Generated from your query"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <AnimatePresence>
            {showCopyFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 bg-[var(--success-color)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm whitespace-nowrap" // Changed text-accent to text-primary
              >
                <FontAwesomeIcon icon={faCheck} />
                Copied!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)] focus:ring-opacity-50"
            aria-label="Share results"
          >
            <FontAwesomeIcon icon={faShareAlt} className="text-[var(--text-muted)]" />
          </button>

          <CopyDropdown
            text={answer.text}
            onCopySuccess={() => handleCopyText(answer.text)} // Call the local handleCopyText
          />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={`flex flex-col ${hasSidebarContent ? 'xl:flex-row' : ''} gap-4 sm:gap-6`}>
        {/* Primary Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={` rounded-xl lg:md:p-4 sm:p-6 shadow-lg ${
            hasSidebarContent ? 'xl:flex-1' : 'w-full'
          }`}
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="bg-[var(--primary-accent)] p-2 rounded-lg flex-shrink-0">
              <FontAwesomeIcon
                icon={isImageAnalysis ? faImage : faFileText}
                className="text-white" // Changed text-accent to text-white for contrast on accent background
              />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]"> {/* Changed text-accent to text-primary */}
              {isImageAnalysis ? "Visual Analysis" : "Detailed Response"}
            </h2>
          </div>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {answer.text}
            </ReactMarkdown>
          </div>

          {/* Show original image for image analysis */}
          {isImageAnalysis && imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 sm:mt-8"
            >
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2"> {/* Changed text-accent to text-primary */}
                <FontAwesomeIcon icon={faImage} />
                Uploaded Image
              </h3>
              <div className="border-2 border-[var(--border-primary)] rounded-lg overflow-hidden max-w-full sm:max-w-2xl"> {/* Changed border-color to border-primary */}
                <img
                  src={imageUrl}
                  alt="Uploaded content"
                  className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setExpandedImage(imageUrl)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/200x200/1e1e1e/FFFFFF?text=Image+Error";
                  }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar - Only for non-image analysis with content */}
        {hasSidebarContent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:w-80 flex flex-col gap-4 sm:gap-6"
          >
            {/* Images Section */}
            {images.length > 0 && (
              <div className=" rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--primary-accent)] p-2 rounded-lg flex-shrink-0">
                    <FontAwesomeIcon icon={faImage} className="text-white" /> {/* Changed text-accent to text-white */}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]"> {/* Changed text-accent to text-primary */}
                    Related Images
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {images.slice(0, 4).map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="aspect-square overflow-hidden rounded-lg border border-[var(--border-primary)] hover:border-[var(--primary-accent)] transition-colors cursor-pointer" // Changed border-color to border-primary
                      onClick={() => setExpandedImage(img.src)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt || `Result ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/200x200/1e1e1e/FFFFFF?text=Image+Error";
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Section */}
            {googleLinks.length > 0 && (
              <div className=" rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--primary-accent)] p-2 rounded-lg flex-shrink-0">
                    <FontAwesomeIcon icon={faLink} className="text-white" /> {/* Changed text-accent to text-white */}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]"> {/* Changed text-accent to text-primary */}
                    Related Links
                  </h3>
                </div>

                <div className="space-y-3">
                  {googleLinks.slice(0, 3).map((link, index) => {
                    let hostname = "";
                    let isLinkValid = true;
                    const rawHref = link.url ? String(link.url) : "";

                    if (!rawHref) {
                      hostname = "Missing URL";
                      isLinkValid = false;
                    } else {
                      try {
                        const url = new URL(rawHref);
                        hostname = url.hostname;
                      } catch (e) {
                        hostname = "Malformed URL";
                        isLinkValid = false;
                      }
                    }

                    return (
                      <motion.a
                        key={index}
                        href={isLinkValid ? rawHref : "#"}
                        target={isLinkValid ? "_blank" : "_self"}
                        rel={isLinkValid ? "noopener noreferrer" : ""}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`block p-3 rounded-lg border transition-colors ${
                          isLinkValid
                            ? "border-[var(--border-primary)] hover:border-[var(--primary-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)] focus:ring-opacity-50" // Changed border-color to border-primary
                            : "border-[var(--error-color)] cursor-not-allowed"
                        }`}
                        onClick={(e) => {
                          if (!isLinkValid) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <h4 className="font-medium text-[var(--text-primary)] truncate text-sm sm:text-base"> {/* Changed text-accent to text-primary */}
                          {link.title || (isLinkValid ? "Untitled Link" : "Link Error")}
                        </h4>
                        <p className={`text-xs sm:text-sm truncate ${
                          isLinkValid ? "text-[var(--text-muted)]" : "text-[var(--error-color)]"
                        }`}>
                          {isLinkValid ? hostname : `${hostname}: ${rawHref || 'N/A'}`}
                        </p>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              // Only close if clicking directly on the backdrop, not on child elements
              if (e.target === e.currentTarget) {
                setExpandedImage(null);
              }
            }}
          >
           

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center pointer-events-none"
            >
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-none"
              />
            </motion.div>

            {/* Bottom instruction text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none"
            >
              Click outside or press ESC to close
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultsDisplay;
import React, { useState } from "react";
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
import logo from "../../assets/soul_logo.svg";

const CopyDropdown = ({ text, onCopySuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to copy:", err);
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

  const validateLink = (link) => {
    try {
      new URL(link.href);
      return {
        ...link,
        title: link.title || "Untitled Link",
        valid: true,
      };
    } catch (e) {
      return {
        ...link,
        title: link.title || "Invalid Link",
        valid: false,
        href: "#invalid-url",
      };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Using custom variables for hover background and text
        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
      >
        <FontAwesomeIcon icon={faEllipsisH} className="text-[var(--text-muted)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            // Using custom variables for background, border, and shadow
            className="absolute right-0 mt-2 w-48 bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-10"
          >
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-2 hover:bg-[var(--background-tertiary)] flex items-center gap-2 text-[var(--text-light)]" // Added text color
            >
              <FontAwesomeIcon icon={faCopy} /> Copy Text
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

  if (!data || !data.answer?.text) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-[var(--background-secondary)] rounded-lg shadow-lg text-center">
        <div className="text-[var(--text-muted)] mb-4">
          <FontAwesomeIcon icon={faTimes} size="2x" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-accent)] mb-2">
          No Results Available
        </h3>
        <p className="text-[var(--text-muted)]">
          We couldn't generate any results for this query.
        </p>
      </div>
    );
  }

  const isImageAnalysis = searchType === "imageAnalysis";
  const { answer, images = [], googleLinks = [], imageUrl } = data;
  const hasSidebarContent =
    !isImageAnalysis && (images.length > 0 || googleLinks.length > 0);

  const markdownComponents = {
    p: ({ children }) => (
      <p className="mb-4 text-[var(--text-light)] leading-relaxed last:mb-0">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold my-4 text-[var(--text-accent)]">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold my-3 text-[var(--text-accent)]">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold my-2 text-[var(--text-accent)]">{children}</h3>
    ),
    ul: ({ children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 mb-4">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-2 text-[var(--text-light)]">{children}</li>, // Added text-light to li
    code: ({ inline, children }) => (
      <code
        className={`${
          inline
            ? "bg-[var(--background-tertiary)] px-1.5 py-0.5 rounded text-[var(--text-light)]"
            : "block bg-[var(--background-secondary)] p-3 rounded my-2 overflow-x-auto text-[var(--text-light)]"
        }`}
      >
        {children}
      </code>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--primary-accent)] hover:underline flex items-center gap-1"
      >
        {children}{" "}
        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-[var(--border-color)] text-[var(--text-light)]">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-[var(--border-color)] px-4 py-2 bg-[var(--background-tertiary)] text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-[var(--border-color)] px-4 py-2">{children}</td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--primary-accent)] pl-4 my-4 italic text-[var(--text-muted)]">
        {children}
      </blockquote>
    ),
    img: ({ src, alt }) => (
      <div className="my-4">
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg border border-[var(--border-color)]"
        />
      </div>
    ),
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Analysis Results",
        text: answer.text,
        url: window.location.href,
      });
    } catch (err) {
      console.error("Sharing failed:", err);
      handleCopy(answer.text);
    }
  };

  const handleCopy = async (text = answer.text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
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
    <div className="max-w-6xl mx-auto px-4 py-6 ">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-12 h-12 rounded-lg" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-accent)]">
              {isImageAnalysis ? "Image Analysis" : "Search Results"}
            </h1>
            <p className="text-[var(--text-muted)]">
              {isImageAnalysis
                ? "Automatically generated from your image"
                : "Generated from your query"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {showCopyFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 bg-[var(--success-color)] text-[var(--text-accent)] px-3 py-1 rounded-md text-sm"
              >
                <FontAwesomeIcon icon={faCheck} /> Copied!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
            aria-label="Share results"
          >
            <FontAwesomeIcon icon={faShareAlt} className="text-[var(--text-muted)]" />
          </button>

          <CopyDropdown
            text={answer.text}
            onCopySuccess={() => setShowCopyFeedback(true)}
          />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div
        // Note: `var(--background-)` looks like a typo or incomplete var, assuming it should be a background
        // Using var(--background-dark) for the main wrapper if it defines the overall app background
        className={`bg-[var(--background-dark)] flex flex-col ${
          hasSidebarContent ? "lg:flex-row" : ""
        } gap-6`}
      >
        {/* Primary Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`bg-[var(--background-secondary)] rounded-xl p-6 shadow-lg ${
            hasSidebarContent ? "lg:flex-1" : "w-full"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[var(--primary-accent)] p-2 rounded-lg">
              <FontAwesomeIcon
                icon={isImageAnalysis ? faImage : faFileText}
                className="text-[var(--text-accent)]" // Assuming text on primary accent is accent color
              />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-accent)]">
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
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-[var(--text-accent)] mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faImage} />
                Uploaded Image
              </h3>
              <div className="border-2 border-[var(--border-color)] rounded-lg overflow-hidden max-w-2xl">
                <img
                  src={imageUrl}
                  alt="Uploaded content"
                  className="w-full h-auto"
                  onClick={() => setExpandedImage(imageUrl)}
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
            className="lg:w-80 flex flex-col gap-6"
          >
            {/* Images Section */}
            {images.length > 0 && (
              <div className="bg-[var(--background-secondary)] rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--primary-accent)] p-2 rounded-lg">
                    <FontAwesomeIcon icon={faImage} className="text-[var(--text-accent)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-accent)]">
                    Related Images
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {images.slice(0, 4).map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="aspect-square overflow-hidden rounded-lg border border-[var(--border-color)] hover:border-[var(--primary-accent)] transition-colors cursor-pointer"
                      onClick={() => setExpandedImage(img.src)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt || `Result ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/200x200/1e1e1e/FFFFFF?text=Image+Error";
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Section */}
            {googleLinks.length > 0 && (
              <div className="bg-[var(--background-secondary)] rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--primary-accent)] p-2 rounded-lg">
                    <FontAwesomeIcon icon={faLink} className="text-[var(--text-accent)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-accent)]">
                    Related Links
                  </h3>
                </div>

                <div className="space-y-3">
                  {googleLinks.slice(0, 3).map((link, index) => {
                    let hostname = "";
                    let isLinkValid = true;
                    const rawHref = link.url ? String(link.url) : ""; // Use link.url

                    if (!rawHref) {
                      hostname = "Missing URL";
                      isLinkValid = false;
                      console.error("Link object missing URL or it's empty:", link);
                    } else {
                      try {
                        const url = new URL(rawHref);
                        hostname = url.hostname;
                      } catch (e) {
                        hostname = "Malformed URL";
                        isLinkValid = false;
                        console.error("Malformed URL detected:", rawHref, e);
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
                        className={`block p-3 rounded-lg border ${
                          isLinkValid
                            ? "border-[var(--border-color)] hover:border-[var(--primary-accent)]"
                            : "border-[var(--error-color)] cursor-not-allowed"
                        } transition-colors`}
                        onClick={(e) => {
                          if (!isLinkValid) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <h4 className="font-medium text-[var(--text-accent)] truncate">
                          {link.title || (isLinkValid ? "Untitled Link" : "Link Error")}
                        </h4>
                        <p
                          className={`text-sm truncate ${
                            isLinkValid ? "text-[var(--text-muted)]" : "text-[var(--error-color)]"
                          }`}
                        >
                          {isLinkValid ? hostname : `${hostname}: ${rawHref || 'N/A'}`}
                        </p>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expanded Image Modal */}
            <AnimatePresence>
              {expandedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-[var(--background-dark)]/90 backdrop-blur-sm flex items-center justify-center p-4" // Use background-dark with transparency for modal overlay
                  onClick={() => setExpandedImage(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="relative max-w-4xl w-full max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={expandedImage}
                      alt="Expanded view"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <button
                      className="absolute top-4 right-4 bg-[var(--background-secondary)]/50 hover:bg-[var(--background-tertiary)] text-[var(--text-accent)] p-2 rounded-full transition-colors"
                      onClick={() => setExpandedImage(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
// ai-layout-project/frontend/src/components/ResultsDisplay.js

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faShareAlt, faEllipsisH, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ResultsDisplay = ({ data }) => {
  console.log("ResultsDisplay received data:", data);

  // State to hold the paragraphs currently being displayed
  const [displayedParagraphs, setDisplayedParagraphs] = useState([]);
  // State to trigger the overall fade-in animation
  const [displayKey, setDisplayKey] = useState(0);
  // State to manage copy feedback
  const [showCopyFeedback, setShowCopyFeedback] = useState(false); // This state is already here!
  // Effect to handle the fade-in animation and paragraph display


  useEffect(() => {
    // Reset states when new 'data' prop arrives
    setDisplayedParagraphs([]);
    setDisplayKey(prevKey => prevKey + 1); // Increment key to re-trigger fade-in on the main container

    if (!data || !data.answer || !data.answer.paragraphs || data.answer.paragraphs.length === 0) {
      console.log("ResultsDisplay: Data is null or missing essential parts.");
      return;
    }

    const paragraphs = data.answer.paragraphs;
    let index = 0;
    const intervalTime = 80; // Time in ms between each paragraph reveal

    const intervalId = setInterval(() => {
      if (index < paragraphs.length) {
        setDisplayedParagraphs(prev => [...prev, paragraphs[index]]);
        index++;
      } else {
        clearInterval(intervalId); // Stop the interval when all paragraphs are displayed
      }
    }, intervalTime);

    // Cleanup function: Clear the interval if the component unmounts or data changes again
    return () => clearInterval(intervalId);

  }, [data]); // Effect runs whenever the 'data' prop changes

  if (!data || !data.answer || !data.answer.paragraphs) {
    return null; // Don't render anything if essential data is missing
  }

  const { answer, images, socialHandles, googleLinks } = data;

  // Modified handleCopy function in ResultsDisplay
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log("Text copied to clipboard:", text);
        setShowCopyFeedback(true); // Show feedback
        setTimeout(() => {
          setShowCopyFeedback(false); // Hide feedback after 2 seconds
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy text:", err);
      });
  }

  const handleShare = () => {
    const textToShare = displayedParagraphs.join("\n");
    if (navigator.share) {
      navigator.share({
        title: answer.title,
        text: textToShare,
      })
      .then(() => console.log('Content shared successfully'))
      .catch(err => console.error('Error sharing content:', err));
    }
  };

  return (
    <div className="full-results-display" key={displayKey}>
      <div className="result-section-header">
        <h2 className="result-section-title">
          <FontAwesomeIcon icon={faMagic} />
          Answer
        </h2>
        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <FontAwesomeIcon icon={faShareAlt} className="header-icon" onClick={handleShare}/>
          <DropdownMenu
            answerText={displayedParagraphs.map(paragraph => paragraph).join("\n")}
            onCopySuccess={() => {
              setShowCopyFeedback(true); // Show feedback from dropdown
              setTimeout(() => {
                setShowCopyFeedback(false); // Hide feedback after 2 seconds
              }, 2000);
            }}
          />
          {showCopyFeedback && (
            <span className="copy-feedback" >
              Copied!
            </span>
          )}
        </div>
      </div>

      <div className="answer-content">
        <h3 className="answer-title">{answer.title}</h3>
        <div className="answer-text-section glass-effect">
          {displayedParagraphs.map((paragraph, idx) => (
            <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>
              {paragraph}
            </ReactMarkdown>
          ))}

          {/* Conditionally render video thumbnail */}
          {answer.videoThumbnail && (
            <div className="answer-video-thumbnail">
              <img src={answer.videoThumbnail.src} alt={answer.videoThumbnail.alt} />
              <FontAwesomeIcon icon={faPlayCircle} className="play-icon" />
            </div>
          )}
        </div>

        <div className="answer-side-content">
          {/* Conditionally render social handles box */}
          {socialHandles && socialHandles.length > 0 && (
            <div className="social-handles-box glass-effect">
              <h3>Social Handles</h3>
              <div className="social-icons-list">
                {socialHandles.map((handle, index) => (
                  <a href={handle.url} target="_blank" rel="noopener noreferrer" key={index} className="social-handle-item">
                    <FontAwesomeIcon icon={faInstagram} className="social-icon" />
                    <span>{handle.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Conditionally render Google Search Images section */}
          {images && images.length > 0 && (
            <div className="google-images-box glass-effect">
              <h3>Images from Google</h3>
              <div className="google-image-grid">
                {images.map((img, index) => (
                  <a key={index} href={img.src} target="_blank" rel="noopener noreferrer">
                    <img src={img.src} alt={img.alt} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* New: Conditionally render Google Search Links section */}
          {googleLinks && googleLinks.length > 0 && (
            <div className="google-links-box glass-effect">
              <h3>Related Links</h3>
              <ul className="google-links-list">
                {googleLinks.map((link, index) => (
                  <li key={index} className="google-link-item">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title}
                    </a>
                    <p>{link.snippet}</p>
                    <span>{new URL(link.url).hostname}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; // Closing brace for ResultsDisplay component

// DropdownMenu component (extracted and modified)
function DropdownMenu({ answerText, onCopySuccess }) { // Added onCopySuccess prop
  const [open, setOpen] = React.useState(false);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown-menu-container')) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(answerText)
      .then(() => {
        setOpen(false);
        if (onCopySuccess) { // Call the callback if provided
          onCopySuccess();
        }
      })
      .catch(err => {
        console.error("Failed to copy text from dropdown:", err);
      });
  };

  return (
    <div className="dropdown-menu-container" style={{ position: 'relative' }}>
      <FontAwesomeIcon
        icon={faEllipsisH}
        className="header-icon"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: 'pointer' }}
      />
      {open && (
        <div
          className="dropdown-menu"
        >
          <button
            className="dropdown-menu-item"
            onClick={handleCopy}
          >
            Copy Text
          </button>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
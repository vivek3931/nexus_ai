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

  return (
    <div className="full-results-display" key={displayKey}>
      <div className="result-section-header">
        <h2 className="result-section-title">
          <FontAwesomeIcon icon={faMagic} />
          Answer
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <FontAwesomeIcon icon={faShareAlt} className="header-icon" />
          <FontAwesomeIcon icon={faEllipsisH} className="header-icon" />
        </div>
      </div>

      <div className="answer-content">
        <div className="answer-text-section glass-effect">
          {displayedParagraphs.map((paragraph, idx) => (
            <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}
              
            >
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
                  <img key={index} src={img.src} alt={img.alt} />
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
};

export default ResultsDisplay;
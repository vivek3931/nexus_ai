import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';

const SearchBar = ({ onSearch, isLoading: propIsLoading, searchTerm: propSearchTerm }) => {
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const isLoading = propIsLoading || isOcrLoading;
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState('');
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [lastSearchWasImage, setLastSearchWasImage] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // State to track input focus

  useEffect(() => {
    const term = typeof propSearchTerm === 'string' ? propSearchTerm : '';
    setSearchTerm(term);
    setDisplayedSearchTerm(term);
  }, [propSearchTerm]);

  useEffect(() => {
    return () => {
      if (uploadedImagePreviewUrl) {
        URL.revokeObjectURL(uploadedImagePreviewUrl);
      }
    };
  }, [uploadedImagePreviewUrl]);

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setDisplayedSearchTerm(newText);
    setSearchTerm(newText);

    if (uploadedImagePreviewUrl) {
      handleClearImage();
      setLastSearchWasImage(false);
    }
  };

  const handleSearchClick = () => {
    const queryToSend = typeof displayedSearchTerm === 'string' ? displayedSearchTerm.trim() : '';

    if (isLoading) return;

    const imageUrlToSend = uploadedImagePreviewUrl && lastSearchWasImage ? uploadedImagePreviewUrl : null;

    if (queryToSend || imageUrlToSend) {
      onSearch({
        query: queryToSend,
        searchType: imageUrlToSend ? 'image' : 'text',
        imageUrl: imageUrlToSend
      });

      setDisplayedSearchTerm('');
      setSearchTerm('');
      handleClearImage();
      setLastSearchWasImage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearchClick();
    }
  };

  const handleImageIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearImage = () => {
    if (uploadedImagePreviewUrl) {
      URL.revokeObjectURL(uploadedImagePreviewUrl);
    }
    setUploadedImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLastSearchWasImage(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || isLoading) return;

    setSearchTerm('');
    setDisplayedSearchTerm('');
    handleClearImage();
    setLastSearchWasImage(true);

    const imageUrl = URL.createObjectURL(file);
    setUploadedImagePreviewUrl(imageUrl);
    setDisplayedSearchTerm("Analyzing image...");
    setIsOcrLoading(true);

    let worker;
    let extractedText = '';

    try {
      worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {}
      });

      const { data: { text } } = await worker.recognize(file);
      extractedText = typeof text === 'string' ? text.trim() : '';

      setDisplayedSearchTerm(extractedText || "Image analyzed. Ready to search.");
      setSearchTerm(extractedText);

      onSearch({
        query: extractedText,
        searchType: 'image',
        imageUrl: imageUrl
      });

      setDisplayedSearchTerm('');
      setSearchTerm('');
      handleClearImage();
      setLastSearchWasImage(false);

    } catch (error) {
      console.error('Error during OCR:', error);
      setDisplayedSearchTerm("Error analyzing image. Please try again.");
      setSearchTerm('');
      handleClearImage();
      setLastSearchWasImage(false);

      onSearch({
        query: '',
        searchType: 'image',
        imageUrl: imageUrl
      });

    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsOcrLoading(false);
    }
  };

  const ImageIcon = ({ className, onClick }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} onClick={onClick}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  );

  const CloseIcon = ({ onClick }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 cursor-pointer" onClick={onClick}>
      <path d="M18 6 6 18"/>
      <path d="M6 6l12 12"/>
    </svg>
  );

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Main search container - acts as the ::before parent */}
        <div
          className={`
            relative flex items-center w-full px-4 py-3 rounded-[50px] 
            bg-[var(--glass-background)] border border-[var(--glass-border)]
            shadow-[var(--glass-shadow)] transition-all duration-[var(--transition-slow)]
            
            // Focus state: small decent purple borders and adjusted glass effect
            ${isFocused
              ? 'border-[var(--primary-accent)] shadow-[0_12px_40px_var(--glass-shadow),inset_0_1px_0_rgba(255,255,255,0.15)] bg-[var(--glass-hover-bg)]'
              : 'hover:bg-[var(--glass-hover-bg)] hover:border-[rgba(108,92,231,0.3)] hover:shadow-[0_12px_40px_var(--glass-shadow),inset_0_1px_0_rgba(255,255,255,0.15)]' // Apply hover styles from soul-x3-box to search bar
            }
            transform ${isFocused ? 'scale-[1.005]' : ''} // Subtle scale on focus for modern feel
          `}
        >
          {/* This div simulates the ::before pseudo-element with the gradient and blur */}
          {/* <div
            className={`
              absolute left-0 w-full pointer-events-none z-[-1] // Position and z-index
              ${isFocused ? 'h-[100px] top-[-50px] opacity-100' : 'h-0 top-0 opacity-0'} // Height, top based on focus
              rounded-[inherit] // Inherit border-radius from parent
              transition-all duration-[var(--transition-slow)] ease-out
            `}
            style={{
              // This is the linear gradient from your image
              // Assuming --gem-sys-color--surface is a dark background color like #0a0a0a
              // The gradient should go from transparent to opaque (or slightly translucent) from top
              background: `linear-gradient(180deg, 
                           rgba(10, 10, 10, 0), // transparent version of --background-dark
                           var(--glass-background))`, // the existing glass background of the container
              // You can adjust the colors above to precisely match `var(--gem-sys-color--surface) srgb r g b / 0` etc.
              // If '--gem-sys-color--surface' is actually transparent white, use:
              // background: `linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.02))`,
              backdropFilter: 'var(--glass-backdrop-filter)', // Apply the glass blur to this overlay
              overflow: 'hidden', // To ensure the gradient starts smoothly above and blends in
            }}
          /> */}
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {/* Image analysis state */}
          {uploadedImagePreviewUrl && isOcrLoading ? (
            <div className="flex items-center flex-grow py-1 z-10"> {/* z-10 to ensure it's above the gradient overlay */}
              <div className="relative h-8 w-8 flex-shrink-0 mr-3">
                <img
                  src={uploadedImagePreviewUrl}
                  alt="Uploaded Preview"
                  className="h-full w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-purple-500/30 rounded-lg animate-pulse"></div>
              </div>
              <span className="flex-grow text-[var(--text-light)] text-sm font-medium"> {/* Use text-light */}
                Analyzing image...
              </span>
              <CloseIcon onClick={handleClearImage} />
            </div>
          ) : (
            <>
              {/* Image upload icon */}
              <ImageIcon
                onClick={handleImageIconClick}
                className={`w-5 h-5 mr-3 flex-shrink-0 cursor-pointer transition-all duration-[var(--transition-base)] z-10 // z-10 for icon
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} 
                  ${isFocused ? 'text-[var(--primary-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-light)]'} // Use your variables
                `}
              />
              
              {/* Main input field */}
              <input
                type="text"
                className="flex-grow bg-transparent outline-none text-[var(--text-light)] placeholder-[var(--text-placeholder)] text-base font-normal tracking-wide z-10" // z-10 for input
                placeholder="Ask anything or upload an image..."
                value={typeof displayedSearchTerm === 'string' ? displayedSearchTerm : ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
              />
            </>
          )}

          {/* Submit button */}
          <button
            className={`
              ml-3 p-2 rounded-full transition-all duration-[var(--transition-slow)] flex-shrink-0 z-10 // z-10 for button, rounded-full
              ${(typeof displayedSearchTerm === 'string' && displayedSearchTerm.trim() && !isLoading) || (uploadedImagePreviewUrl && !isLoading)
                ? 'bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-white shadow-lg hover:shadow-[var(--primary-accent)]/30 hover:scale-105 active:scale-95'
                : 'bg-[var(--background-tertiary)] text-[var(--text-muted)] cursor-not-allowed' // Use your background tertiary for disabled
              }
            `}
            onClick={handleSearchClick}
            disabled={(!(typeof displayedSearchTerm === 'string' && displayedSearchTerm.trim()) && !uploadedImagePreviewUrl) || isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <ArrowRightIcon />
            )}
          </button>
        </div>
      </div>
      {/* You had this style in the component, keeping it if it's used elsewhere for animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
};

export default SearchBar;
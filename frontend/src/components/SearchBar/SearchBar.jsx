import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Mic, FileText } from 'lucide-react';

const SearchBar = ({ onSearch, isLoading: propIsLoading, searchTerm: propSearchTerm }) => {
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const isLoading = propIsLoading || isOcrLoading;
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedSearchTerm, setDisplayedSearchTerm] = useState('');
    const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [lastSearchWasImage, setLastSearchWasImage] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const recognitionRef = useRef(null);
    const [shouldGeneratePdf, setShouldGeneratePdf] = useState(false);

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
                imageUrl: imageUrlToSend,
                shouldGeneratePdf: shouldGeneratePdf
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
                imageUrl: imageUrl,
                shouldGeneratePdf: shouldGeneratePdf
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
                imageUrl: imageUrl,
                shouldGeneratePdf: shouldGeneratePdf
            });

        } finally {
            if (worker) {
                await worker.terminate();
            }
            setIsOcrLoading(false);
        }
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser doesn't support voice recognition.");
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const voiceText = event.results[0][0].transcript;
                setDisplayedSearchTerm(voiceText);
                setSearchTerm(voiceText);
                handleClearImage();
                setLastSearchWasImage(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Voice recognition error:", event.error);
                setDisplayedSearchTerm("Voice recognition failed.");
                setSearchTerm("");
            };
        }

        try {
            recognitionRef.current.start();
            setDisplayedSearchTerm("Listening...");
            setSearchTerm("");
            handleClearImage();
        } catch (error) {
            console.error("Error starting voice recognition:", error);
        }
    };

    const handlePdfButtonClick = () => {
        setShouldGeneratePdf(prev => !prev);
    };

    const isSendButtonEnabled = (displayedSearchTerm.trim() || uploadedImagePreviewUrl) && !isLoading;

    return (
        <div className="w-full px-4 py-4 shadow-lg rounded-xl"
            style={{
                backgroundColor: 'var(--background-dark)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'var(--glass-backdrop-filter)',
                WebkitBackdropFilter: 'var(--glass-backdrop-filter)',
                boxShadow: '0 8px 32px var(--glass-shadow)',
            }}
        >
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                    style={{
                        backgroundColor: 'var(--background-secondary)',
                        border: `1px solid ${isFocused ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                        color: 'var(--text-light)',
                        fontSize: 'var(--font-size-md)',
                        transition: 'var(--transition-base)',
                    }}
                    placeholder="Ask anything or upload an image..."
                    value={displayedSearchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                />

                {(uploadedImagePreviewUrl || displayedSearchTerm.trim()) && (
                    <div className="flex items-center justify-between p-2 rounded-lg"
                        style={{
                            backgroundColor: 'var(--background-tertiary)',
                            border: '1px solid var(--border-light)',
                        }}
                    >
                        {uploadedImagePreviewUrl ? (
                            <div className="flex items-center gap-3">
                                <img
                                    src={uploadedImagePreviewUrl}
                                    alt="Preview"
                                    className="h-12 w-12 object-cover rounded-md"
                                    style={{ border: '1px solid var(--border-color)' }}
                                />
                                <span
                                    style={{
                                        color: 'var(--text-light)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    {isOcrLoading ? 'Analyzing image...' : 'Image ready'}
                                </span>
                            </div>
                        ) : (
                            <span
                                style={{
                                    color: 'var(--text-light)',
                                    fontSize: 'var(--font-size-sm)',
                                }}
                                className="overflow-hidden text-ellipsis whitespace-nowrap pr-2"
                            >
                                {displayedSearchTerm}
                            </span>
                        )}
                        <button
                            onClick={handleClearImage}
                            className="font-bold text-xl ml-auto px-2 transition-colors"
                            style={{
                                color: 'var(--error-color)',
                                transition: 'var(--transition-base)',
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                            title="Clear image or text"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        <button
                            onClick={handleImageIconClick}
                            className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg"
                            style={{
                                color: 'var(--text-muted)',
                                transition: 'var(--transition-base)',
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = 'var(--glass-hover-bg)';
                                    e.target.style.color = 'var(--text-light)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = 'var(--text-muted)';
                            }}
                            title="Upload image"
                            disabled={isLoading}
                        >
                            <Camera className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleVoiceInput}
                            className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg"
                            style={{
                                color: 'var(--text-muted)',
                                transition: 'var(--transition-base)',
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = 'var(--glass-hover-bg)';
                                    e.target.style.color = 'var(--text-light)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = 'var(--text-muted)';
                            }}
                            title="Voice input"
                            disabled={isLoading}
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        
                    </div>

                    <button
                        className="px-4 py-2 rounded-full font-medium transition-all"
                        style={{
                            backgroundColor: isSendButtonEnabled ? 'var(--primary-accent)' : 'var(--background-tertiary)',
                            color: isSendButtonEnabled ? 'var(--text-accent)' : 'var(--text-muted)',
                            fontSize: 'var(--font-size-sm)',
                            transition: 'var(--transition-slow)',
                            cursor: isSendButtonEnabled ? 'pointer' : 'not-allowed',
                            border: `1px solid ${isSendButtonEnabled ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                        }}
                        onMouseEnter={(e) => {
                            if (isSendButtonEnabled) {
                                e.target.style.backgroundColor = 'var(--secondary-accent)';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (isSendButtonEnabled) {
                                e.target.style.backgroundColor = 'var(--primary-accent)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }
                        }}
                        onClick={handleSearchClick}
                        disabled={!isSendButtonEnabled}
                    >
                        {isLoading ? 'Loading...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
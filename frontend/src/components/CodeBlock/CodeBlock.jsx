import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faEye, faCode, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ language, sourceCode }) => {
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false); // true for result, false for code
  const [compiledOutput, setCompiledOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [iframeHeight, setIframeHeight] = useState('300px'); // Used for both iframe and compiled output div
  const iframeRef = useRef(null);
  const resultPanelRef = useRef(null); // Ref for the result *panel* div itself

  // Ensure API_URL is correctly set and used
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const supportsLivePreview = ['html', 'css', 'javascript'].includes(language.toLowerCase());
  const isMobile = window.innerWidth <= 768;

  const getIframeContent = () => {
    const lowerCaseLang = language.toLowerCase();
    const baseStyles = `
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.5;
        color: #333;
        background-color: white;
      }
      .error {
        color: #dc2626;
        padding: 8px;
        background-color: #fee2e2;
        border-radius: 4px;
        margin: 8px 0;
      }
      .console-output {
        white-space: pre-wrap;
        font-family: monospace;
        background: #f3f4f6;
        padding: 12px;
        border-radius: 4px;
        margin-top: 12px;
      }
      .preview-box {
        padding: 15px;
        border: 1px solid #ddd;
        background-color: #f9f9f9;
        margin-top: 10px;
      }
    `;

    if (lowerCaseLang === 'html') {
      return sourceCode;
    } else if (lowerCaseLang === 'css') {
      return `<!DOCTYPE html>
        <html>
        <head>
          <style>${baseStyles}${sourceCode}</style>
        </head>
        <body>
          <h1>CSS Preview</h1>
          <div class="preview-box">Styled Element</div>
          <p>This is a preview of your CSS styles.</p>
        </body>
        </html>`;
    } else if (lowerCaseLang === 'javascript') {
      return `<!DOCTYPE html>
        <html>
        <head>
          <style>${baseStyles}</style>
        </head>
        <body>
          <h2>JavaScript Output</h2>
          <div id="js-output" class="console-output"></div>
          <script>
            const jsOutputDiv = document.getElementById('js-output');
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn
            };
            
            function formatOutput(args) {
              return args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch {
                    return String(arg);
                  }
                }
                return String(arg);
              }).join(' ');
            }
            
            console.log = (...args) => {
              originalConsole.log(...args);
              const output = document.createElement('div');
              output.textContent = formatOutput(args);
              jsOutputDiv.appendChild(output);
            };
            
            console.error = (...args) => {
              originalConsole.error(...args);
              const output = document.createElement('div');
              output.className = 'error';
              output.textContent = 'Error: ' + formatOutput(args);
              jsOutputDiv.appendChild(output);
            };
            
            console.warn = (...args) => {
              originalConsole.warn(...args);
              const output = document.createElement('div');
              output.style.color = '#d97706';
              output.textContent = 'Warning: ' + formatOutput(args);
              jsOutputDiv.appendChild(output);
            };
            
            try {
              ${sourceCode}
            } catch (error) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error';
              errorDiv.textContent = 'Runtime Error: ' + error.message;
              jsOutputDiv.appendChild(errorDiv);
            }
          </script>
        </body>
        </html>`;
    }
    return '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sourceCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy code: ', err));
  };

  const handleRunCode = async () => {
    setIsCompiling(true);
    setCompileError(''); // Clear previous errors for compilation
    setCompiledOutput(''); // Clear previous output for compilation
    setShowResult(true); // Always show result panel when running external code

    try {
      const response = await fetch(`${API_URL}/compile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language.toLowerCase(),
          sourceCode,
          stdin: ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Compilation failed with unknown error.');
      }

      const data = await response.json();
      setCompiledOutput(data.stdout || 'Code executed successfully (no stdout)');
      
    } catch (err) {
      console.error('Backend compilation error:', err);
      setCompileError(
        err.message.includes('Failed to fetch') 
          ? `Backend service unavailable. Please ensure your backend server is running and accessible at: ${API_URL}. Also check browser console for network errors.`
          : err.message
      );
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    // Reset states when sourceCode or language changes
    setShowResult(false); // Default to showing code when content changes
    setCompiledOutput('');
    setCompileError('');
    setIsCompiling(false);
  }, [sourceCode, language]);

  useEffect(() => {
    const adjustHeight = () => {
      let newHeight = '300px'; // Default

      if (supportsLivePreview && showResult && iframeRef.current && iframeRef.current.contentWindow) {
        // For live preview, adjust based on iframe content
        const contentBody = iframeRef.current.contentWindow.document.body;
        if (contentBody) {
          const scrollHeight = contentBody.scrollHeight;
          newHeight = `${Math.min(Math.max(scrollHeight + 32, 200), window.innerHeight * 0.6)}px`;
        }
      } else if (!supportsLivePreview && showResult && resultPanelRef.current) {
        // For compiled output, adjust based on the content of the pre tag or error div
        const contentHeight = resultPanelRef.current.scrollHeight;
        newHeight = `${Math.min(Math.max(contentHeight, 200), window.innerHeight * 0.6)}px`;
      }
      setIframeHeight(newHeight);
    };

    // Attach resize listener to window
    window.addEventListener('resize', adjustHeight);

    // Attach load listener to iframe for live previews
    const iframeCurrent = iframeRef.current;
    if (supportsLivePreview && iframeCurrent) {
        const handleIframeLoad = () => {
            // Give a small delay for content to render within the iframe
            setTimeout(adjustHeight, 50);
            if (iframeCurrent.contentWindow) {
                iframeCurrent.contentWindow.addEventListener('resize', adjustHeight);
            }
        };
        iframeCurrent.addEventListener('load', handleIframeLoad);
        // If already loaded (e.g., component re-render), call directly
        if (iframeCurrent.contentWindow && iframeCurrent.contentWindow.document.readyState === 'complete') {
            handleIframeLoad();
        }
    }
    
    // Initial height adjustment when component mounts or states change
    adjustHeight();

    return () => {
      window.removeEventListener('resize', adjustHeight);
      if (supportsLivePreview && iframeCurrent && iframeCurrent.contentWindow) {
        iframeCurrent.removeEventListener('load', adjustHeight); // Remove load listener
        iframeCurrent.contentWindow.removeEventListener('resize', adjustHeight);
      }
    };
  }, [showResult, sourceCode, language, supportsLivePreview]);


  return (
    <div className="bg-[var(--background-dark)] rounded-lg overflow-hidden shadow-lg mt-4 mx-0 sm:mx-2 border-[var(--glass-border)] border-[1px]">
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--background-secondary)] px-4 py-2">
        <div className="flex items-center">
          <span className="text-sm font-medium text-[var(--text-light)] mr-2">
            {language.toUpperCase()}
          </span>
          {isCompiling && (
            <span className="text-xs bg-[var(--primary-accent)]/[.2] text-[var(--secondary-accent)] px-2 py-1 rounded-full animate-pulse">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {supportsLivePreview ? ( // Use ternary for live preview / run button
            <button
              onClick={() => setShowResult(prev => !prev)}
              className={`text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors duration-200 p-2 rounded-md ${
                showResult ? 'bg-[var(--background-tertiary)]' : ''
              }`}
              title={showResult ? "Show Code" : "Show Live Preview"}
              aria-label={showResult ? "Show code" : "Show live preview"}
            >
              <FontAwesomeIcon 
                icon={showResult ? faCode : faEye} 
                className={showResult ? 'text-[var(--primary-accent)]' : ''} 
              />
            </button>
          ) : (
            <button
              onClick={handleRunCode}
              disabled={isCompiling}
              className={`text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors duration-200 p-2 rounded-md ${
                isCompiling ? 'cursor-not-allowed' : ''
              }`}
              title="Run Code"
              aria-label="Run code"
            >
              {isCompiling ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-[var(--secondary-accent)]" />
              ) : (
                <FontAwesomeIcon icon={faPlay} />
              )}
            </button>
          )}
          <button
            onClick={handleCopyCode}
            className="relative text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors duration-200 p-2 rounded-md"
            title="Copy code"
            aria-label="Copy code"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--success-color)] text-[var(--text-accent)] text-xs px-2 py-1 rounded whitespace-nowrap shadow-md animate-fadeInOut">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative overflow-hidden w-full custom-scrollbar">
        <div className={`flex transition-transform duration-300 ease-in-out ${showResult ? '-translate-x-full' : 'translate-x-0'}`}
             style={{ width: '200%' }}
        >
          {/* Code Area */}
          <div className="w-1/2 p-4 overflow-x-auto flex-shrink-0">
            <SyntaxHighlighter
              language={language}
              style={dracula}
              showLineNumbers={true}
              wrapLines={true}
              lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
              customStyle={{
                backgroundColor: 'transparent',
                padding: '0',
                margin: '0',
                overflow: 'visible',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
              }}
              lineNumberStyle={{ 
                color: '#6272a4', 
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                minWidth: '2.5em'
              }}
            >
              {sourceCode}
            </SyntaxHighlighter>
          </div>

          {/* Result Area */}
          <div 
            ref={resultPanelRef} // Apply ref to the outer div of the result panel
            className="w-1/2 flex-shrink-0 p-4 bg-[var(--background-tertiary)] overflow-y-auto"
            style={{ height: showResult ? iframeHeight : 'auto' }}
          >
            <h4 className="text-sm font-medium text-[var(--text-light)] mb-2">
              {supportsLivePreview ? 'Live Preview:' : 'Output:'}
            </h4>
            {supportsLivePreview ? (
              <div 
                className="w-full border-[var(--border-color)] border rounded-md overflow-hidden custom-scrollbar"
                style={{ height: iframeHeight, position: 'relative', width: '100%' }}
              >
                <iframe
                  ref={iframeRef}
                  title="Code Preview"
                  srcDoc={getIframeContent()}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  className="min-w-full h-full bg-white custom-scrollbar"
                  style={{ minHeight: '200px', resize: 'none', width: '100%', display: 'block' }}
                  loading="lazy"
                />
                {/* Resize handle for height */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '12px',
                    cursor: 'ns-resize',
                    zIndex: 10,
                    background: 'linear-gradient(to top, var(--background-dark) 60%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                  onMouseDown={e => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startHeight = parseInt(iframeHeight, 10);

                    const onMouseMove = moveEvent => {
                      const delta = moveEvent.clientY - startY;
                      let newHeight = startHeight + delta;
                      newHeight = Math.max(120, Math.min(newHeight, window.innerHeight * 0.9));
                      setIframeHeight(`${newHeight}px`);
                    };

                    const onMouseUp = () => {
                      window.removeEventListener('mousemove', onMouseMove);
                      window.removeEventListener('mouseup', onMouseUp);
                    };

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                  }}
                  title="Drag to resize preview height"
                >
                  <div
                    style={{
                      width: 40,
                      height: 6,
                      borderRadius: 3,
                      background: 'var(--text-muted)',
                      margin: '3px 0',
                    }}
                  />
                </div>
              </div>
            ) : ( // This block is ONLY for non-live-preview languages (where compilation happens)
              <div className="w-full border border-[var(--border-color)] rounded-md p-3" style={{ backgroundColor: 'var(--background-secondary)' }}>
                {isCompiling ? (
                  <div className="flex flex-col items-center justify-center h-32">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-[var(--secondary-accent)] text-2xl mb-2" />
                    <span className="text-[var(--secondary-accent)]">Compiling code...</span>
                  </div>
                ) : compileError ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-[var(--error-color)]">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Compilation Error</span>
                    </div>
                    <pre className="text-[var(--error-color)] text-sm whitespace-pre-wrap font-mono bg-[var(--error-color)]/[.2] p-2 rounded">
                      {compileError}
                    </pre>
                    <button 
                      onClick={handleRunCode}
                      className="mt-2 text-sm bg-[var(--error-color)] hover:bg-[var(--error-color)]/[.8] text-[var(--text-accent)] px-3 py-1 rounded"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <pre className="text-[var(--success-color)] text-sm whitespace-pre-wrap font-mono">
                    {compiledOutput || 'Click "Run" to execute the code'}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CodeBlock);
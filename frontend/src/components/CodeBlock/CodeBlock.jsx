import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faEye, faCode, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import './CodeBlock.css';

const CodeBlock = ({ language, sourceCode }) => {
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [compiledOutput, setCompiledOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [iframeHeight, setIframeHeight] = useState('300px');
  const iframeRef = useRef(null);
  const resultRef = useRef(null);

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
                if (typeof arg === 'object') {
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
              output.textContent = formatOutput(args);
              jsOutputDiv.appendChild(output);
            };
            
            console.warn = (...args) => {
              originalConsole.warn(...args);
              const output = document.createElement('div');
              output.style.color = '#d97706';
              output.textContent = formatOutput(args);
              jsOutputDiv.appendChild(output);
            };
            
            try {
              ${sourceCode}
            } catch (error) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error';
              errorDiv.textContent = 'Error: ' + error.message;
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
    setCompileError('');
    setCompiledOutput('');
    setShowResult(true);

    try {
      const response = await fetch(`${import.meta.url.VITE_API_URL}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, sourceCode, stdin: '' }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setCompiledOutput(data.stdout || 'Execution complete. No standard output.');
      } else {
        setCompileError(data.stderr || data.exception || data.error || 'Code compilation failed.');
      }
    } catch (err) {
      console.error("Error during compilation request:", err);
      setCompileError('Failed to connect to compilation service. Please check your network or backend.');
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    setShowResult(false);
    setCompiledOutput('');
    setCompileError('');
    setIsCompiling(false);
  }, [sourceCode, language]);

  useEffect(() => {
    const handleResize = () => {
      if (resultRef.current && showResult) {
        const newHeight = Math.min(
          Math.max(resultRef.current.scrollHeight, 200),
          window.innerHeight * 0.6
        );
        setIframeHeight(`${newHeight}px`);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showResult, sourceCode]);

  return (
    <div className="bg-[#0a0a0a] rounded-lg overflow-hidden shadow-lg mt-4 mx-0 sm:mx-2 border-[var(--glass-border)] border-1 " >
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--background-secondary)] px-4 py-2">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-300 mr-2">
            {language.toUpperCase()}
          </span>
          {isCompiling && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {supportsLivePreview && (
            <button
              onClick={() => setShowResult(prev => !prev)}
              className={`text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-md ${
                showResult ? 'bg-gray-600' : ''
              }`}
              title={showResult ? "Show Code" : "Show Live Preview"}
              aria-label={showResult ? "Show code" : "Show live preview"}
            >
              <FontAwesomeIcon 
                icon={showResult ? faCode : faEye} 
                className={showResult ? 'text-purple-400' : ''} 
              />
            </button>
          )}
          {!supportsLivePreview && (
            <button
              onClick={handleRunCode}
              disabled={isCompiling}
              className={`text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-md ${
                showResult ? 'bg-gray-600' : ''
              }`}
              title="Run Code"
              aria-label="Run code"
            >
              {isCompiling ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-blue-400" />
              ) : (
                <FontAwesomeIcon icon={faPlay} />
              )}
            </button>
          )}
          <button
            onClick={handleCopyCode}
            className="relative text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-md"
            title="Copy code"
            aria-label="Copy code"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-md animate-fadeInOut">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative overflow-x-auto w-full custom-scrollbar">
        <div
          className={`flex transition-transform duration-300 ease-in-out ${
            showResult ? '-translate-x-full' : 'translate-x-0'
          }`}
          style={{ width: '100%' }}
        >
          {/* Code Area */}
          <div className="w-full p-4 overflow-x-auto  flex-shrink-0">
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
            className="w-full flex-shrink-0 p-4 bg-[var(background-tertiary)] custom-scrollbar"
            ref={resultRef}
          >
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              {supportsLivePreview ? 'Live Preview:' : 'Output:'}
            </h4>
            {supportsLivePreview ? (
              <div 
                className="w-full border-gray-600 rounded-md overflow-hidden custom-scrollbar"
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
                    background: 'linear-gradient(to top, #2226 60%, transparent 100%)',
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
                      background: '#8888',
                      margin: '3px 0',
                    }}
                  />
                </div>
                {/* Resize handle for width */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '12px',
                    height: '100%',
                    cursor: 'ew-resize',
                    zIndex: 10,
                    background: 'linear-gradient(to left, #2226 60%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                  onMouseDown={e => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = resultRef.current ? resultRef.current.offsetWidth : 0;

                    const onMouseMove = moveEvent => {
                      const delta = moveEvent.clientX - startX;
                      let newWidth = startWidth + delta;
                      newWidth = Math.max(200, Math.min(newWidth, window.innerWidth * 0.95));
                      if (resultRef.current) {
                        resultRef.current.style.width = `${newWidth}px`;
                      }
                    };

                    const onMouseUp = () => {
                      window.removeEventListener('mousemove', onMouseMove);
                      window.removeEventListener('mouseup', onMouseUp);
                    };

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                  }}
                  title="Drag to resize preview width"
                >
                  <div
                    style={{
                      width: 6,
                      height: 40,
                      borderRadius: 3,
                      background: '#8888',
                      margin: '0 3px',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div 
                className="w-full border border-gray-600 rounded-md overflow-y-auto custom-scrollbar p-3 "
                style={{ 
                  height: iframeHeight,
                  backgroundColor: '#111827'
                }}
              >
                {isCompiling ? (
                  <div className="flex items-center justify-center h-full custom-scrollbar">
                    <div className="flex items-center gap-2 text-blue-400">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Running code...</span>
                    </div>
                  </div>
                ) : compileError ? (
                  <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono">
                    {compileError}
                  </pre>
                ) : (
                  <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                    {compiledOutput || 'Run the code to see output'}
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
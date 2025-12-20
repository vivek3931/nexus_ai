import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Play, Code, Lock, Crown, Eye, EyeOff, Terminal } from 'lucide-react'

export default function CodeBlock({ content, isPro, onUpgrade }) {
    const [copied, setCopied] = useState(false)
    const [viewMode, setViewMode] = useState('code') // 'code' or 'output'
    const [output, setOutput] = useState('')

    // Extract ALL code blocks from markdown content (including single backticks)
    const extractCode = () => {
        // Try triple backtick code blocks first
        const tripleMatch = content?.match(/```(\w+)?\n?([\s\S]*?)```/)
        if (tripleMatch) {
            return {
                language: tripleMatch[1] || 'code',
                code: tripleMatch[2].trim()
            }
        }

        // Try single backtick inline code
        const singleMatch = content?.match(/`([^`]+)`/)
        if (singleMatch) {
            return { language: 'code', code: singleMatch[1].trim() }
        }

        return null
    }

    const codeData = extractCode()
    if (!codeData) return null

    const { language, code } = codeData

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Determine if code is previewable
    const getPreviewType = () => {
        const lang = language.toLowerCase()
        if (['html', 'htm'].includes(lang)) return 'html'
        if (['css', 'scss', 'sass'].includes(lang)) return 'css'
        if (['javascript', 'js', 'jsx', 'ts', 'typescript'].includes(lang)) return 'javascript'
        if (['python', 'py'].includes(lang)) return 'python'
        if (['json'].includes(lang)) return 'json'
        return null
    }

    const previewType = getPreviewType()
    const isPreviewable = !!previewType

    // Execute code and get output
    const executeCode = () => {
        const type = previewType
        try {
            if (type === 'javascript') {
                // Capture console.log outputs
                const logs = []
                const originalLog = console.log
                console.log = (...args) => logs.push(args.map(a =>
                    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                ).join(' '))

                try {
                    const result = eval(code)
                    console.log = originalLog

                    if (logs.length > 0) {
                        return logs.join('\n')
                    }
                    return result !== undefined ? JSON.stringify(result, null, 2) : 'Code executed successfully (no output)'
                } catch (err) {
                    console.log = originalLog
                    throw err
                }
            }

            if (type === 'json') {
                const parsed = JSON.parse(code)
                return JSON.stringify(parsed, null, 2)
            }

            if (type === 'python') {
                // For Python, show the code with syntax highlighting note
                return `# Python Code (client-side preview)\n# For live execution, a Python backend is required\n\n${code}`
            }

            return null
        } catch (err) {
            return `❌ Error: ${err.message}`
        }
    }

    const handleRunCode = () => {
        if (!isPro) {
            onUpgrade?.()
            return
        }

        const result = executeCode()
        setOutput(result || '')
        setViewMode('output')
    }

    const getHtmlPreview = () => {
        const type = previewType
        if (type === 'html') return code
        if (type === 'css') {
            return `<style>${code}</style><div style="padding: 20px; font-family: system-ui; color: #333;">✅ CSS Applied Successfully</div>`
        }
        if (type === 'javascript') {
            return `
                <div id="output" style="font-family: 'JetBrains Mono', monospace; padding: 16px; background: #1e1e1e; color: #d4d4d4; min-height: 60px; white-space: pre-wrap;"></div>
                <script>
                    const logs = [];
                    const originalLog = console.log;
                    console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
                    try {
                        const result = (function() { ${code} })();
                        if (logs.length > 0) {
                            document.getElementById('output').innerHTML = logs.join('\\n');
                        } else if (result !== undefined) {
                            document.getElementById('output').innerHTML = JSON.stringify(result, null, 2);
                        } else {
                            document.getElementById('output').innerHTML = '<span style="color: #6a9955;">// Code executed successfully</span>';
                        }
                    } catch(e) {
                        document.getElementById('output').innerHTML = '<span style="color: #f14c4c;">Error: ' + e.message + '</span>';
                    }
                </script>
            `
        }
        return ''
    }

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-block-lang">
                    <Code size={14} />
                    {language}
                </span>
                <div className="code-block-actions">
                    {/* View Toggle */}
                    {isPreviewable && (
                        <div className="code-view-toggle">
                            <button
                                className={`code-toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
                                onClick={() => setViewMode('code')}
                                title="View Code"
                            >
                                <Code size={14} />
                            </button>
                            <button
                                className={`code-toggle-btn ${viewMode === 'output' ? 'active' : ''}`}
                                onClick={handleRunCode}
                                title={isPro ? "Run & View Output" : "Pro Feature"}
                            >
                                {isPro ? <Terminal size={14} /> : <Lock size={14} />}
                            </button>
                        </div>
                    )}

                    {/* Run Button */}
                    {isPreviewable && isPro && (
                        <button className="code-block-btn" onClick={handleRunCode}>
                            <Play size={14} />
                            Run
                        </button>
                    )}

                    {/* Copy Button */}
                    <button className="code-block-btn" onClick={handleCopy}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Code View */}
            {viewMode === 'code' && (
                <pre className="code-block-content">
                    <code>{code}</code>
                </pre>
            )}

            {/* Output View - Replaces code when active */}
            {viewMode === 'output' && isPro && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="code-output-container"
                >
                    {previewType === 'html' || previewType === 'css' || previewType === 'javascript' ? (
                        <iframe
                            className="code-output-frame"
                            srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <style>
                                        body { 
                                            font-family: system-ui, sans-serif; 
                                            margin: 0;
                                            padding: 0;
                                            background: #fff;
                                        }
                                        * { box-sizing: border-box; }
                                    </style>
                                </head>
                                <body>${getHtmlPreview()}</body>
                                </html>
                            `}
                            sandbox="allow-scripts"
                            title="Code Output"
                        />
                    ) : (
                        <pre className="code-output-text">{output}</pre>
                    )}
                </motion.div>
            )}

            {/* Pro Lock for Output */}
            {viewMode === 'output' && !isPro && (
                <motion.div
                    className="pro-feature-lock"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ margin: 0, borderRadius: 0 }}
                >
                    <div className="pro-feature-lock-icon">
                        <Lock size={24} />
                    </div>
                    <div className="pro-feature-lock-title">Live Output is a Pro Feature</div>
                    <div className="pro-feature-lock-text">
                        Upgrade to run code and see live output
                    </div>
                    <button className="upgrade-btn" onClick={onUpgrade}>
                        <Crown size={14} style={{ marginRight: '6px' }} />
                        Upgrade to Pro
                    </button>
                </motion.div>
            )}
        </div>
    )
}

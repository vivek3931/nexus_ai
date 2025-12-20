import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    Send, Menu, Plus, MessageSquare, LogOut, X, Lightbulb, Image as ImageIcon,
    Sparkles, Download, FileText, Lock, Crown, Zap, Clock, User, ArrowUp, Code,
    Unlock, Settings, Search, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react'
import { useAuth } from '../App'
import ImageModal from './ImageModal'
import CodeBlock from './CodeBlock'
import { CONFIG, ASSETS } from '../config'

const API_URL = CONFIG.API_URL

// Smooth Markdown Component - Fade+Blur Only (No Typewriter)
function SmoothMarkdown({ content, isPro }) {
    return (
        <div className="smooth-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeContent = String(children).replace(/\n$/, '')
                        if (!inline && match) {
                            return (
                                <CodeBlock
                                    content={`\`\`\`${match[1]}\n${codeContent}\n\`\`\``}
                                    isPro={isPro}
                                    onUpgrade={() => window.location.href = '/pricing'}
                                />
                            )
                        }
                        return <code className="inline-code" {...props}>{children}</code>
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default function Chat() {
    const { user, logout } = useAuth()
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('nexus_chats')
        return saved ? JSON.parse(saved) : []
    })
    const [activeChatId, setActiveChatId] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [isPro, setIsPro] = useState(true)
    const [uploadedImage, setUploadedImage] = useState(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const fileInputRef = useRef(null)

    // Get user's first name
    const getUserName = () => {
        if (user?.email) {
            const name = user.email.split('@')[0]
            return name.charAt(0).toUpperCase() + name.slice(1)
        }
        return 'there'
    }

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) return 'Good morning'
        if (hour >= 12 && hour < 17) return 'Good afternoon'
        if (hour >= 17 && hour < 21) return 'Good evening'
        return 'Hey'
    }

    // Get contextual fact
    const getContextualFact = () => {
        const hour = new Date().getHours()
        const morningFacts = [
            { icon: '☀️', text: 'Morning light boosts serotonin and improves focus' },
            { icon: '🧠', text: 'Your brain is most creative in the first few hours after waking' },
            { icon: '☕', text: 'The perfect coffee brewing temperature is 195-205°F' },
        ]
        const afternoonFacts = [
            { icon: '⚡', text: 'A 20-minute power nap can boost alertness by 100%' },
            { icon: '🚶', text: 'A short walk can increase creative thinking by 60%' },
            { icon: '💡', text: "Your brain's problem-solving peaks in the afternoon" },
        ]
        const eveningFacts = [
            { icon: '🌙', text: 'The brain processes the day during evening relaxation' },
            { icon: '📚', text: 'Reading before bed reduces stress by 68%' },
            { icon: '🌟', text: 'Stars you see tonight are light from years ago' },
        ]
        const nightFacts = [
            { icon: '🌌', text: 'There are more stars in the universe than grains of sand on Earth' },
            { icon: '💭', text: 'Dreams help consolidate memories and process emotions' },
            { icon: '✨', text: 'The universe is 13.8 billion years old' },
        ]

        let factPool
        if (hour >= 5 && hour < 12) factPool = morningFacts
        else if (hour >= 12 && hour < 17) factPool = afternoonFacts
        else if (hour >= 17 && hour < 21) factPool = eveningFacts
        else factPool = nightFacts

        const minute = new Date().getMinutes()
        return factPool[minute % factPool.length]
    }

    const [fact] = useState(getContextualFact())

    // Check for pending chat from Home page
    useEffect(() => {
        const pendingChat = localStorage.getItem('nexus_pending_chat')
        if (pendingChat) {
            const chatData = JSON.parse(pendingChat)
            localStorage.removeItem('nexus_pending_chat')

            // Create new chat
            const newChat = {
                id: chatData.id,
                title: chatData.title,
                messages: [],
                createdAt: chatData.createdAt,
                updatedAt: Date.now()
            }
            setChats(prev => [newChat, ...prev])
            setActiveChatId(chatData.id)

            // Set the input and trigger submit
            if (chatData.initialMessage) {
                setInput(chatData.initialMessage)
            }
            if (chatData.initialImage) {
                setUploadedImage(chatData.initialImage)
            }

            // Auto-submit after a brief delay
            setTimeout(() => {
                const form = document.querySelector('.floating-input-box')
                if (form) {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                }
            }, 100)
        }
    }, [])

    // Save chats to localStorage
    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem('nexus_chats', JSON.stringify(chats))
        }
    }, [chats])

    // Update current chat messages
    useEffect(() => {
        if (activeChatId && messages.length > 0) {
            setChats(prev => prev.map(chat =>
                chat.id === activeChatId
                    ? { ...chat, messages, updatedAt: Date.now() }
                    : chat
            ))
        }
    }, [messages, activeChatId])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setUploadedImage(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const createNewChat = () => {
        window.location.href = '/'
    }

    const deleteChat = (chatId, e) => {
        e.stopPropagation()
        setChats(prev => prev.filter(c => c.id !== chatId))
        if (activeChatId === chatId) {
            setActiveChatId(null)
            setMessages([])
        }
    }

    const switchChat = (chatId) => {
        const chat = chats.find(c => c.id === chatId)
        if (chat) {
            setActiveChatId(chatId)
            setMessages(chat.messages)
        }
    }

    const handleSubmit = async (e) => {
        e?.preventDefault()
        if ((!input.trim() && !uploadedImage) || loading) return

        let currentChatId = activeChatId
        if (!currentChatId) {
            currentChatId = Date.now().toString()
            const newChat = {
                id: currentChatId,
                title: input.slice(0, 30) || 'New Chat',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
            setChats(prev => [newChat, ...prev])
            setActiveChatId(currentChatId)
        }

        const userMessage = {
            role: 'user',
            content: input || 'Analyze this image',
            image: uploadedImage
        }

        if (messages.length === 0) {
            setChats(prev => prev.map(chat =>
                chat.id === currentChatId
                    ? { ...chat, title: input.slice(0, 40) || 'New Chat' }
                    : chat
            ))
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        const imageToSend = uploadedImage
        setUploadedImage(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input || 'Analyze this image and describe what you see',
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
                    imageData: imageToSend
                })
            })

            if (!response.ok) throw new Error('Failed')

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            let assistantMessage = { role: 'assistant', content: '', images: [], pdf: null, intent: 'general' }
            setMessages(prev => [...prev, assistantMessage])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line.slice(6))
                        if (data.type === 'text') {
                            assistantMessage.content += data.content
                            setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])
                        } else if (data.type === 'images') {
                            assistantMessage.images = data.images
                            setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])
                        } else if (data.type === 'pdf') {
                            assistantMessage.pdf = data.pdf
                            setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])
                        } else if (data.type === 'intent') {
                            assistantMessage.intent = data.intent
                        }
                    } catch (err) { }
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred.' }])
        } finally {
            setLoading(false)
        }
    }

    const suggestions = [
        { icon: <Lightbulb size={18} />, title: 'Explain something' },
        { icon: <ImageIcon size={18} />, title: 'Search images' },
        { icon: <FileText size={18} />, title: 'Generate PDF' },
        { icon: <Code size={18} />, title: 'Write code' }
    ]

    return (
        <div className="app-container">
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={() => setSidebarExpanded(true)}>
                <Menu size={20} />
            </button>

            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${sidebarExpanded ? 'visible' : ''}`}
                onClick={() => setSidebarExpanded(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={ASSETS.LOGO} alt="Nexus AI" className="sidebar-logo-img" />
                        {sidebarExpanded && <span className="sidebar-logo-text">{CONFIG.APP_NAME}</span>}
                    </div>
                </div>

                <div className="sidebar-content">
                    <button className="sidebar-item active" onClick={createNewChat}>
                        <Plus size={20} />
                        {sidebarExpanded && <span>New Chat</span>}
                    </button>

                    {sidebarExpanded && chats.length > 0 && (
                        <>
                            <div className="sidebar-section-title">Recent Chats</div>
                            {chats.slice(0, 10).map(chat => (
                                <div
                                    key={chat.id}
                                    className={`sidebar-item ${activeChatId === chat.id ? 'active' : ''}`}
                                    onClick={() => switchChat(chat.id)}
                                >
                                    <MessageSquare size={16} />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {chat.title}
                                    </span>
                                    <button
                                        onClick={(e) => deleteChat(chat.id, e)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </>
                    )}

                    {sidebarExpanded && !isPro && (
                        <div className="upgrade-card">
                            <div className="upgrade-card-title">
                                <Crown size={14} style={{ color: 'var(--amber-400)' }} />
                                Upgrade to Pro
                            </div>
                            <div className="upgrade-card-text">PDF generation, live preview & more</div>
                            <button className="upgrade-btn" onClick={() => window.location.href = '/pricing'}>
                                <Zap size={12} />View Plans
                            </button>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <button className="sidebar-item" onClick={logout}>
                        <LogOut size={20} />
                        {sidebarExpanded && <span>Sign out</span>}
                    </button>
                    <button className="sidebar-toggle" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                        {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="chat-container">
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="welcome-screen">
                                <motion.img
                                    src={ASSETS.LOGO}
                                    alt="Nexus AI"
                                    style={{ width: '64px', height: '64px', marginBottom: '24px' }}
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                <h1 className="welcome-title">{getGreeting()}, {getUserName()}</h1>

                                {/* Contextual Fact */}
                                <div className="welcome-fact-card">
                                    <span className="welcome-fact-icon">{fact.icon}</span>
                                    <span className="welcome-fact-text">{fact.text}</span>
                                </div>

                                <p className="welcome-subtitle">What would you like to explore today?</p>

                                <div className="suggestions-grid">
                                    {suggestions.map((s, i) => (
                                        <motion.div key={i} className="suggestion-card" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                                            <div className="suggestion-icon">{s.icon}</div>
                                            <div className="suggestion-title">{s.title}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <motion.div key={idx} className={`message ${msg.role}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="message-avatar">
                                        {msg.role === 'user' ? <User size={16} /> : <img src={ASSETS.LOGO} width={16} height={16} />}
                                    </div>
                                    <div className="message-content">
                                        {msg.image && (
                                            <img src={msg.image} alt="Uploaded" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px' }} />
                                        )}
                                        {msg.role === 'user' ? (
                                            <div className="message-bubble user">{msg.content}</div>
                                        ) : (
                                            <>
                                                <SmoothMarkdown content={msg.content} isPro={isPro} />

                                                {/* Image Grid */}
                                                {msg.images && msg.images.length > 0 && (
                                                    <div className="images-grid">
                                                        {msg.images.slice(0, 4).map((img, imgIdx) => (
                                                            <motion.div
                                                                key={imgIdx}
                                                                className="image-card"
                                                                onClick={() => setSelectedImage(img)}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: 1.5 + (imgIdx * 0.1) }} // Wait 1.5s for text to fade in
                                                            >
                                                                <img src={img.thumbnail || img.url} alt={img.title} onError={(e) => { e.target.style.display = 'none' }} />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* PDF Download */}
                                                {msg.pdf && (
                                                    <div className="pdf-card">
                                                        <div className="pdf-icon"><FileText size={24} /></div>
                                                        <div className="pdf-info">
                                                            <div className="pdf-title">Generated Document</div>
                                                            <div className="pdf-subtitle">Ready for download</div>
                                                        </div>
                                                        <a href={`${API_URL}${msg.pdf}`} target="_blank" rel="noopener noreferrer" className="pdf-download-btn">
                                                            <Download size={16} /> Download PDF
                                                        </a>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {loading && (
                            <div className="message assistant">
                                <div className="thinking-logo">
                                    <div className="thinking-logo-ring"></div>
                                    <img src={ASSETS.LOGO} alt="Thinking" className="thinking-logo-img" />
                                </div>
                                <div className="message-content">
                                    <div className="message-bubble" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="floating-input-container">
                        <form className="floating-input-box" onSubmit={handleSubmit}>
                            {uploadedImage && (
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={uploadedImage} alt="Upload" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>Image attached</span>
                                    <button type="button" onClick={() => setUploadedImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <div className="floating-input-main">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="floating-input"
                                    placeholder="Message Nexus AI..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                            <div className="floating-input-footer">
                                <div className="floating-input-actions">
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                                    <button type="button" className="floating-action-btn" onClick={() => fileInputRef.current?.click()} title="Upload image">
                                        <Plus size={18} />
                                    </button>
                                    <button type="button" className="floating-action-btn" title="History">
                                        <Clock size={18} />
                                    </button>
                                    <button type="button" className="floating-action-btn" title="Discover">
                                        <Sparkles size={18} />
                                    </button>
                                </div>
                                <button type="submit" className="floating-send-btn" disabled={(!input.trim() && !uploadedImage) || loading}>
                                    {loading ? <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div> : <ArrowUp size={18} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
        </div>
    )
}

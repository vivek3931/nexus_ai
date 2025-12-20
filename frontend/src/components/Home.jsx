import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Clock, ArrowUp, X } from 'lucide-react'
import { useAuth } from '../App'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [input, setInput] = useState('')
    const [uploadedImage, setUploadedImage] = useState(null)
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

    // Get contextual fact based on time
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
            { icon: '🌌', text: 'There are more stars than grains of sand on Earth' },
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

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setUploadedImage(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e) => {
        e?.preventDefault()
        if (!input.trim() && !uploadedImage) return

        // Store message for chat page to pick up
        const chatId = Date.now().toString()
        localStorage.setItem('nexus_pending_chat', JSON.stringify({
            id: chatId,
            title: input.slice(0, 40) || 'New Chat',
            initialMessage: input,
            initialImage: uploadedImage,
            createdAt: Date.now()
        }))

        navigate('/chat')
    }

    return (
        <div className="home-page">
            <motion.div
                className="home-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Logo */}
                <motion.img
                    src="/soul_logo.svg"
                    alt="Nexus AI"
                    className="home-logo"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Greeting */}
                <h1 className="home-greeting">{getGreeting()}, {getUserName()}</h1>

                {/* Fact Card */}
                <motion.div
                    className="home-fact"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="home-fact-icon">{fact.icon}</span>
                    <span className="home-fact-text">{fact.text}</span>
                </motion.div>

                {/* SAME Floating Input as Chat Page */}
                <motion.div
                    className="floating-input-container home-input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
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
                                type="text"
                                className="floating-input"
                                placeholder="How can I help you today?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
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
                            </div>
                            <button type="submit" className="floating-send-btn" disabled={!input.trim() && !uploadedImage}>
                                <ArrowUp size={18} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    )
}

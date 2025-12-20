import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Clock, ArrowUp, X } from 'lucide-react'
import { useAuth } from '../App'

import { ASSETS } from '../config'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [input, setInput] = useState('')
    const [uploadedImage, setUploadedImage] = useState(null)
    const fileInputRef = useRef(null)

    // ... (rest of logic) ...

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
                    src={ASSETS.LOGO}
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

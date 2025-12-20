import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, ArrowLeft, FileText, Code, Image as ImageIcon, Bot } from 'lucide-react'
import { useAuth } from '../App'

const API_URL = 'http://localhost:5000/api'

export default function Pricing() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isYearly, setIsYearly] = useState(false)

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePayment = async () => {
        setLoading(true)

        const res = await loadRazorpay()
        if (!res) {
            alert('Razorpay SDK failed to load')
            setLoading(false)
            return
        }

        const amount = isYearly ? 4999 : 499

        const options = {
            key: 'rzp_test_your_key_here', // Replace with your Razorpay key
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            name: 'Nexus AI',
            description: `${isYearly ? 'Yearly' : 'Monthly'} Pro Plan`,
            image: '/soul_logo.svg',
            handler: function (response) {
                alert('Payment successful! Payment ID: ' + response.razorpay_payment_id)
                localStorage.setItem('isPro', 'true')
                window.location.href = '/'
            },
            prefill: {
                email: user?.email || '',
            },
            theme: {
                color: '#f59e0b'
            }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
        setLoading(false)
    }

    const features = {
        free: [
            { text: 'AI Chat (Unlimited)', included: true },
            { text: 'Image Search', included: true },
            { text: 'Basic Responses', included: true },
            { text: 'PDF Generation', included: false },
            { text: 'Live Code Preview', included: false },
            { text: 'Image OCR', included: false },
        ],
        pro: [
            { text: 'AI Chat (Unlimited)', included: true },
            { text: 'Image Search', included: true },
            { text: 'Priority Responses', included: true },
            { text: 'PDF Generation', included: true },
            { text: 'Live Code Preview', included: true },
            { text: 'Image OCR', included: true },
        ]
    }

    return (
        <div className="pricing-container">
            <motion.button
                onClick={() => window.location.href = '/'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px'
                }}
            >
                <ArrowLeft size={16} /> Back
            </motion.button>

            <motion.div
                className="pricing-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <img src="/soul_logo.svg" alt="Nexus AI" style={{ width: '56px', height: '56px' }} />
                </div>
                <h1 className="pricing-title">Choose Your Plan</h1>
                <p className="pricing-subtitle">Unlock the full power of Nexus AI</p>

                {/* Monthly/Yearly Toggle */}
                <div className="pricing-toggle-container">
                    <span className={`pricing-toggle-label ${!isYearly ? 'active' : ''}`}>Monthly</span>
                    <button
                        className={`pricing-toggle ${isYearly ? 'yearly' : ''}`}
                        onClick={() => setIsYearly(!isYearly)}
                    >
                        <div className="pricing-toggle-knob" />
                    </button>
                    <span className={`pricing-toggle-label ${isYearly ? 'active' : ''}`}>
                        Yearly
                        <span className="pricing-save-badge">Save 17%</span>
                    </span>
                </div>
            </motion.div>

            <div className="pricing-cards">
                {/* Free Plan */}
                <motion.div
                    className="pricing-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="pricing-card-title">Free</div>
                    <div className="pricing-card-price">₹0 <span>/forever</span></div>
                    <div className="pricing-card-desc">Get started with basic features</div>

                    <ul className="pricing-features">
                        {features.free.map((f, i) => (
                            <li key={i} style={{ opacity: f.included ? 1 : 0.5 }}>
                                <Check size={16} style={{ color: f.included ? 'var(--success)' : 'var(--text-muted)' }} />
                                {f.text}
                            </li>
                        ))}
                    </ul>

                    <button className="pricing-btn secondary">Current Plan</button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    className="pricing-card featured"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="pricing-popular-badge">
                        <Crown size={12} /> Most Popular
                    </div>
                    <div className="pricing-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Pro <Crown size={16} style={{ color: 'var(--amber-400)' }} />
                    </div>
                    <div className="pricing-card-price">
                        {isYearly ? '₹4,999' : '₹499'}
                        <span>/{isYearly ? 'year' : 'month'}</span>
                    </div>
                    <div className="pricing-card-desc">
                        {isYearly ? 'Best value! Save ₹989/year' : 'Everything for power users'}
                    </div>

                    <ul className="pricing-features">
                        {features.pro.map((f, i) => (
                            <li key={i}>
                                <Check size={16} style={{ color: 'var(--success)' }} />
                                {f.text}
                            </li>
                        ))}
                    </ul>

                    <button
                        className="pricing-btn primary"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (
                            <><Zap size={16} /> Upgrade Now</>
                        )}
                    </button>
                </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    maxWidth: '800px',
                    margin: '48px auto 0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px'
                }}
            >
                {[
                    { icon: <Bot size={20} />, title: 'AI Chat', desc: 'Powered by Groq' },
                    { icon: <ImageIcon size={20} />, title: 'Image Search', desc: 'From Wikimedia' },
                    { icon: <FileText size={20} />, title: 'PDF Export', desc: 'Pro feature' },
                    { icon: <Code size={20} />, title: 'Live Preview', desc: 'Pro feature' }
                ].map((f, i) => (
                    <div key={i} style={{
                        padding: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 10px',
                            color: 'var(--amber-400)'
                        }}>
                            {f.icon}
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{f.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.desc}</div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

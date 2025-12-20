import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, ArrowRight, Loader2 } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [step, setStep] = useState('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isNewUser, setIsNewUser] = useState(false)
    const otpRefs = useRef([])

    const handleRequestOTP = async (e) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
                setIsNewUser(data.isNewUser)
                setStep('otp')
            } else {
                setError(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const handleOTPKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        const otpString = otp.join('')
        if (otpString.length !== 6) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                window.location.href = '/'
            } else {
                setError(data.error || 'Invalid OTP')
                setOtp(['', '', '', '', '', ''])
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* Background glow effects */}
            <div style={{
                position: 'fixed',
                top: '15%',
                left: '25%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                bottom: '15%',
                right: '25%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo">
                    <motion.img
                        src="/soul_logo.svg"
                        alt="Nexus AI"
                        style={{ width: '52px', height: '52px', marginBottom: '14px' }}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <h1 className="auth-title">Nexus AI</h1>
                    <p className="auth-subtitle">
                        {step === 'email'
                            ? 'Enter your email to get started'
                            : `Enter the code sent to ${email}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'email' ? (
                        <motion.form
                            key="email-form"
                            className="auth-form"
                            onSubmit={handleRequestOTP}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="auth-input-group">
                                <label className="auth-label">Email address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{
                                        position: 'absolute',
                                        left: '18px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)',
                                        width: '18px'
                                    }} />
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ paddingLeft: '48px' }}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center' }}
                                >
                                    {error}
                                </motion.p>
                            )}

                            <button type="submit" className="auth-btn" disabled={loading || !email}>
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>Continue <ArrowRight size={18} /></>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            className="auth-form"
                            onSubmit={handleVerifyOTP}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        className="otp-input"
                                        value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                        maxLength={1}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center' }}
                                >
                                    {error}
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                className="auth-btn"
                                disabled={loading || otp.join('').length !== 6}
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    isNewUser ? 'Create Account' : 'Sign In'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                ← Use different email
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

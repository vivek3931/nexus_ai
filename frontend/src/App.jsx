import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import Home from './components/Home'
import Chat from './components/Chat'
import Pricing from './components/Pricing'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(localStorage.getItem('token'))

    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token')
            if (savedToken) {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        headers: { 'Authorization': `Bearer ${savedToken}` }
                    })
                    if (response.ok) {
                        const data = await response.json()
                        setUser(data.user)
                        setToken(savedToken)
                    } else {
                        localStorage.removeItem('token')
                        setToken(null)
                    }
                } catch (error) {
                    console.error('Auth check failed:', error)
                }
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    const login = (userData, authToken) => {
        setUser(userData)
        setToken(authToken)
        localStorage.setItem('token', authToken)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
    }

    if (loading) {
        return (
            <div className="auth-page">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <img src="/soul_logo.svg" alt="Loading" style={{ width: '48px', height: '48px', animation: 'pulse 1.5s infinite' }} />
                </div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            <Routes>
                <Route path="/auth" element={!token ? <Auth /> : <Navigate to="/" />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/" element={token ? <Home /> : <Navigate to="/auth" />} />
                <Route path="/chat" element={token ? <Chat /> : <Navigate to="/auth" />} />
            </Routes>
        </AuthContext.Provider>
    )
}

export default App

'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    
    useEffect(() => {
        checkAuth()
    }, [])
    
    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }
        
        try {
            const res = await fetch('http://127.0.0.1:5000/api/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            } else {
                localStorage.removeItem('token')
                router.push('/')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }
    
    const login = async (credentials) => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            })
            
            const data = await res.json()
            
            if (res.ok) {
                localStorage.setItem('token', data.token)
                setUser(data.user)
                return { success: true }
            } else {
                return { success: false, error: data.error }
            }
        } catch (error) {
            console.error('Login failed:', error)
            return { success: false, error: 'Login failed' }
        }
    }
    
    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        router.push('/')
    }
    
    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            checkAuth
        }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
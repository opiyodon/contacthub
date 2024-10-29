'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      router.push('/')
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
        // Set token in cookies for middleware
        document.cookie = `token=${token}; path=/`
        
        if (window.location.pathname === '/') {
          router.push('/dashboard')
        }
      } else {
        handleLogout()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      handleLogout()
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
        const token = data.token
        localStorage.setItem('token', token)
        // Set token in cookies for middleware
        document.cookie = `token=${token}; path=/`
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    // Remove token from cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    setUser(null)
    router.push('/')
}

const logout = async () => {
    setLoading(true)
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            handleLogout()
            return
        }

        const res = await fetch('http://127.0.0.1:5000/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error('Logout failed')
        }
    } catch (error) {
        console.error('Logout error:', error)
        toast.error('Logout failed')
    } finally {
        handleLogout()
        setLoading(false)
    }
}

const deleteAccount = async (password) => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error('Authentication required')
            return false
        }

        const res = await fetch('http://127.0.0.1:5000/api/delete-account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password })
        })

        if (res.ok) {
            toast.success('Account deleted successfully')
            handleLogout()
            return true
        } else {
            const data = await res.json()
            toast.error(data.error || 'Failed to delete account')
            return false
        }
    } catch (error) {
        console.error('Delete account error:', error)
        toast.error('An error occurred while deleting account')
        return false
    }
}

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      deleteAccount,
      checkAuth
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
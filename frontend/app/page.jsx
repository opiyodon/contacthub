'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Lock, Mail, Loader2 } from 'lucide-react'
import { Spinner, useDisclosure } from "@nextui-org/react"
import { Toaster, toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)  // Changed to true initially
  const router = useRouter()

  // Add useEffect to handle initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Show loading for 1.5 seconds

    return () => clearTimeout(timer)
  }, [])

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/20 p-8 rounded-2xl animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FF9500] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#FF9500] border-b-transparent border-l-transparent animate-spin-reverse"></div>
          </div>
          <p className="text-white text-xl font-medium">Loading...</p>
        </div>
      </div>
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.token)

        toast.success("Successfully logged in! Redirecting to Dashboard...")

        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error("Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-4">
      <Toaster richColors position="top-center" />
      {isLoading && <LoadingOverlay />}

      <div className="glass-effect p-8 rounded-2xl max-w-md w-full space-y-8 animate-glow-mini">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#FF9500] rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9500]/0 via-white/20 to-[#FF9500]/0 animate-shimmer"></div>
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold text-white">
            ContactHub X50
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Sign in to manage your contacts
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full h-12 glass-effect rounded-xl px-4 pl-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full h-12 glass-effect rounded-xl px-4 pl-11 pr-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot_password"
              className="text-sm font-medium text-[#FF9500] hover:text-[#FF9500]/80"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 flex items-center justify-center space-x-2 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9500] transition-colors duration-200 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Spinner color="white" size="sm" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#FF9500] hover:text-[#FF9500]/80 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
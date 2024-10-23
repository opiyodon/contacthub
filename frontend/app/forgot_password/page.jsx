'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { Spinner } from "@nextui-org/react"
import { Toaster, toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

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
      const res = await fetch('http://127.0.0.1:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success("Reset instructions sent successfully!")
        setTimeout(() => {
          router.push('/')
        }, 5000)
      } else {
        throw new Error('Failed to send reset email')
      }
    } catch (error) {
      console.error('Failed to send reset email:', error)
      toast.error("Failed to send reset instructions. Please try again.")
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
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Enter your email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-block p-3 rounded-full bg-green-500/20">
                <Mail className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg text-white">
                Reset instructions have been sent to your email.
              </p>
              <p className="text-sm text-gray-400">
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            <Link
              href="/"
              className="w-full h-12 flex items-center justify-center space-x-2 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9500] transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Return to Login</span>
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center space-x-2 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9500] transition-colors duration-200 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Spinner color="white" size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>

              <Link
                href="/"
                className="w-full h-12 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9500] transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
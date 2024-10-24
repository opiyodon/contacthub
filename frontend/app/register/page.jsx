'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Lock, Mail, UserPlus } from 'lucide-react'
import { Spinner } from "@nextui-org/react"
import { Toaster, toast } from "sonner"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

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

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (res.ok) {
                // Store the token
                localStorage.setItem('token', data.token)
                toast.success("Registration successful! Redirecting to Dashboard...")
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            } else {
                throw new Error(data.error || 'Registration failed')
            }
        } catch (error) {
            toast.error(error.message || "Registration failed. Please try again.")
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
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-bold text-white">
                        Create Account
                    </h2>
                    <p className="mt-2 text-center text-gray-400">
                        Join ContactHub X50 today
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-white mb-1.5 block">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full h-12 glass-effect rounded-xl px-4 pl-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-white mb-1.5 block">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full h-12 glass-effect rounded-xl px-4 pl-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    required
                                    className="w-full h-12 glass-effect rounded-xl px-4 pl-11 pr-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    minLength={8}
                                />
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (<EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-white mb-1.5 block">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    className="w-full h-12 glass-effect rounded-xl px-4 pl-11 pr-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    minLength={8}
                                />
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white focus:outline-none"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="text-[#FF9500] hover:text-[#FF9500]/80">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-[#FF9500] hover:text-[#FF9500]/80">
                            Privacy Policy
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
                                <span className="ml-2">Creating Account...</span>
                            </>
                        ) : (
                            <span>Create Account</span>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-gray-400">
                            Already have an account?{" "}
                            <Link
                                href="/"
                                className="text-[#FF9500] hover:text-[#FF9500]/80 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
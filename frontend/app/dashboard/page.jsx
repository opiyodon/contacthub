'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Mail, Phone, MapPin, Hash, Plus, Settings, Bell, Menu, X, LogOut, Trash2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useAuth } from '../utils/auth'
import { Link } from '@nextui-org/react'

export default function Dashboard() {
    const [contactData, setContactData] = useState({
        mobile: '',
        email: '',
        address: '',
        registration_number: ''
    })
    const [stats, setStats] = useState({
        total_contacts: 0,
        recent_added: 0,
        recent_activities: []
    })
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(true)  // Changed to true initially
    const router = useRouter()
    const { logout, deleteAccount } = useAuth()

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

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await logout()

            toast.success("Successfully logged out!")

            setTimeout(() => {
                router.push('/')
            }, 1000)
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            if (!password) {
                toast.error('Please enter your password')
                return
            }

            setIsLoading(true)
            const success = await deleteAccount(password)

            if (success) {
                toast.success("Account successfully deleted. Redirecting...")
                setShowDeleteModal(false)
                setTimeout(() => {
                    router.push('/')
                }, 2500)
            }
        } catch (error) {
            console.error('Delete account error:', error)
            toast.error('Failed to delete account. Please check your password and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelDelete = () => {
        setShowDeleteModal(false)
        setPassword('')
        toast.success("Phew! We're glad you're staying with us! 🎉")
    }

    const DeleteAccountModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-effect p-6 rounded-2xl max-w-md w-full space-y-6 animate-glow-mini">
                <h2 className="text-2xl font-bold text-white">Delete Account</h2>
                <p className="text-gray-400">
                    This action cannot be undone. Please enter your password to confirm.
                </p>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 glass-effect rounded-xl px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                />
                <div className="flex space-x-4">
                    <button
                        onClick={handleCancelDelete}
                        className="flex-1 h-12 glass-effect rounded-xl text-white hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    )

    useEffect(() => {
        fetchStats()
        const statsInterval = setInterval(fetchStats, 60000) // Update every minute
        return () => clearInterval(statsInterval)
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/contacts/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await fetch('http://127.0.0.1:5000/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(contactData)
            })
            if (res.ok) {
                toast.success("Contact added successfully!")
                setContactData({
                    mobile: '',
                    email: '',
                    address: '',
                    registration_number: ''
                })
                fetchStats() // Refresh stats after adding contact
            } else {
                throw new Error('Failed to create contact')
            }
        } catch (error) {
            console.error('Failed to create contact:', error)
            toast.error('Failed to create contact. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#2A2A2A]">
            <Toaster richColors position="top-center" />
            {isLoading && <LoadingOverlay />}
            {showDeleteModal && <DeleteAccountModal />}

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-effect z-50 flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#FF9500] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <Link href="/dashboard">
                        <h1 className="text-lg font-bold text-white">ContactHub X50</h1>
                    </Link>
                </div>
                <button
                    className="p-2 glass-effect rounded-lg"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Menu className="w-6 h-6 text-white" />
                    )}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full glass-effect flex flex-col items-center py-8 space-y-8 transition-all duration-300 z-50
                ${isSidebarOpen ? 'w-16 sidebar-open' : 'w-0 sidebar-closed'} 
                lg:w-16 lg:translate-x-0`}
            >
                <div className="hidden lg:flex w-10 h-10 bg-[#FF9500] rounded-full items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-4">
                    <button className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:bg-[#FF9500]/20">
                        <Bell className="w-5 h-5 text-white" />
                    </button>
                    <button className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:bg-[#FF9500]/20">
                        <Settings className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:bg-red-500/20"
                        title="Delete Account"
                    >
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:bg-[#FF9500]/20"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="lg:pl-16 pt-16 lg:pt-0">
                <div className="container mx-auto p-4 lg:p-8">
                    {/* Top Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <h1 className="text-2xl font-bold text-white hidden sm:block">ContactHub X50</h1>
                            </Link>
                            <span className="text-gray-400">Manage your contacts efficiently</span>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Stats Section - Mobile Optimized */}
                        <div className="lg:col-span-3">
                            <div className="glass-effect rounded-2xl p-4 animate-glow-mini-extra">
                                <div className="grid grid-cols-2 gap-4 lg:block lg:space-y-6">
                                    <div className="glass-effect rounded-xl p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">Total Contacts</h3>
                                        <p className="text-2xl font-bold text-white">{stats.total_contacts}</p>
                                    </div>
                                    <div className="glass-effect rounded-xl p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">Recent Added</h3>
                                        <p className="text-2xl font-bold text-white">{stats.recent_added}</p>
                                    </div>
                                </div>

                                <div className="mt-6 hidden lg:block">
                                    <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
                                    <div className="space-y-4">
                                        {stats.recent_activities.map((activity, i) => (
                                            <div key={i} className="flex items-center space-x-3 glass-effect rounded-xl p-3">
                                                <div className="w-10 h-10 bg-[#FF9500]/20 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-[#FF9500]" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{activity.details}</p>
                                                    <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Section - Mobile Optimized */}
                        <div className="lg:col-span-9">
                            <div className="glass-effect rounded-2xl p-4 animate-glow-mini">
                                {/* Categories - Mobile Optimized */}
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 lg:pb-0">
                                    <button className="px-4 py-2 rounded-full bg-[#FF9500] text-white text-sm whitespace-nowrap">
                                        All Categories
                                    </button>
                                    <button className="px-4 py-2 rounded-full glass-effect text-white hover:bg-[#FF9500]/20 text-sm whitespace-nowrap">
                                        Recent
                                    </button>
                                    <button className="px-4 py-2 rounded-full glass-effect text-white hover:bg-[#FF9500]/20 text-sm whitespace-nowrap">
                                        Popular
                                    </button>
                                </div>

                                {/* Form - Mobile Optimized */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-white mb-1.5 block">Mobile Phone</label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    required
                                                    className="w-full h-12 glass-effect rounded-xl px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                                    placeholder="Enter mobile number"
                                                    value={contactData.mobile}
                                                    onChange={(e) => setContactData({ ...contactData, mobile: e.target.value })}
                                                />
                                                <Phone className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-white mb-1.5 block">Email Address</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full h-12 glass-effect rounded-xl px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                                    placeholder="Enter email address"
                                                    value={contactData.email}
                                                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                                />
                                                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-white mb-1.5 block">Address</label>
                                            <div className="relative">
                                                <textarea
                                                    required
                                                    className="w-full glass-effect rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5 resize-none"
                                                    placeholder="Enter address"
                                                    rows="3"
                                                    value={contactData.address}
                                                    onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                                                />
                                                <MapPin className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-white mb-1.5 block">Registration Number</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full h-12 glass-effect rounded-xl px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                                                    placeholder="Enter registration number"
                                                    value={contactData.registration_number}
                                                    onChange={(e) => setContactData({ ...contactData, registration_number: e.target.value })}
                                                />
                                                <Hash className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-12 flex items-center justify-center space-x-2 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9500] transition-colors duration-200"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add Contact</span>
                                    </button>
                                </form>

                                <SearchContact />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function SearchContact() {
    const [searchReg, setSearchReg] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchReg.trim()) {
            toast.error('Please enter a registration number')
            return
        }

        setLoading(true)
        setError(null)
        setSearchResult(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            const res = await fetch(`http://127.0.0.1:5000/api/contacts/search?registration_number=${encodeURIComponent(searchReg)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to search contact')
            }

            const data = await res.json()
            setSearchResult(data)
            if (!data) {
                toast.error('No contact found with this registration number')
            }
        } catch (error) {
            console.error('Search failed:', error)
            setError(error.message)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-white">Search Contact</h2>

            <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full h-12 glass-effect rounded-xl px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white/5"
                        placeholder="Enter registration number"
                        value={searchReg}
                        onChange={(e) => setSearchReg(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                    type="submit"
                    className="w-full h-12 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9500] transition-colors duration-200"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Searching...</span>
                        </div>
                    ) : (
                        'Search'
                    )}
                </button>
            </form>

            {error && (
                <div className="p-4 rounded-xl glass-effect bg-red-500/10 text-red-400">
                    {error}
                </div>
            )}

            {searchResult && (
                <div className="mt-6 p-4 rounded-xl glass-effect bg-white/5 animate-fade-in">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Mobile</p>
                            <p className="font-medium text-white break-words">{searchResult.mobile}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Email</p>
                            <p className="font-medium text-white break-words">{searchResult.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Address</p>
                            <p className="font-medium text-white break-words">{searchResult.address}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Registration Number</p>
                            <p className="font-medium text-white break-words">{searchResult.registration_number}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
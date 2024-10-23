'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Mail, Phone, MapPin, Hash, Plus, Settings, Bell, Menu, X } from 'lucide-react'

export default function Dashboard() {
    const [contactData, setContactData] = useState({
        mobile: '',
        email: '',
        address: '',
        registration_number: ''
    })
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(contactData)
            })
            if (res.ok) {
                setContactData({
                    mobile: '',
                    email: '',
                    address: '',
                    registration_number: ''
                })
            }
        } catch (error) {
            console.error('Failed to create contact:', error)
        }
    }

    return (
        <div className="min-h-screen bg-[#2A2A2A]">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-effect z-50 flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#FF9500] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-white">ContactHub X50</h1>
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
                </div>
            </div>

            {/* Main Content */}
            <main className="lg:pl-16 pt-16 lg:pt-0">
                <div className="container mx-auto p-4 lg:p-8">
                    {/* Top Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-white hidden sm:block">ContactHub X50</h1>
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
                                        <p className="text-2xl font-bold text-white">1,234</p>
                                    </div>
                                    <div className="glass-effect rounded-xl p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">Recent Added</h3>
                                        <p className="text-2xl font-bold text-white">25</p>
                                    </div>
                                </div>

                                <div className="mt-6 hidden lg:block">
                                    <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
                                    <div className="space-y-4">
                                        {[1, 2].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-3 glass-effect rounded-xl p-3">
                                                <div className="w-10 h-10 bg-[#FF9500]/20 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-[#FF9500]" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">New Contact Added</p>
                                                    <p className="text-gray-400 text-xs">2 hours ago</p>
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

    const handleSearch = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`/api/contacts/search?registration_number=${searchReg}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = await res.json()
            if (res.ok) {
                setSearchResult(data)
            } else {
                setSearchResult(null)
            }
        } catch (error) {
            console.error('Search failed:', error)
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
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {searchResult && (
                <div className="mt-6 p-4 rounded-xl glass-effect bg-white/5">
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
                    </div>
                </div>
            )}
        </div>
    )
}
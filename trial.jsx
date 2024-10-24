'use client'

// ... (previous imports remain the same)

export default function Dashboard() {
    // ... (previous state and functions remain the same until the stats section)

    return (
        <div className="min-h-screen bg-[#2A2A2A]">
            {/* ... (previous code remains the same until the stats section) */}
            
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

                        {/* Updated Recent Activity Section */}
                        <div className="mt-6 hidden lg:block">
                            <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
                            <div className="space-y-4">
                                {stats.recent_activities.map((activity, i) => (
                                    <div 
                                        key={i} 
                                        className="glass-effect rounded-xl p-4 transition-all duration-200 hover:bg-white/5"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-[#FF9500]/20 rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-[#FF9500]" />
                                            </div>
                                            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent flex item from overflowing */}
                                                <p className="text-white text-sm font-medium leading-5 break-words">
                                                    {activity.details}
                                                </p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {activity.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ... (rest of the code remains the same) */}
            </div>
        </div>
    )
}

// ... (rest of the code remains the same)
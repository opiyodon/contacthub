'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function NotFound() {
  useEffect(() => {
    document.body.style.background = '#2A2A2A'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-4">
      <div className="glass-effect p-8 rounded-2xl max-w-lg w-full space-y-8 animate-glow-mini text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-[#FF9500]">404</h1>
          <h2 className="text-3xl font-bold text-white mt-4">Page Not Found</h2>
          <p className="mt-4 text-gray-400">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block px-6 py-3 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Go Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

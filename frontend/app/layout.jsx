import { Orbitron } from 'next/font/google'
import './globals.css'
import { NextUIProvider } from '@nextui-org/react'

const orbitron = Orbitron({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export const metadata = {
  title: 'ContactHub X50',
  description: 'Modern contact management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NextUIProvider>
            {children}
          </NextUIProvider>
        </div>
      </body>
    </html>
  )
}
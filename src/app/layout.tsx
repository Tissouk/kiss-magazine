import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kiss Magazine - Korean Culture & Fashion',
  description: 'Discover authentic Korean fashion, beauty, and culture. Shop K-beauty, K-fashion, and join our global Korean culture community.',
  keywords: 'Korean fashion, K-beauty, K-pop, Korean culture, Seoul fashion, Korean skincare',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kiss Magazine - Korean Culture & Fashion Hub',
  description: 'Discover authentic Korean fashion, K-beauty, and connect with Korean culture enthusiasts worldwide. Shop from Seoul, join our community, earn rewards.',
  keywords: 'Korean fashion, K-beauty, K-pop, Korean culture, Seoul fashion, Korean skincare, K-drama, Korean brands',
  openGraph: {
    title: 'Kiss Magazine - Korean Culture & Fashion Hub',
    description: 'Your gateway to authentic Korean culture, fashion, and beauty',
    url: 'https://kiss-magazine.org',
    siteName: 'Kiss Magazine',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
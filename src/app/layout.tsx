import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] })
const notoSansKR = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-korean'
});

export const metadata: Metadata = {
  title: 'Kiss Magazine - Korean Culture & Fashion',
  description: 'Discover the latest in K-POP, K-DRAMA, K-FASHION, K-BEAUTY, and Korean culture. Shop authentic Korean products and join our global community.',
  keywords: 'Korean fashion, K-beauty, K-pop, Korean culture, Seoul fashion, Korean skincare',
  authors: [{ name: 'Kiss Magazine Korea' }],
  creator: 'Kiss Magazine Korea',
  publisher: 'Kiss Magazine Korea',
  metadataBase: new URL('https://kiss-magazine.org')
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'fr': '/fr',
      'es': '/es',
      'ja': '/ja',
      'zh': '/zh',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kiss-magazine.org',
    title: 'Kiss Magazine Korea - Your Gateway to Korean Culture',
    description: 'Discover the latest in K-POP, K-DRAMA, K-FASHION, K-BEAUTY, and Korean culture.',
    siteName: 'Kiss Magazine',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kiss Magazine Korea - Korean Culture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiss Magazine Korea - Your Gateway to Korean Culture',
    description: 'Discover the latest in K-POP, K-DRAMA, K-FASHION, K-BEAUTY, and Korean culture.',
    creator: '@kiss_magazine',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${notoSansKR.variable}`}>
      <body className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        
        {/* Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Google Analytics
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </body>
    </html>
  );
}

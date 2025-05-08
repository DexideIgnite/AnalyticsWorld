import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { ErrorBoundary } from './components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Analytics World - YouTube Growth Platform',
  description: 'Your all-in-one platform for discovering profitable niches, mastering growth strategies, and building a successful YouTube channel.',
  keywords: ['YouTube', 'analytics', 'growth', 'niche', 'strategy', 'content creation'],
  authors: [{ name: 'Analytics World Team' }],
  openGraph: {
    title: 'Analytics World - YouTube Growth Platform',
    description: 'Your all-in-one platform for discovering profitable niches, mastering growth strategies, and building a successful YouTube channel.',
    url: 'https://analyticsworld.com',
    siteName: 'Analytics World',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analytics World - YouTube Growth Platform',
    description: 'Your all-in-one platform for discovering profitable niches, mastering growth strategies, and building a successful YouTube channel.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <ErrorBoundary>
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  )
} 
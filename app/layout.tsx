import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from './components/Footer'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Analytics World - YouTube Growth Platform',
  description: 'Your all-in-one platform for discovering profitable niches, mastering growth strategies, and building a successful YouTube channel.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <nav className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-xl font-bold text-red-600 hover:text-red-500">
                    Analytics World
                  </Link>
                </div>
                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                  <Link
                    href="/niche-explorer"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-red-500 hover:text-gray-900"
                  >
                    Niche Explorer
                  </Link>
                  <Link
                    href="/growth-strategies"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-red-500 hover:text-gray-900"
                  >
                    Growth Strategies
                  </Link>
                  <Link
                    href="/analytics"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-red-500 hover:text-gray-900"
                  >
                    Analytics
                  </Link>
                </div>
              </div>
              <div className="hidden sm:flex sm:items-center">
                <Link
                  href="/signup"
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
} 
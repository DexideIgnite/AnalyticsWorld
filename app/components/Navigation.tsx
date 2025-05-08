'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Niche Explorer', href: '/niche-explorer' },
  { name: 'Growth Strategies', href: '/growth-strategies' },
  { name: 'Analytics', href: '/analytics' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
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
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                    pathname === item.href
                      ? 'border-red-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-red-500 hover:text-gray-900'
                  )}
                >
                  {item.name}
                </Link>
              ))}
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
  )
} 
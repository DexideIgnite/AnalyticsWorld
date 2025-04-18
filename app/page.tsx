import Link from 'next/link'
import type { ReactNode } from 'react'

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

interface NicheCard {
  title: string;
  icon: ReactNode;
  growth: string;
  difficulty: string;
}

const featuredNiches: NicheCard[] = [
  {
    title: 'Tech Reviews',
    icon: <ChartIcon />,
    growth: '+25%',
    difficulty: 'Medium',
  },
  {
    title: 'Lifestyle Vlogs',
    icon: <RocketIcon />,
    growth: '+18%',
    difficulty: 'Low',
  },
  {
    title: 'Educational Content',
    icon: <TrendingUpIcon />,
    growth: '+32%',
    difficulty: 'High',
  },
]

const latestUpdates = [
  {
    title: 'YouTube Shorts Algorithm Update',
    date: 'March 2024',
    description: 'New changes affecting short-form content distribution and engagement metrics.',
  },
  {
    title: 'Monetization Policy Changes',
    date: 'February 2024',
    description: 'Updated requirements for channel monetization and revenue sharing.',
  },
]

const successStories = [
  {
    channel: 'TechInsights',
    growth: '0 to 100K subscribers in 6 months',
    niche: 'Technology Reviews',
    strategy: 'Consistent weekly uploads with data-driven thumbnails',
  },
  {
    channel: 'CookingMaster',
    growth: '50K to 500K subscribers in 12 months',
    niche: 'Cooking Tutorials',
    strategy: 'Short-form content strategy with viral recipes',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-youtube-light to-white"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-youtube-dark sm:text-5xl lg:text-6xl">
              Discover Your Perfect YouTube Niche & Growth Strategy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Data-driven insights, proven growth strategies, and comprehensive resources 
              to help you build a successful YouTube channel.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/niche-explorer"
                className="rounded-md bg-youtube-red px-6 py-3 text-sm font-semibold text-white shadow hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Explore Niches
              </Link>
              <Link
                href="/growth-strategies"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                View Growth Strategies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Niches */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trending Niches
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover high-potential niches with proven growth opportunities
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredNiches.map((niche) => (
              <div
                key={niche.title}
                className="rounded-lg bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="text-youtube-red">{niche.icon}</div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    {niche.growth}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{niche.title}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Difficulty: {niche.difficulty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Platform Updates</h2>
              <div className="mt-8 space-y-8">
                {latestUpdates.map((update) => (
                  <div key={update.title} className="rounded-lg bg-white p-6 shadow">
                    <time className="text-sm text-gray-500">{update.date}</time>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{update.title}</h3>
                    <p className="mt-2 text-gray-600">{update.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Success Stories</h2>
              <div className="mt-8 space-y-8">
                {successStories.map((story) => (
                  <div key={story.channel} className="rounded-lg bg-white p-6 shadow">
                    <h3 className="text-lg font-semibold text-gray-900">{story.channel}</h3>
                    <p className="mt-2 text-green-600 font-medium">{story.growth}</p>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Niche: {story.niche}</p>
                      <p className="mt-1 text-sm text-gray-500">Strategy: {story.strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="bg-youtube-red py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white/5 py-10 px-6 backdrop-blur-lg">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Get Weekly Niche Trend Alerts
              </h2>
              <p className="mt-4 text-lg text-red-100">
                Stay ahead of the curve with our data-driven niche insights and growth opportunities.
              </p>
              <form className="mt-8 flex gap-x-4">
                <input
                  type="email"
                  required
                  className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-youtube-red shadow-sm hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 
import Link from 'next/link'

interface NicheData {
  name: string;
  category: string;
  audienceSize: string;
  competition: 'Low' | 'Medium' | 'High';
  growthRate: string;
  monetization: string;
  demographics: string[];
  keywords: string[];
}

const niches: NicheData[] = [
  {
    name: "Tech Reviews",
    category: "Technology",
    audienceSize: "10M+",
    competition: "High",
    growthRate: "+25%",
    monetization: "$15-25 RPM",
    demographics: ["18-34", "Tech-savvy", "Urban"],
    keywords: ["unboxing", "comparison", "review"],
  },
  {
    name: "Sustainable Living",
    category: "Lifestyle",
    audienceSize: "5M+",
    competition: "Medium",
    growthRate: "+40%",
    monetization: "$12-18 RPM",
    demographics: ["25-44", "Eco-conscious", "Urban"],
    keywords: ["zero waste", "eco-friendly", "sustainable"],
  },
  {
    name: "Financial Education",
    category: "Education",
    audienceSize: "8M+",
    competition: "Medium",
    growthRate: "+35%",
    monetization: "$20-30 RPM",
    demographics: ["25-54", "Professional", "Investment-minded"],
    keywords: ["personal finance", "investing", "financial freedom"],
  },
]

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const MoneyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

export default function NicheExplorer() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Niche Explorer
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover untapped niches with high growth potential using our data-driven analysis.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-12 rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Filter Niches</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red">
                  <option>All Categories</option>
                  <option>Technology</option>
                  <option>Lifestyle</option>
                  <option>Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Competition Level</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red">
                  <option>Any</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Growth Rate</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red">
                  <option>Any</option>
                  <option>High Growth (30%+)</option>
                  <option>Medium Growth (15-30%)</option>
                  <option>Steady Growth (5-15%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monetization Potential</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red">
                  <option>Any</option>
                  <option>High ($20+ RPM)</option>
                  <option>Medium ($10-20 RPM)</option>
                  <option>Low ($1-10 RPM)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Niche Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {niches.map((niche) => (
            <div
              key={niche.name}
              className="rounded-lg bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{niche.name}</h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  niche.competition === 'Low' ? 'bg-green-100 text-green-800' :
                  niche.competition === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {niche.competition} Competition
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <UserGroupIcon />
                  <span className="ml-2 text-sm text-gray-600">{niche.audienceSize}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUpIcon />
                  <span className="ml-2 text-sm text-gray-600">{niche.growthRate}</span>
                </div>
                <div className="flex items-center">
                  <MoneyIcon />
                  <span className="ml-2 text-sm text-gray-600">{niche.monetization}</span>
                </div>
                <div className="flex items-center">
                  <ChartIcon />
                  <span className="ml-2 text-sm text-gray-600">{niche.category}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Target Demographics</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {niche.demographics.map((demo) => (
                    <span
                      key={demo}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {demo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Trending Keywords</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {niche.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center rounded-full bg-youtube-red/10 px-2.5 py-0.5 text-xs font-medium text-youtube-red"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
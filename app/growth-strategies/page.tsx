interface Strategy {
  title: string;
  description: string;
  metrics: string[];
  tips: string[];
  channelSize: string;
}

const strategies: Strategy[] = [
  {
    title: "Building Your Foundation",
    description: "Essential strategies for new channels to establish a strong presence and start growing.",
    channelSize: "0-1K",
    metrics: [
      "Focus on first 100 subscribers",
      "Aim for 70% retention rate",
      "Target 4-5 minute watch time"
    ],
    tips: [
      "Create a clear niche focus",
      "Optimize titles and thumbnails",
      "Establish consistent upload schedule",
      "Engage with comments regularly"
    ]
  },
  {
    title: "Accelerating Growth",
    description: "Strategies to expand your reach and build a loyal community.",
    channelSize: "1K-10K",
    metrics: [
      "Target 1K watch hours monthly",
      "Maintain 60%+ retention rate",
      "Grow 10% month over month"
    ],
    tips: [
      "Analyze top-performing content",
      "Experiment with different formats",
      "Collaborate with similar channels",
      "Create content series"
    ]
  },
  {
    title: "Scaling Your Channel",
    description: "Advanced techniques to reach a wider audience and optimize monetization.",
    channelSize: "10K-100K",
    metrics: [
      "Focus on RPM optimization",
      "Target 50%+ returning viewers",
      "Aim for 20K watch hours monthly"
    ],
    tips: [
      "Develop multiple revenue streams",
      "Create premium content offerings",
      "Build email list and community",
      "Optimize for search and suggestions"
    ]
  },
  {
    title: "Mastering the Platform",
    description: "Expert strategies for large channels to maintain growth and maximize impact.",
    channelSize: "100K+",
    metrics: [
      "Maintain 40%+ CTR",
      "Target 70%+ engagement rate",
      "Focus on brand partnerships"
    ],
    tips: [
      "Diversify content portfolio",
      "Build team and processes",
      "Create multiple channels",
      "Develop brand partnerships"
    ]
  }
]

export default function GrowthStrategies() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Growth Strategies Hub
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Proven strategies and tactics to grow your YouTube channel at every stage.
          </p>
        </div>

        {/* Strategy Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {strategies.map((strategy) => (
            <div
              key={strategy.title}
              className="rounded-lg bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{strategy.title}</h2>
                <span className="inline-flex items-center rounded-full bg-youtube-red/10 px-2.5 py-0.5 text-xs font-medium text-youtube-red">
                  {strategy.channelSize} Subscribers
                </span>
              </div>
              
              <p className="mt-2 text-gray-600">{strategy.description}</p>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Key Metrics to Track</h3>
                <ul className="mt-2 space-y-2">
                  {strategy.metrics.map((metric) => (
                    <li key={metric} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-youtube-red"></span>
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Growth Tips</h3>
                <ul className="mt-2 space-y-2">
                  {strategy.tips.map((tip) => (
                    <li key={tip} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <button className="inline-flex items-center text-sm font-medium text-youtube-red hover:text-red-700">
                  View Detailed Guide
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div className="mt-16">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900">Additional Resources</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900">Content Templates</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Download our proven content templates for different video types.
                </p>
                <button className="mt-4 text-sm font-medium text-youtube-red hover:text-red-700">
                  Download Templates
                </button>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900">SEO Guide</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Learn how to optimize your videos for YouTube's algorithm.
                </p>
                <button className="mt-4 text-sm font-medium text-youtube-red hover:text-red-700">
                  Read Guide
                </button>
              </div>
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900">Analytics Workshop</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Join our workshop on understanding and using YouTube Analytics.
                </p>
                <button className="mt-4 text-sm font-medium text-youtube-red hover:text-red-700">
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
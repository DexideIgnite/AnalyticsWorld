import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export const metadata = {
  title: 'Analytics Dashboard - Analytics World',
  description: 'Track your YouTube channel performance with our comprehensive analytics dashboard.',
}

export default function AnalyticsPage() {
  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Analytics Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Subscribers</p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Videos</p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Last 30 Days Views</p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last 30 Days Subscribers</p>
                      <p className="text-2xl font-semibold">0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Watch Time</p>
                      <p className="text-2xl font-semibold">0:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audience Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Top Countries</p>
                      <p className="text-sm text-gray-900">No data available</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Top Age Groups</p>
                      <p className="text-sm text-gray-900">No data available</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender Distribution</p>
                      <p className="text-sm text-gray-900">No data available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Connect Your YouTube Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Connect your YouTube channel to start tracking your analytics and get personalized insights.
                  </p>
                  <Button>Connect YouTube Channel</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
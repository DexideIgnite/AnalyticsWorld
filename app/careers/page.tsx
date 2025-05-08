import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export const metadata = {
  title: 'Careers - Analytics World',
  description: 'Join our team and help shape the future of YouTube analytics.',
}

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    description:
      'We\'re looking for a Senior Frontend Engineer to help build and improve our analytics dashboard and user interface.',
    requirements: [
      'Extensive experience with React and TypeScript',
      'Experience with data visualization libraries',
      'Strong understanding of web performance optimization',
      'Excellent problem-solving skills',
      'Minimum 5 years of relevant experience',
    ],
  },
  {
    title: 'Data Scientist',
    department: 'Data',
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Join our data team to help develop advanced analytics algorithms and insights for YouTube creators.',
    requirements: [
      'Advanced degree in Computer Science, Statistics, or related field',
      'Experience with machine learning and statistical analysis',
      'Proficiency in Python and SQL',
      'Experience with big data technologies',
      'Strong communication skills',
    ],
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    description:
      'We\'re seeking a Product Manager to drive the vision and strategy of our analytics platform.',
    requirements: [
      'Minimum 3 years of product management experience',
      'Experience with analytics or SaaS products',
      'Strong analytical and problem-solving skills',
      'Excellent communication and leadership abilities',
      'Understanding of the creator economy',
    ],
  },
]

const values = [
  {
    title: 'Innovation First',
    description:
      'We\'re always pushing boundaries and exploring new ways to help creators succeed.',
  },
  {
    title: 'Customer Obsession',
    description:
      'Our creators\' success is our success. We\'re dedicated to delivering exceptional value.',
  },
  {
    title: 'Data-Driven',
    description:
      'We make decisions based on data and measure everything we do.',
  },
  {
    title: 'Collaborative Spirit',
    description:
      'We believe the best ideas come from diverse perspectives and teamwork.',
  },
]

export default function CareersPage() {
  return (
    <div className="py-10">
      <header className="text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Join Our Team
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Help us build the future of YouTube analytics and creator growth
          </p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Culture Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Our Culture</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Benefits</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Competitive Compensation
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Competitive salary, equity, and performance bonuses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Health & Wellness
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Comprehensive health, dental, and vision coverage
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Work-Life Balance
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Flexible PTO, remote work options, and wellness days
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Open Positions */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
            <div className="mt-6 space-y-6">
              {jobs.map((job) => (
                <Card key={job.title}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <div className="mt-1 space-x-4">
                          <span className="text-gray-500">{job.department}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{job.location}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{job.type}</span>
                        </div>
                      </div>
                      <Button className="mt-4 sm:mt-0" variant="outline">
                        Apply Now
                      </Button>
                    </div>
                    <p className="mt-4 text-gray-600">{job.description}</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900">Requirements:</h4>
                      <ul className="mt-2 list-disc pl-5 text-gray-600">
                        {job.requirements.map((requirement) => (
                          <li key={requirement}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
} 
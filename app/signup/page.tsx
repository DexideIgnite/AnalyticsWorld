import { CheckIcon } from '@heroicons/react/24/solid'

const plans = [
  {
    name: 'Creator',
    price: '$19',
    description: 'Perfect for getting started with YouTube content creation',
    features: [
      'Basic niche research tools',
      'Growth strategy guides',
      'Basic analytics dashboard',
      'Community forum access',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    price: '$49',
    description: 'Everything you need to grow your channel professionally',
    features: [
      'Advanced niche research',
      'Competitor analysis tools',
      'Trend prediction algorithms',
      'Priority support',
      'Monthly strategy calls',
      'Custom thumbnail templates',
      'Content calendar tools',
    ],
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For serious creators looking to build a media empire',
    features: [
      'All Professional features',
      'Multi-channel management',
      'Brand deal opportunities',
      'Dedicated account manager',
      'Custom analytics reports',
      'API access',
      'White-label options',
    ],
  },
]

export default function Signup() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Growth Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Select the plan that best fits your channel's needs and growth goals.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-lg bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
              <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                <span className="text-sm font-semibold text-gray-600">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-youtube-red" aria-hidden="true" />
                    <span className="ml-3 text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full rounded-md bg-youtube-red px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Sign Up Form */}
        <div className="mt-16">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900">Create Your Account</h2>
            <form className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red"
                  />
                </div>
                <div>
                  <label htmlFor="channel-url" className="block text-sm font-medium text-gray-700">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    name="channel-url"
                    id="channel-url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-youtube-red focus:ring-youtube-red"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-youtube-red focus:ring-youtube-red"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-youtube-red hover:text-red-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-youtube-red hover:text-red-700">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-youtube-red px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
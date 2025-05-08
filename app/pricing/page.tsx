import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export const metadata = {
  title: 'Pricing - Analytics World',
  description: 'Choose the perfect plan for your YouTube channel growth.',
}

const plans = [
  {
    name: 'Starter',
    price: '$9',
    description: 'Perfect for new creators',
    features: [
      'Basic analytics dashboard',
      'Up to 3 YouTube channels',
      'Daily data updates',
      'Email support',
      'Basic insights',
    ],
  },
  {
    name: 'Professional',
    price: '$29',
    description: 'For growing channels',
    features: [
      'Advanced analytics dashboard',
      'Up to 10 YouTube channels',
      'Real-time data updates',
      'Priority email support',
      'Advanced insights',
      'Competitor analysis',
      'Custom reports',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For established creators',
    features: [
      'Full analytics suite',
      'Unlimited YouTube channels',
      'Real-time data updates',
      '24/7 priority support',
      'Advanced insights',
      'Competitor analysis',
      'Custom reports',
      'API access',
      'Dedicated account manager',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="py-10">
      <header className="text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect plan for your YouTube channel growth
          </p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular ? 'border-primary shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-center text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 
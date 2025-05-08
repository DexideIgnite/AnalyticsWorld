import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const metadata = {
  title: 'Contact Us - Analytics World',
  description: 'Get in touch with the Analytics World team for support or inquiries.',
}

export default function ContactPage() {
  return (
    <div className="py-10">
      <header className="text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Have questions? We're here to help.
          </p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                <form className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Subject
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-gray-900">support@analyticsworld.com</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-gray-900">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p className="mt-1 text-gray-900">
                        123 Analytics Street
                        <br />
                        San Francisco, CA 94105
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Monday - Friday</h3>
                      <p className="mt-1 text-gray-900">9:00 AM - 6:00 PM PST</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Saturday</h3>
                      <p className="mt-1 text-gray-900">10:00 AM - 4:00 PM PST</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Sunday</h3>
                      <p className="mt-1 text-gray-900">Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
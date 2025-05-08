export const metadata = {
  title: 'Privacy Policy - Analytics World',
  description: 'Learn about how Analytics World handles and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="py-10">
      <header className="text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Last updated: March 15, 2024
          </p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mt-12 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
              <p className="mt-4 text-gray-600">
                Analytics World ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Information We Collect
              </h2>
              <div className="mt-4 space-y-4 text-gray-600">
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-5">
                  <li>Name and contact information</li>
                  <li>YouTube channel information</li>
                  <li>Account credentials</li>
                  <li>Payment information</li>
                  <li>Communication preferences</li>
                </ul>
                <p>
                  We also automatically collect certain information when you use our
                  services, including:
                </p>
                <ul className="list-disc pl-5">
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                How We Use Your Information
              </h2>
              <div className="mt-4 space-y-4 text-gray-600">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-5">
                  <li>Provide and improve our services</li>
                  <li>Process your transactions</li>
                  <li>Send you updates and marketing communications</li>
                  <li>Respond to your inquiries</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Information Sharing
              </h2>
              <p className="mt-4 text-gray-600">
                We do not sell your personal information. We may share your information
                with:
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-600">
                <li>Service providers who assist in operating our platform</li>
                <li>Business partners with your consent</li>
                <li>Law enforcement when required by law</li>
                <li>
                  Other parties in connection with a business transaction, such as a
                  merger or acquisition
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              <p className="mt-4 text-gray-600">
                We implement appropriate technical and organizational measures to protect
                your information. However, no method of transmission over the internet is
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              <p className="mt-4 text-gray-600">
                You have certain rights regarding your personal information, including:
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-600">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your information</li>
                <li>Withdrawal of consent</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Changes to This Policy
              </h2>
              <p className="mt-4 text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you
                of any changes by posting the new Privacy Policy on this page and
                updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="mt-4 text-gray-600">
                If you have any questions about this Privacy Policy, please contact us
                at:
              </p>
              <div className="mt-4 text-gray-600">
                <p>Analytics World</p>
                <p>123 Analytics Street</p>
                <p>San Francisco, CA 94105</p>
                <p>Email: privacy@analyticsworld.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 
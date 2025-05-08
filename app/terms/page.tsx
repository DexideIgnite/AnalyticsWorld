export const metadata = {
  title: 'Terms of Service - Analytics World',
  description: 'Read our terms of service and user agreement.',
}

export default function TermsPage() {
  return (
    <div className="py-10">
      <header className="text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Terms of Service
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
              <h2 className="text-2xl font-bold text-gray-900">
                Agreement to Terms
              </h2>
              <p className="mt-4 text-gray-600">
                By accessing or using Analytics World ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you disagree with any part
                of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Description of Service
              </h2>
              <p className="mt-4 text-gray-600">
                Analytics World provides analytics and insights for YouTube creators. We
                offer various features including but not limited to performance tracking,
                audience analytics, and content optimization recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                User Accounts
              </h2>
              <div className="mt-4 space-y-4 text-gray-600">
                <p>
                  When you create an account with us, you must provide accurate and
                  complete information. You are responsible for:
                </p>
                <ul className="list-disc pl-5">
                  <li>Maintaining the security of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Promptly notifying us of any unauthorized use</li>
                  <li>Ensuring your account information is up to date</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Terms
              </h2>
              <div className="mt-4 space-y-4 text-gray-600">
                <p>
                  Some aspects of the Service are billed on a subscription basis. You
                  agree to:
                </p>
                <ul className="list-disc pl-5">
                  <li>Pay all applicable fees</li>
                  <li>Provide current and valid payment information</li>
                  <li>
                    Automatically renew your subscription unless cancelled in advance
                  </li>
                  <li>
                    Accept responsibility for any applicable taxes or charges
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Intellectual Property
              </h2>
              <p className="mt-4 text-gray-600">
                The Service and its original content, features, and functionality are
                owned by Analytics World and are protected by international copyright,
                trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                User Content
              </h2>
              <div className="mt-4 space-y-4 text-gray-600">
                <p>
                  You retain ownership of any content you submit to the Service. By
                  submitting content, you grant us a license to:
                </p>
                <ul className="list-disc pl-5">
                  <li>Use the content to provide the Service</li>
                  <li>Store and backup the content</li>
                  <li>Modify the content as needed to provide the Service</li>
                  <li>Share the content according to your settings</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Limitation of Liability
              </h2>
              <p className="mt-4 text-gray-600">
                In no event shall Analytics World be liable for any indirect,
                incidental, special, consequential, or punitive damages, including
                without limitation, loss of profits, data, use, goodwill, or other
                intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Termination
              </h2>
              <p className="mt-4 text-gray-600">
                We may terminate or suspend your account immediately, without prior
                notice or liability, for any reason whatsoever, including without
                limitation if you breach the Terms. Upon termination, your right to use
                the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Changes to Terms
              </h2>
              <p className="mt-4 text-gray-600">
                We reserve the right to modify or replace these Terms at any time. If a
                revision is material, we will try to provide at least 30 days\' notice
                prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                Contact Information
              </h2>
              <p className="mt-4 text-gray-600">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 text-gray-600">
                <p>Analytics World</p>
                <p>123 Analytics Street</p>
                <p>San Francisco, CA 94105</p>
                <p>Email: legal@analyticsworld.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 
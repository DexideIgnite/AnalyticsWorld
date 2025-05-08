import { Card, CardContent } from '../components/ui/Card'

export const metadata = {
  title: 'About Us - Analytics World',
  description: 'Learn about Analytics World and our mission to help YouTube creators grow.',
}

const team = [
  {
    name: 'John Doe',
    role: 'CEO & Founder',
    image: '/team/john-doe.jpg',
    bio: 'Former YouTube creator with over 1M subscribers. Passionate about helping others succeed on the platform.',
  },
  {
    name: 'Jane Smith',
    role: 'Head of Product',
    image: '/team/jane-smith.jpg',
    bio: 'Product leader with 10+ years of experience in analytics and data visualization.',
  },
  {
    name: 'Mike Johnson',
    role: 'Lead Developer',
    image: '/team/mike-johnson.jpg',
    bio: 'Full-stack developer specializing in real-time analytics and data processing.',
  },
]

export default function AboutPage() {
  return (
    <div className="py-10">
      <header className="text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            About Analytics World
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Empowering YouTube creators with data-driven insights
          </p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-12 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-gray-600">
                At Analytics World, we believe that every YouTube creator deserves access to
                powerful analytics tools to help them grow their channel. Our mission is to
                democratize YouTube analytics by providing creators with the insights they
                need to make data-driven decisions and achieve their goals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
              <p className="mt-4 text-gray-600">
                Founded in 2023, Analytics World was born from the frustration of YouTube
                creators who struggled to understand their channel's performance and make
                informed decisions. We saw an opportunity to create a platform that would
                make analytics accessible, understandable, and actionable for creators of
                all sizes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((member) => (
                  <Card key={member.name}>
                    <CardContent className="p-6">
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-primary">{member.role}</p>
                      <p className="mt-2 text-gray-600">{member.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900">Our Values</h2>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Data-Driven Decisions
                    </h3>
                    <p className="mt-2 text-gray-600">
                      We believe in the power of data to drive growth and success. Our
                      platform provides creators with the insights they need to make
                      informed decisions.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Creator-First Approach
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Everything we do is designed with creators in mind. We're constantly
                      listening to feedback and improving our platform to better serve our
                      users.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Continuous Innovation
                    </h3>
                    <p className="mt-2 text-gray-600">
                      We're always looking for new ways to help creators succeed. Our team
                      is constantly innovating and adding new features to our platform.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">JobPilot</h1>
            <div className="flex gap-2">
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            AI-Powered Job Application Automation
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Stop spending hours applying to jobs manually. JobPilot automatically finds, matches, and applies to jobs across India and Gulf countries using AI-powered cover letters.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-foreground mb-3">Smart Scraping</h3>
            <p className="text-muted-foreground">
              Automatically scrape job listings from 10+ platforms including Indeed, Naukri, Bayt, LinkedIn, and more.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-foreground mb-3">AI Matching</h3>
            <p className="text-muted-foreground">
              Powered by Gemini AI, JobPilot matches jobs to your skills and recommends the best resume for each position.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl mb-4">✍️</div>
            <h3 className="text-lg font-bold text-foreground mb-3">Cover Letters</h3>
            <p className="text-muted-foreground">
              Generate personalized cover letters for each application, tailored to the job and company.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl mb-4">👁️</div>
            <h3 className="text-lg font-bold text-foreground mb-3">Manual Review</h3>
            <p className="text-muted-foreground">
              You stay in control. Review each job and application before it&apos;s submitted.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-lg font-bold text-foreground mb-3">Global Coverage</h3>
            <p className="text-muted-foreground">
              Find jobs in India, UAE, Saudi Arabia, and other Gulf countries plus remote opportunities.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-foreground mb-3">Track Applications</h3>
            <p className="text-muted-foreground">
              Keep track of all your applications in one place with detailed history and status updates.
            </p>
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">Supported Job Boards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Indeed',
              'Naukri',
              'Bayt',
              'Unstop',
              'Wellfound',
              'LinkedIn',
              'GulfTalent',
              'Company Careers',
            ].map((platform) => (
              <div
                key={platform}
                className="bg-card border rounded-lg p-4 text-muted-foreground"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center bg-card border rounded-lg p-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">Ready to automate your job search?</h3>
          <p className="text-muted-foreground mb-6">
            Upload your resumes, scrape jobs, and let AI handle your applications.
          </p>
          <Link href="/sign-up">
            <Button size="lg">Start Your Free Account</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>JobPilot © 2024 - AI-Powered Job Application Automation</p>
        </div>
      </footer>
    </div>
  )
}

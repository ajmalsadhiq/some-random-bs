import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTopMatches, getApplications } from '@/app/actions/jobs'
import JobCard from '@/components/job-card'
import ApplicationsList from '@/components/applications-list'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [topMatches, applications] = await Promise.all([
    getTopMatches(5),
    getApplications(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">JobPilot</h1>
              <p className="text-sm text-muted-foreground">AI-powered job application automation</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/resumes">
                <Button variant="outline">My Resumes</Button>
              </Link>
              <Link href="/dashboard/scrape">
                <Button>Scrape Jobs</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Top Matches */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Top Matches For You</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Review and approve applications for the best matching jobs
              </p>
            </div>

            {topMatches.length > 0 ? (
              <div className="space-y-4">
                {topMatches.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-4">No pending jobs yet</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload your resumes and scrape jobs to get started
                </p>
                <div className="flex gap-2 justify-center">
                  <Link href="/dashboard/resumes">
                    <Button>Upload Resumes</Button>
                  </Link>
                  <Link href="/dashboard/scrape">
                    <Button variant="outline">Scrape Jobs</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: Statistics & Recent Applications */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Pending Review</span>
                  <span className="text-lg font-bold text-foreground">{topMatches.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Applied</span>
                  <span className="text-lg font-bold text-foreground">{applications.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Applications</h3>
              {applications.length > 0 ? (
                <ApplicationsList applications={applications.slice(0, 5)} />
              ) : (
                <p className="text-sm text-muted-foreground">No applications yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ScrapePage() {
  const [isScraing, setIsScraing] = useState(false)
  const [status, setStatus] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [error, setError] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())

  const handleStartScrape = async () => {
    setIsScraing(true)
    setStatus('Starting scrape...')
    setError('')
    setJobs([])

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Scraping failed')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      setStatus(`Found ${data.jobs?.length || 0} jobs`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape jobs')
      setStatus('')
    } finally {
      setIsScraing(false)
    }
  }

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId)
    } else {
      newSelected.add(jobId)
    }
    setSelectedJobs(newSelected)
  }

  const handleAddSelectedJobs = async () => {
    if (selectedJobs.size === 0) {
      setError('Please select at least one job')
      return
    }

    setIsScraing(true)
    setError('')

    try {
      const jobsToAdd = jobs.filter((job) => selectedJobs.has(job.id))

      const response = await fetch('/api/add-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: jobsToAdd }),
      })

      if (!response.ok) {
        throw new Error('Failed to add jobs')
      }

      setStatus(`Added ${jobsToAdd.length} jobs to your list`)
      setSelectedJobs(new Set())
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add jobs')
    } finally {
      setIsScraing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scrape Jobs</h1>
              <p className="text-sm text-muted-foreground">Find jobs across multiple platforms</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Scrape Controls */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Job Sources</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              'Indeed (India)',
              'Indeed (UAE)',
              'Naukri',
              'Bayt.com',
              'Unstop',
              'Wellfound (Remote)',
            ].map((source) => (
              <div
                key={source}
                className="flex items-center px-3 py-2 bg-muted text-muted-foreground rounded text-sm"
              >
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {source}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Scraping will search for jobs matching your resume skills across all platforms. This may take 2-5 minutes.
          </p>

          <Button onClick={handleStartScrape} disabled={isScraing} size="lg" className="w-full md:w-auto">
            {isScraing ? 'Scraping in progress...' : 'Start Scraping'}
          </Button>
        </div>

        {/* Status Messages */}
        {status && <div className="text-sm text-blue-600 mb-4">{status}</div>}
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        {/* Jobs Results */}
        {jobs.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Found {jobs.length} Jobs - Select to Add
              </h2>
              <Button
                onClick={handleAddSelectedJobs}
                disabled={selectedJobs.size === 0 || isScraing}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Selected ({selectedJobs.size}) Jobs
              </Button>
            </div>

            <div className="space-y-3">
              {jobs.map((job, idx) => (
                <div
                  key={idx}
                  className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="mt-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                        <span>📍 {job.location}</span>
                        <span>•</span>
                        <span>{job.country}</span>
                        <span>•</span>
                        <span>{job.source}</span>
                      </div>
                      {job.jobUrl && (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                        >
                          View Job →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

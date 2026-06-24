'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { approveAndApply, rejectJob, updateJobCoverLetter } from '@/app/actions/jobs'
import { generateCoverLetter, matchJobToResumes } from '@/lib/ai'
import { getResumeByRole } from '@/app/actions/resumes'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  country: string
  source: string
  jobUrl: string
  description: string | null
  matchScore: number | null
  matchedResume: string | null
  coverLetterGenerated: string | null
  status: string
}

export default function JobCard({ job }: { job: Job }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [coverLetterText, setCoverLetterText] = useState('')
  const [error, setError] = useState('')

  const handleGenerateCoverLetter = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (!job.matchedResume) {
        setError('No matching resume found')
        return
      }

      const resume = await getResumeByRole(job.matchedResume)
      if (!resume) {
        setError('Resume not found')
        return
      }

      const letter = await generateCoverLetter(
        job.title,
        job.description || '',
        job.company,
        resume.fileContent,
        ''
      )

      setCoverLetterText(letter)
      setShowCoverLetter(true)

      // Save generated cover letter
      await updateJobCoverLetter(job.id, letter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveAndApply = async () => {
    setIsLoading(true)
    setError('')
    try {
      await approveAndApply(job.id, coverLetterText)
      setShowCoverLetter(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await rejectJob(job.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          {job.matchScore && (
            <div className="bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 px-3 py-1 rounded text-sm font-semibold">
              Match: {job.matchScore}%
            </div>
          )}
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>📍 {job.location}</span>
          <span>•</span>
          <span>{job.country}</span>
          <span>•</span>
          <span>{job.source}</span>
        </div>
      </div>

      {job.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {showCoverLetter && (
        <div className="mb-4 p-4 bg-muted rounded">
          <p className="text-sm font-semibold text-foreground mb-2">Generated Cover Letter:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
            {coverLetterText}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowCoverLetter(false)}
              variant="outline"
              disabled={isLoading}
            >
              Edit & Continue
            </Button>
            <Button
              size="sm"
              onClick={handleApproveAndApply}
              disabled={isLoading}
            >
              {isLoading ? 'Applying...' : 'Apply Now'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="flex-1">
            View Job
          </Button>
        </a>

        {!showCoverLetter ? (
          <>
            <Button
              size="sm"
              onClick={handleGenerateCoverLetter}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Generating...' : 'Generate & Review'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              Skip
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowCoverLetter(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

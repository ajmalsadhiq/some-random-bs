import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { jobs, resumes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { matchJobToResumes } from '@/lib/ai'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const jobsToAdd = body.jobs

    if (!Array.isArray(jobsToAdd)) {
      return NextResponse.json({ error: 'Invalid jobs format' }, { status: 400 })
    }

    // Get user's resumes
    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, session.user.id))

    if (userResumes.length === 0) {
      return NextResponse.json({ error: 'No resumes found' }, { status: 400 })
    }

    const addedJobs = []

    for (const job of jobsToAdd) {
      try {
        // Match job to best resume
        const match = await matchJobToResumes(
          job.title,
          job.description || job.title,
          job.company,
          userResumes
        )

        const jobId = crypto.randomUUID()

        await db.insert(jobs).values({
          id: jobId,
          userId: session.user.id,
          title: job.title,
          company: job.company,
          location: job.location,
          country: job.country,
          source: job.source,
          jobUrl: job.jobUrl,
          description: job.description,
          matchScore: match.score,
          matchedResume: match.bestMatch,
          status: 'pending',
        })

        addedJobs.push(jobId)
      } catch (err) {
        console.error('Error processing job:', err)
      }
    }

    return NextResponse.json({
      success: true,
      addedCount: addedJobs.length,
      totalJobs: jobsToAdd.length,
    })
  } catch (error) {
    console.error('Error adding jobs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add jobs' },
      { status: 500 }
    )
  }
}

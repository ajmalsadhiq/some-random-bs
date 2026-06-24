import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, scraperLogs, jobs, resumes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { scrapeAllSources } from '@/lib/scrapers'
import { matchJobToResumes } from '@/lib/ai'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Starting automated job scraping')

    // Get all users
    const allUsers = await db.select().from(user)

    if (allUsers.length === 0) {
      console.log('[Cron] No users found')
      return NextResponse.json({ success: true, message: 'No users to process' })
    }

    let totalJobsScraped = 0
    let totalJobsAdded = 0
    let processedUsers = 0

    // For each user, scrape jobs and match them
    for (const currentUser of allUsers) {
      try {
        // Get user's resumes
        const userResumes = await db
          .select()
          .from(resumes)
          .where(eq(resumes.userId, currentUser.id))

        if (userResumes.length === 0) {
          console.log(`[Cron] User ${currentUser.id} has no resumes, skipping`)
          continue
        }

        // Scrape all job sources
        const scrapedJobs = await scrapeAllSources()
        totalJobsScraped += scrapedJobs.length

        let jobsAdded = 0

        // Add each job with AI matching
        for (const job of scrapedJobs) {
          try {
            // Check if job already exists for this user
            const existingJob = await db
              .select()
              .from(jobs)
              .where(eq(jobs.jobUrl, job.jobUrl))

            if (existingJob.length > 0) {
              continue // Skip duplicate
            }

            // Match job to best resume
            const match = await matchJobToResumes(
              job.title,
              job.description || job.title,
              job.company,
              userResumes
            )

            // Only add jobs with reasonable match score
            if (match.score >= 50) {
              const jobId = crypto.randomUUID()

              await db.insert(jobs).values({
                id: jobId,
                userId: currentUser.id,
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

              jobsAdded++
              totalJobsAdded++
            }
          } catch (err) {
            console.error(`[Cron] Error processing job for user ${currentUser.id}:`, err)
          }
        }

        // Log scraping activity
        const logId = crypto.randomUUID()
        await db.insert(scraperLogs).values({
          id: logId,
          userId: currentUser.id,
          source: 'automated-cron',
          jobsFound: scrapedJobs.length,
          jobsMatched: jobsAdded,
          status: 'success',
        })

        processedUsers++
        console.log(
          `[Cron] Processed user ${currentUser.id}: found ${scrapedJobs.length}, added ${jobsAdded}`
        )
      } catch (err) {
        console.error(`[Cron] Error processing user ${currentUser.id}:`, err)

        // Log error
        const logId = crypto.randomUUID()
        await db.insert(scraperLogs).values({
          id: logId,
          userId: currentUser.id,
          source: 'automated-cron',
          jobsFound: 0,
          jobsMatched: 0,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    console.log('[Cron] Scraping complete:', {
      processedUsers,
      totalJobsScraped,
      totalJobsAdded,
    })

    return NextResponse.json({
      success: true,
      processedUsers,
      totalJobsScraped,
      totalJobsAdded,
    })
  } catch (error) {
    console.error('[Cron] Fatal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobs, applications, resumes } from '@/lib/db/schema'
import { eq, and, desc, ne } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function addJob(jobData: {
  title: string
  company: string
  location: string
  country: string
  source: string
  jobUrl: string
  description?: string
  matchScore?: number
  matchedResume?: string
}) {
  const userId = await getUserId()
  const id = crypto.randomUUID()
  
  await db.insert(jobs).values({
    id,
    userId,
    ...jobData,
  })
  
  revalidatePath('/dashboard')
  return { success: true, id }
}

export async function getPendingJobs() {
  const userId = await getUserId()
  return db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, 'pending')))
    .orderBy(desc(jobs.matchScore))
}

export async function getTopMatches(limit: number = 5) {
  const userId = await getUserId()
  return db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, 'pending')))
    .orderBy(desc(jobs.matchScore))
    .limit(limit)
}

export async function approveAndApply(jobId: string, coverLetterContent: string) {
  const userId = await getUserId()
  
  const job = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
  
  if (!job.length) throw new Error('Job not found')
  
  const applicationId = crypto.randomUUID()
  
  await db.insert(applications).values({
    id: applicationId,
    userId,
    jobId,
    resumeUsed: job[0].matchedResume || 'unknown',
    coverLetterUsed: coverLetterContent,
    status: 'applied',
  })
  
  await db
    .update(jobs)
    .set({ status: 'applied' })
    .where(eq(jobs.id, jobId))
  
  revalidatePath('/dashboard')
  return { success: true, applicationId }
}

export async function rejectJob(jobId: string) {
  const userId = await getUserId()
  
  await db
    .update(jobs)
    .set({ status: 'rejected' })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getApplications() {
  const userId = await getUserId()
  return db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.appliedAt))
}

export async function getAllJobs() {
  const userId = await getUserId()
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt))
}

export async function updateJobCoverLetter(jobId: string, coverLetter: string) {
  const userId = await getUserId()
  
  await db
    .update(jobs)
    .set({ coverLetterGenerated: coverLetter })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
  
  revalidatePath('/dashboard')
  return { success: true }
}

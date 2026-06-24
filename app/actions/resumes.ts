'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { resumes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function uploadResume(jobRole: string, fileContent: string, fileName: string) {
  const userId = await getUserId()
  
  const id = crypto.randomUUID()
  
  await db.insert(resumes).values({
    id,
    userId,
    jobRole,
    fileContent,
    fileName,
  }).onConflictDoUpdate({
    target: [resumes.userId, resumes.jobRole],
    set: {
      fileContent,
      fileName,
      updatedAt: new Date(),
    },
  })
  
  revalidatePath('/dashboard/resumes')
  return { success: true, id }
}

export async function getResumes() {
  const userId = await getUserId()
  return db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.jobRole)
}

export async function deleteResume(jobRole: string) {
  const userId = await getUserId()
  await db
    .delete(resumes)
    .where(and(eq(resumes.userId, userId), eq(resumes.jobRole, jobRole)))
  
  revalidatePath('/dashboard/resumes')
  return { success: true }
}

export async function getResumeByRole(jobRole: string) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.userId, userId), eq(resumes.jobRole, jobRole)))
  
  return result[0] || null
}

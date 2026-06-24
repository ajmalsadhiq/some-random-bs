import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

const model = google('gemini-2.0-flash')

export async function matchJobToResumes(
  jobTitle: string,
  jobDescription: string,
  jobCompany: string,
  resumes: Array<{ jobRole: string; fileContent: string }>
): Promise<{ bestMatch: string; score: number }> {
  if (resumes.length === 0) {
    return { bestMatch: '', score: 0 }
  }

  const resumeSummaries = resumes
    .map((r) => `Role: ${r.jobRole}\nContent:\n${r.fileContent.substring(0, 500)}...`)
    .join('\n\n---\n\n')

  const prompt = `You are a job matching expert. I have a job posting and multiple resumes. 
  
Your task is to:
1. Analyze the job requirements
2. Match it to the best resume
3. Provide a match score (0-100)

Job Title: ${jobTitle}
Company: ${jobCompany}
Job Description: ${jobDescription.substring(0, 1000)}

Available Resumes:
${resumeSummaries}

Return ONLY a JSON object with this format (no markdown, no explanation):
{"bestMatchRole": "The job role from the resumes that best matches", "score": 0-100}`

  const response = await generateText({
    model,
    prompt,
    temperature: 0.3,
  })

  const text = response.text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { bestMatch: resumes[0]?.jobRole || '', score: 60 }
  }

  const result = JSON.parse(jsonMatch[0])
  return {
    bestMatch: result.bestMatchRole || resumes[0]?.jobRole || '',
    score: result.score || 60,
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  company: string,
  resumeContent: string,
  candidateName: string
): Promise<string> {
  const prompt = `You are an expert cover letter writer. Using the provided resume and job description, write a professional, compelling cover letter.

Candidate Name: ${candidateName}
Job Title: ${jobTitle}
Company: ${company}

Resume Content:
${resumeContent.substring(0, 1000)}

Job Description:
${jobDescription.substring(0, 1000)}

Write a professional cover letter that:
1. Addresses the hiring manager professionally
2. Highlights relevant experience from the resume
3. Shows enthusiasm for the specific role and company
4. Is concise (3-4 paragraphs)
5. Ends with a professional closing

Start directly with "Dear Hiring Manager," and write the full cover letter.`

  const response = await generateText({
    model,
    prompt,
    temperature: 0.7,
  })

  return response.text
}

export async function extractJobRequirements(jobDescription: string): Promise<string[]> {
  const prompt = `Extract the key job requirements from this job description. Return as a simple list.

Job Description:
${jobDescription}

Return ONLY a JSON array of strings with key requirements (no markdown):
["requirement1", "requirement2", ...]`

  const response = await generateText({
    model,
    prompt,
    temperature: 0.3,
  })

  const text = response.text.trim()
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    return []
  }

  return JSON.parse(jsonMatch[0])
}

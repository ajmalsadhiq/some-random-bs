'use client'

import { useState } from 'react'
import { uploadResume, getResumes, deleteResume } from '@/app/actions/resumes'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import Link from 'next/link'

const JOB_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'DevOps / Cloud Engineer',
  'Data Scientist',
  'Data Analyst',
  'AI/ML Engineer',
  'Cybersecurity Engineer',
  'Associate Product Manager',
]

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      const data = await getResumes()
      setResumes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resumes')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleUploadResume = async () => {
    if (!selectedRole || !uploadedFile) {
      setError('Please select a role and upload a file')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const text = await uploadedFile.text()
      await uploadResume(selectedRole, text, uploadedFile.name)
      await loadResumes()
      setSelectedRole('')
      setUploadedFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResume = async (role: string) => {
    if (confirm(`Delete resume for ${role}?`)) {
      try {
        await deleteResume(role)
        await loadResumes()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete resume')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Resumes</h1>
              <p className="text-sm text-muted-foreground">Manage your role-specific resumes</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-bold text-foreground mb-4">Upload Resume</h2>

              {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    {JOB_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Resume File (PDF/TXT)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {uploadedFile && (
                    <p className="text-xs text-muted-foreground mt-2">{uploadedFile.name}</p>
                  )}
                </div>

                <Button onClick={handleUploadResume} disabled={isLoading} className="w-full">
                  {isLoading ? 'Uploading...' : 'Upload Resume'}
                </Button>
              </div>
            </div>
          </div>

          {/* Resumes List */}
          <div className="lg:col-span-2">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Your Resumes</h2>

              {resumes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{resume.jobRole}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{resume.fileName}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteResume(resume.jobRole)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted rounded p-2 max-h-20 overflow-hidden">
                        {resume.fileContent.substring(0, 150)}...
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg border">
                  <p className="text-muted-foreground mb-4">No resumes uploaded yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload resumes for different job roles to get started
                  </p>
                </div>
              )}
            </div>

            {/* Available Roles */}
            <div className="mt-8">
              <h3 className="font-semibold text-foreground mb-3">Available Roles</h3>
              <div className="flex flex-wrap gap-2">
                {JOB_ROLES.map((role) => (
                  <div key={role} className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm">
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

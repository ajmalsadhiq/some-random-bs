'use client'

interface Application {
  id: string
  jobId: string
  resumeUsed: string
  coverLetterUsed: string | null
  appliedAt: Date
  status: string
  notes: string | null
}

export default function ApplicationsList({ applications }: { applications: Application[] }) {
  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div key={app.id} className="py-3 border-b last:border-b-0">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-semibold text-foreground">{app.resumeUsed}</p>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 px-2 py-1 rounded">
              {app.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(app.appliedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}

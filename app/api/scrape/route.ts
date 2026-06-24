import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { scrapeAllSources } from '@/lib/scrapers'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting job scraping for user:', session.user.id)

    const jobs = await scrapeAllSources()

    console.log(`Scraped ${jobs.length} jobs total`)

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job, idx) => ({
        ...job,
        id: `${job.source}-${job.company}-${idx}`,
      })),
    })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scraping failed' },
      { status: 500 }
    )
  }
}

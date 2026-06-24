import { chromium } from 'playwright'

export interface JobListing {
  title: string
  company: string
  location: string
  country: string
  source: string
  jobUrl: string
  description: string
  salary?: string
}

async function getPage() {
  const browser = await chromium.launch({ headless: true })
  return browser
}

export async function scrapeIndeed(country: string = 'in'): Promise<JobListing[]> {
  const jobs: JobListing[] = []
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const baseUrl =
      country === 'uae' ? 'https://ae.indeed.com' : `https://${country}.indeed.com`

    // Search for tech jobs
    const searchTerms = [
      'full stack developer',
      'devops engineer',
      'data scientist',
      'cybersecurity engineer',
      'cloud engineer',
    ]

    for (const term of searchTerms) {
      const url = `${baseUrl}/jobs?q=${encodeURIComponent(term)}&start=0&limit=50`
      await page.goto(url, { waitUntil: 'networkidle' })

      const jobElements = await page.locator('[data-testid="job-item"]').all()

      for (const element of jobElements) {
        try {
          const titleElement = await element.locator('h2 a')
          const title = await titleElement.textContent()
          const jobUrl = await titleElement.getAttribute('href')

          const company = await element
            .locator('[data-testid="company-name"]')
            .textContent()
          const location = await element
            .locator('[data-testid="job-location"]')
            .textContent()

          if (title && company && location && jobUrl) {
            jobs.push({
              title: title.trim(),
              company: company.trim(),
              location: location.trim(),
              country: country === 'uae' ? 'UAE' : 'India',
              source: 'Indeed',
              jobUrl: jobUrl.includes('indeed.com') ? jobUrl : `${baseUrl}${jobUrl}`,
              description: '',
            })
          }
        } catch (e) {
          console.error('Error parsing job element:', e)
        }
      }
    }
  } catch (error) {
    console.error('Error scraping Indeed:', error)
  } finally {
    await browser.close()
  }

  return jobs
}

export async function scrapeNaukri(): Promise<JobListing[]> {
  const jobs: JobListing[] = []
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const searchTerms = [
      'full stack developer',
      'devops engineer',
      'data scientist',
      'cybersecurity engineer',
      'cloud engineer',
    ]

    for (const term of searchTerms) {
      const url = `https://www.naukri.com/search?keyword=${encodeURIComponent(term)}`
      await page.goto(url, { waitUntil: 'networkidle' })

      const jobElements = await page.locator('.jobCard').all()

      for (const element of jobElements) {
        try {
          const titleElement = await element.locator('.jobCardFileName')
          const title = await titleElement.textContent()

          const company = await element
            .locator('.companyName')
            .textContent()
          const location = await element
            .locator('.jobCardLocation')
            .textContent()

          const jobUrlElement = await element.locator('a').first()
          const jobUrl = await jobUrlElement.getAttribute('href')

          if (title && company && location) {
            jobs.push({
              title: title.trim(),
              company: company.trim(),
              location: location.trim(),
              country: 'India',
              source: 'Naukri',
              jobUrl: jobUrl || '',
              description: '',
            })
          }
        } catch (e) {
          console.error('Error parsing Naukri job:', e)
        }
      }
    }
  } catch (error) {
    console.error('Error scraping Naukri:', error)
  } finally {
    await browser.close()
  }

  return jobs
}

export async function scrapeBayt(): Promise<JobListing[]> {
  const jobs: JobListing[] = []
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const searchTerms = [
      'full stack developer',
      'devops engineer',
      'data scientist',
      'cybersecurity engineer',
    ]

    for (const term of searchTerms) {
      const url = `https://www.bayt.com/en/jobs/${encodeURIComponent(term)}-jobs/`
      await page.goto(url, { waitUntil: 'networkidle' })

      const jobElements = await page.locator('.job-item').all()

      for (const element of jobElements) {
        try {
          const titleElement = await element.locator('h2 a').first()
          const title = await titleElement.textContent()
          const jobUrl = await titleElement.getAttribute('href')

          const company = await element
            .locator('.employer-name')
            .textContent()
          const location = await element
            .locator('.job-location')
            .textContent()

          if (title && company && location) {
            jobs.push({
              title: title.trim(),
              company: company.trim(),
              location: location?.trim() || 'Multiple',
              country: 'Gulf',
              source: 'Bayt',
              jobUrl: jobUrl?.startsWith('http') ? jobUrl : `https://www.bayt.com${jobUrl}` || '',
              description: '',
            })
          }
        } catch (e) {
          console.error('Error parsing Bayt job:', e)
        }
      }
    }
  } catch (error) {
    console.error('Error scraping Bayt:', error)
  } finally {
    await browser.close()
  }

  return jobs
}

export async function scrapeWellfound(): Promise<JobListing[]> {
  const jobs: JobListing[] = []
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const url = 'https://wellfound.com/jobs'
    await page.goto(url, { waitUntil: 'networkidle' })

    const jobElements = await page.locator('[data-testid="job-card"]').all()

    for (const element of jobElements) {
      try {
        const titleElement = await element.locator('h3').first()
        const title = await titleElement.textContent()

        const company = await element.locator('[data-testid="company-name"]').textContent()
        const location = await element.locator('[data-testid="location"]').textContent()

        const jobUrl = await element.locator('a').first().getAttribute('href')

        if (title && company && location) {
          jobs.push({
            title: title.trim(),
            company: company.trim(),
            location: location.trim(),
            country: 'Remote',
            source: 'Wellfound',
            jobUrl: jobUrl?.startsWith('http') ? jobUrl : `https://wellfound.com${jobUrl}` || '',
            description: '',
          })
        }
      } catch (e) {
        console.error('Error parsing Wellfound job:', e)
      }
    }
  } catch (error) {
    console.error('Error scraping Wellfound:', error)
  } finally {
    await browser.close()
  }

  return jobs
}

export async function scrapeUnstop(): Promise<JobListing[]> {
  const jobs: JobListing[] = []
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const url = 'https://unstop.com/jobs'
    await page.goto(url, { waitUntil: 'networkidle' })

    const jobElements = await page.locator('[class*="job-card"]').all()

    for (const element of jobElements.slice(0, 50)) {
      try {
        const titleElement = await element.locator('h4, h3').first()
        const title = await titleElement.textContent()

        const company = await element.locator('[class*="company"]').first().textContent()
        const location = await element.locator('[class*="location"]').first().textContent()

        const jobUrl = await element.locator('a').first().getAttribute('href')

        if (title && company && location) {
          jobs.push({
            title: title.trim(),
            company: company.trim(),
            location: location.trim(),
            country: 'India',
            source: 'Unstop',
            jobUrl: jobUrl?.startsWith('http') ? jobUrl : `https://unstop.com${jobUrl}` || '',
            description: '',
          })
        }
      } catch (e) {
        console.error('Error parsing Unstop job:', e)
      }
    }
  } catch (error) {
    console.error('Error scraping Unstop:', error)
  } finally {
    await browser.close()
  }

  return jobs
}

export async function scrapeAllSources(): Promise<JobListing[]> {
  const allJobs: JobListing[] = []

  console.log('Starting scrape of all sources...')

  try {
    const [indeed, indeedUAE, naukri, bayt, wellfound, unstop] = await Promise.allSettled([
      scrapeIndeed('in'),
      scrapeIndeed('uae'),
      scrapeNaukri(),
      scrapeBayt(),
      scrapeWellfound(),
      scrapeUnstop(),
    ])

    if (indeed.status === 'fulfilled') allJobs.push(...indeed.value)
    if (indeedUAE.status === 'fulfilled') allJobs.push(...indeedUAE.value)
    if (naukri.status === 'fulfilled') allJobs.push(...naukri.value)
    if (bayt.status === 'fulfilled') allJobs.push(...bayt.value)
    if (wellfound.status === 'fulfilled') allJobs.push(...wellfound.value)
    if (unstop.status === 'fulfilled') allJobs.push(...unstop.value)

    console.log(`Total jobs scraped: ${allJobs.length}`)
  } catch (error) {
    console.error('Error during scraping:', error)
  }

  return allJobs
}

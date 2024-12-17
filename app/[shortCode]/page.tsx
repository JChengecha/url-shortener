import { redirect } from 'next/navigation'
import { getLongUrl, incrementClicks } from '@/lib/db'

export default async function RedirectPage({ params }: { params: { shortCode: string } }) {
  const longUrl = await getLongUrl(params.shortCode)
  
  if (longUrl) {
    // In a real-world scenario, you'd want to get the actual location and device info
    incrementClicks(params.shortCode, 'Unknown', 'Unknown')
    redirect(longUrl as string)
  }

  return <div>Invalid short URL</div>
}


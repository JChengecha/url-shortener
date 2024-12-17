import { getAnalytics } from '@/lib/db'
import AnalyticsCard from '@/components/AnalyticsCard'

export default async function Dashboard() {
  // For demonstration purposes, we're using a hardcoded shortCode
  // In a real app, you'd want to fetch this dynamically or allow users to input it
  const shortCode = 'abc1234'
  const { clicks, locations, devices } = await getAnalytics(shortCode)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-charcoal dark:text-off-white">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-3">
          <AnalyticsCard title="Total Clicks" data={{ Clicks: clicks }} />
        </div>
        <AnalyticsCard title="Locations" data={locations} />
        <AnalyticsCard title="Devices" data={devices} />
      </div>
    </div>
  )
}


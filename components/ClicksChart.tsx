'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface ClicksChartProps {
  clicksByDay: Record<string, number>
}

export default function ClicksChart({ clicksByDay }: ClicksChartProps) {
  // Convert clicksByDay to chart-friendly format
  const chartData = Object.entries(clicksByDay)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart 
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          className="text-gray-300 dark:text-gray-700" 
        />
        <XAxis 
          dataKey="date" 
          className="text-charcoal dark:text-off-white" 
        />
        <YAxis 
          className="text-charcoal dark:text-off-white" 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgb(var(--background))', 
            borderColor: 'rgb(var(--border))' 
          }} 
        />
        <Line 
          type="monotone" 
          dataKey="clicks" 
          stroke="#10b981" // Emerald green
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

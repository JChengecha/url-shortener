'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Link2, 
  Users, 
  BarChart 
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  trend: number
  trendDirection: 'up' | 'down'
  icon: 'graph' | 'user' | 'link'
  subValue?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, 
  value, 
  trend, 
  trendDirection, 
  icon,
  subValue
}) => {
  const IconMap = {
    'graph': BarChart,
    'user': Users,
    'link': Link2
  }

  const IconComponent = IconMap[icon]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <IconComponent className="text-gray-400" size={20} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {value.toLocaleString()}
            {subValue && (
              <span className="block text-sm text-gray-500 font-normal mt-1">
                {subValue}
              </span>
            )}
          </p>
        </div>
        <div className={`flex items-center ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trendDirection === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="ml-1 text-sm">{trend}%</span>
        </div>
      </div>
    </div>
  )
}

export default MetricCard

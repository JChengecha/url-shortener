'use client'

import { useState } from 'react'
import { 
  Search, 
  Link2, 
  BarChart2 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Link {
  id: string
  shortUrl: string
  originalUrl: string
  clicks: number
  createdAt: string
}

interface LinksSidebarProps {
  links: Link[]
  onSelectLink: (link: Link) => void
  selectedLinkId?: string
}

export default function LinksSidebar({ 
  links, 
  onSelectLink, 
  selectedLinkId 
}: LinksSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLinks = (links || []).filter(link => 
    link.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-80 bg-white dark:bg-dark-gray border-l dark:border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search links..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredLinks.map(link => (
          <div 
            key={link.id}
            className={`
              p-4 border-b dark:border-gray-700 cursor-pointer 
              hover:bg-gray-50 dark:hover:bg-gray-800
              ${selectedLinkId === link.id 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                : ''
              }
            `}
            onClick={() => onSelectLink(link)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Link2 className="text-gray-500 dark:text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-off-white truncate max-w-[200px]">
                    {link.shortUrl}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {link.originalUrl}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="text-gray-500 dark:text-gray-400" size={16} />
                <span className="text-sm text-charcoal dark:text-off-white">
                  {link.clicks}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
          No links found
        </div>
      )}
    </div>
  )
}

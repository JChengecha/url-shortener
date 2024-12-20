'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  RefreshCw, 
  Globe,
  Link2 
} from 'lucide-react';
import { toast } from 'sonner';
import { UrlService } from '@/lib/urlService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AnalyticsDashboard() {
  const [urlAnalytics, setUrlAnalytics] = useState({
    totalClicks: 0,
    clicksByCountry: {},
    clicksByReferrer: {},
    recentClicks: []
  });
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUrlAnalytics = async (shortCode: string) => {
    try {
      setIsLoading(true);
      const analytics = await UrlService.getUrlAnalytics(shortCode);
      setUrlAnalytics(analytics);
      toast.success('Analytics updated');
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform data for charts
  const countryChartData = Object.entries(urlAnalytics.clicksByCountry)
    .map(([country, clicks]) => ({ name: country, value: clicks as number }))
    .sort((a, b) => b.value - a.value);

  const referrerChartData = Object.entries(urlAnalytics.clicksByReferrer)
    .map(([referrer, clicks]) => ({ name: referrer, value: clicks as number }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">URL Analytics</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              if (selectedUrl) {
                fetchUrlAnalytics(selectedUrl);
              }
            }}
            disabled={!selectedUrl || isLoading}
            title="Refresh Analytics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Clicks by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            {countryChartData.length > 0 ? (
              <PieChart width={400} height={300}>
                <Pie
                  data={countryChartData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {countryChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <p className="text-center text-gray-500">No country data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link2 className="mr-2 h-5 w-5" />
              Referrer Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrerChartData.length > 0 ? (
              <PieChart width={400} height={300}>
                <Pie
                  data={referrerChartData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {referrerChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <p className="text-center text-gray-500">No referrer data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Country</th>
                  <th className="py-2">Referrer</th>
                  <th className="py-2">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {urlAnalytics.recentClicks.map((click, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      {new Date(click.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2">
                      {click.geoLocation?.country || 'Unknown'}
                    </td>
                    <td className="py-2">
                      {click.referrer || 'Direct'}
                    </td>
                    <td className="py-2">
                      {click.userAgent || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

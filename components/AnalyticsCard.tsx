import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsCardProps {
  title: string
  data: Record<string, number>
}

export default function AnalyticsCard({ title, data }: AnalyticsCardProps) {
  return (
    <Card className="bg-off-white dark:bg-charcoal">
      <CardHeader>
        <CardTitle className="text-charcoal dark:text-off-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <li key={key} className="flex justify-between text-dark-gray dark:text-light-gray">
              <span>{key}</span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}


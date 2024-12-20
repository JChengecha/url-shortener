import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { kvDatabase } from '@/lib/kvDatabase';

// Input validation schema
const exportAnalyticsSchema = z.object({
  shortCode: z.string().optional(),
  format: z.enum(['csv', 'json']).default('json'),
  dateFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dateTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate input
    const body = await req.json();
    const { shortCode, format, dateFrom, dateTo } = exportAnalyticsSchema.parse(body);

    // Get analytics data
    const analytics = await kvDatabase.getUrlAnalytics(shortCode || '');

    // Filter by date if specified
    let filteredData = analytics;
    if (dateFrom || dateTo) {
      filteredData = {
        ...analytics,
        clickDetails: analytics.clickDetails?.filter(click => {
          const clickDate = new Date(click.timestamp);
          if (dateFrom && clickDate < dateFrom) return false;
          if (dateTo && clickDate > dateTo) return false;
          return true;
        })
      };
    }

    // Format response based on requested format
    if (format === 'csv') {
      const csvRows = [
        ['Timestamp', 'IP Address', 'Country', 'City', 'Referrer'].join(','),
        ...(filteredData.clickDetails || []).map(click => 
          [
            new Date(click.timestamp).toISOString(),
            click.ipAddress || '',
            click.country || '',
            click.city || '',
            click.referrer || ''
          ].join(',')
        )
      ];

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${shortCode || 'all'}.csv"`
        }
      });
    }

    // Default to JSON format
    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export analytics' },
      { status: 500 }
    );
  }
}

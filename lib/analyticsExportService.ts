import { getAnalytics } from '@/lib/db';
import { UrlService } from '@/lib/urlService';

export interface AnalyticsExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  dateFrom?: Date
  dateTo?: Date
  includeFields?: string[]
}

export class AnalyticsExportService {
  // Export analytics for a specific short URL
  static async exportUrlAnalytics(
    shortCode: string, 
    options: AnalyticsExportOptions
  ): Promise<string> {
    // Fetch analytics
    const analytics = await getAnalytics(shortCode);
    if (!analytics) {
      throw new Error('No analytics found for this URL');
    }

    // Filter data based on date range
    const filteredData = this.filterAnalyticsByDateRange(analytics, options);

    // Export based on format
    switch (options.format) {
      case 'csv':
        return this.exportToCsv(filteredData, options.includeFields);
      case 'json':
        return this.exportToJson(filteredData);
      case 'xlsx':
        return this.exportToXlsx(filteredData);
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export analytics for all user URLs
  static async exportUserAnalytics(
    userId: string, 
    options: AnalyticsExportOptions
  ): Promise<string> {
    // Get all user URLs
    const userUrls = await UrlService.listUrlsForUser(userId);

    // Aggregate analytics for all URLs
    const allAnalytics = await Promise.all(
      userUrls.map(async (url) => {
        const analytics = await getAnalytics(url.shortUrl);
        return {
          shortUrl: url.shortUrl,
          originalUrl: url.originalUrl,
          ...analytics
        };
      })
    );

    // Filter and export
    const filteredData = allAnalytics.map(
      analytics => this.filterAnalyticsByDateRange(analytics, options)
    );

    switch (options.format) {
      case 'csv':
        return this.exportToCsv(filteredData, options.includeFields);
      case 'json':
        return this.exportToJson(filteredData);
      case 'xlsx':
        return this.exportToXlsx(filteredData);
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Filter analytics by date range
  private static filterAnalyticsByDateRange(
    analytics: any, 
    options: AnalyticsExportOptions
  ): any {
    const { dateFrom, dateTo } = options;

    // If no date range specified, return full analytics
    if (!dateFrom && !dateTo) return analytics;

    // Filter click timestamps
    if (analytics.clickTimestamps) {
      analytics.clickTimestamps = analytics.clickTimestamps.filter((timestamp: number) => {
        const date = new Date(timestamp);
        return (!dateFrom || date >= dateFrom) && 
               (!dateTo || date <= dateTo);
      });
    }

    return analytics;
  }

  // Export to CSV
  private static exportToCsv(data: any[], includeFields?: string[]): string {
    // Default fields if not specified
    const defaultFields = [
      'totalClicks', 
      'uniqueVisitors', 
      'deviceTypes', 
      'browserTypes', 
      'locationData'
    ];

    const fields = includeFields || defaultFields;

    // CSV header
    const header = ['ShortURL', ...fields].join(',');

    // CSV rows
    const rows = data.map(item => {
      const rowData = [
        item.shortUrl || 'N/A',
        ...fields.map(field => {
          const value = item[field];
          // Convert complex objects to JSON string
          return value ? JSON.stringify(value).replace(/,/g, ';') : 'N/A';
        })
      ];
      return rowData.join(',');
    });

    return [header, ...rows].join('\n');
  }

  // Export to JSON
  private static exportToJson(data: any[]): string {
    return JSON.stringify(data, null, 2);
  }

  // Export to XLSX (placeholder - requires additional library)
  private static exportToXlsx(data: any[]): string {
    throw new Error('XLSX export not implemented. Please install xlsx library.');
  }
}

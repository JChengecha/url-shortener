import { kv } from '@vercel/kv';
import { UAParser } from 'ua-parser-js';

// Enhanced click tracking structure
export interface ClickAnalytics {
  totalClicks: number
  uniqueVisitors: Set<string>
  clickTimestamps: number[]
  locationData: Record<string, number>
  deviceTypes: Record<string, number>
  browserTypes: Record<string, number>
  operatingSystems: Record<string, number>
  referralSources: Record<string, number>
}

export async function saveUrl(longUrl: string, shortCode: string) {
  try {
    // Save original URL
    await kv.set(`url:${shortCode}`, longUrl);
    
    // Initialize analytics tracking
    const initialAnalytics: ClickAnalytics = {
      totalClicks: 0,
      uniqueVisitors: new Set(),
      clickTimestamps: [],
      locationData: {},
      deviceTypes: {},
      browserTypes: {},
      operatingSystems: {},
      referralSources: {}
    };
    
    await kv.set(`analytics:${shortCode}`, JSON.stringify(initialAnalytics));
  } catch (error) {
    console.error('Error in saveUrl:', error);
    throw new Error(`Failed to save URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getLongUrl(shortCode: string) {
  return kv.get(`url:${shortCode}`);
}

export async function incrementClicks(
  shortCode: string, 
  ipAddress: string, 
  userAgent: string, 
  location: string, 
  referrer?: string
) {
  try {
    // Parse user agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';
    const deviceType = parser.getDevice().type || 'desktop';

    // Retrieve existing analytics
    const existingAnalyticsJson = await kv.get(`analytics:${shortCode}`);
    const existingAnalytics: ClickAnalytics = existingAnalyticsJson 
      ? JSON.parse(existingAnalyticsJson as string) 
      : {
          totalClicks: 0,
          uniqueVisitors: new Set(),
          clickTimestamps: [],
          locationData: {},
          deviceTypes: {},
          browserTypes: {},
          operatingSystems: {},
          referralSources: {}
        };

    // Update metrics
    const timestamp = Date.now();
    existingAnalytics.totalClicks += 1;
    
    // Track unique visitors (using IP as identifier)
    if (!existingAnalytics.uniqueVisitors.includes(ipAddress)) {
      existingAnalytics.uniqueVisitors.push(ipAddress);
    }

    // Update timestamps
    existingAnalytics.clickTimestamps.push(timestamp);

    // Update location data
    existingAnalytics.locationData[location] = 
      (existingAnalytics.locationData[location] || 0) + 1;

    // Update device types
    existingAnalytics.deviceTypes[deviceType] = 
      (existingAnalytics.deviceTypes[deviceType] || 0) + 1;

    // Update browser types
    existingAnalytics.browserTypes[browser] = 
      (existingAnalytics.browserTypes[browser] || 0) + 1;

    // Update operating systems
    existingAnalytics.operatingSystems[os] = 
      (existingAnalytics.operatingSystems[os] || 0) + 1;

    // Update referral sources
    if (referrer) {
      existingAnalytics.referralSources[referrer] = 
        (existingAnalytics.referralSources[referrer] || 0) + 1;
    }

    // Save updated analytics
    await kv.set(`analytics:${shortCode}`, JSON.stringify(existingAnalytics));
  } catch (error) {
    console.error('Error in incrementClicks:', error);
  }
}

export async function getAnalytics(shortCode: string) {
  try {
    const analyticsJson = await kv.get(`analytics:${shortCode}`);
    if (!analyticsJson) return null;

    const analytics: ClickAnalytics = JSON.parse(analyticsJson as string);

    // Process click timestamps for time-based analysis
    const clicksByDay = analytics.clickTimestamps.reduce((acc, timestamp) => {
      const date = new Date(timestamp);
      const dayKey = date.toISOString().split('T')[0];
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClicks: analytics.totalClicks,
      uniqueVisitors: analytics.uniqueVisitors.length,
      clickTimestamps: analytics.clickTimestamps,
      clicksByDay,
      locationData: analytics.locationData,
      deviceTypes: analytics.deviceTypes,
      browserTypes: analytics.browserTypes,
      operatingSystems: analytics.operatingSystems,
      referralSources: analytics.referralSources
    };
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    return null;
  }
}

export async function getRecentShortCodes(limit: number = 5) {
  try {
    const keys = await kv.keys('url:*');
    const shortCodes = keys
      .map(key => key.replace('url:', ''))
      .slice(0, limit);
    return shortCodes;
  } catch (error) {
    console.error('Error fetching recent short codes:', error);
    return [];
  }
}

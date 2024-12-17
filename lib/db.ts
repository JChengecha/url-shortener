import { kv } from '@vercel/kv';

export async function saveUrl(longUrl: string, shortCode: string) {
  try {
    await kv.set(`url:${shortCode}`, longUrl);
    await kv.set(`analytics:${shortCode}`, { clicks: 0, locations: {}, devices: {} });
  } catch (error) {
    console.error('Error in saveUrl:', error);
    throw new Error(`Failed to save URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getLongUrl(shortCode: string) {
  return kv.get(`url:${shortCode}`);
}

export async function incrementClicks(shortCode: string, location: string, device: string) {
  await kv.incr(`analytics:${shortCode}:clicks`);
  await kv.hincrby(`analytics:${shortCode}:locations`, location, 1);
  await kv.hincrby(`analytics:${shortCode}:devices`, device, 1);
}

export async function getAnalytics(shortCode: string) {
  const clicks = await kv.get(`analytics:${shortCode}:clicks`) || 0;
  const locations = await kv.hgetall(`analytics:${shortCode}:locations`) || {};
  const devices = await kv.hgetall(`analytics:${shortCode}:devices`) || {};
  return { clicks, locations, devices };
}


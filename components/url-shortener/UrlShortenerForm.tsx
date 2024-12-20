'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Link2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode.react';

// URL validation schema
const urlSchema = z.string().url('Please enter a valid URL');

export function UrlShortenerForm() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate URL
      urlSchema.parse(longUrl);
      
      setIsLoading(true);
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.shortUrl);
        toast.success('URL Shortened Successfully!');
      } else {
        toast.error(data.error || 'Failed to shorten URL');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-grow">
          <Input 
            type="text" 
            placeholder="Enter your long URL" 
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="w-full"
            icon={<Link2 className="text-gray-400" />}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="px-4"
        >
          {isLoading ? 'Shortening...' : 'Shorten'}
        </Button>
      </form>

      {shortUrl && (
        <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
          <a 
            href={shortUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline flex-grow truncate"
          >
            {shortUrl}
          </a>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={copyToClipboard}
            title="Copy to Clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowQrCode(!showQrCode)}
            title="Generate QR Code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showQrCode && shortUrl && (
        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
          <QRCode value={shortUrl} size={150} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function QRCodesClient() {
  const [qrCodes, setQRCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchQRCodes = async () => {
    setIsLoading(true);
    try {
      // Currently fetches first 12, can add pagination if needed
      const res = await api.get('/qrcodes');
      if (res.data.success) {
        setQRCodes(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch QR codes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleDownload = async (qrId: string, slug: string, type: 'png' | 'svg') => {
    try {
      const response = await api.get(`/qrcodes/${qrId}/download?type=${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${slug}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Failed to download ${type.toUpperCase()}`);
    }
  };

  const filteredQRCodes = qrCodes.filter(qr => 
    qr.link.title.toLowerCase().includes(search.toLowerCase()) || 
    qr.link.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-container-max mx-auto pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            QR Code Center
          </h2>
          <p className="font-body-md text-body-md text-secondary">
            Manage and download high-resolution QR codes for your shortened links.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search QR Codes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-container-lowest border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all w-full md:w-64 font-body-sm text-body-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-secondary">
          <span className="material-symbols-outlined text-[40px] animate-spin mb-4">refresh</span>
          <p>Loading QR codes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchQRCodes} className="mt-4 text-primary hover:underline font-medium">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {/* Create New Card Trigger */}
          <Link href="/dashboard/links" className="border-2 border-dashed border-border-light rounded-xl p-6 flex flex-col items-center justify-center hover:bg-surface-container-low hover:border-secondary transition-colors duration-300 min-h-[340px] group bg-surface-container-lowest">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-2xl">add</span>
            </div>
            <span className="font-label-md text-label-md text-on-surface">Generate New QR Code</span>
            <span className="font-body-sm text-body-sm text-secondary mt-2 text-center">Create a link to auto-generate a trackable QR code.</span>
          </Link>

          {/* QR Cards */}
          {filteredQRCodes.map((qr) => (
            <div key={qr._id} className="bg-white/70 backdrop-blur-md border border-border-light/80 rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-tertiary"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface mb-1 truncate max-w-[200px]" title={qr.link.title}>
                    {qr.link.title}
                  </h3>
                  <div className="inline-flex items-center px-2 py-1 bg-surface-container-low rounded-md border border-secondary-fixed-dim max-w-full overflow-hidden">
                    <span className="font-mono-code text-mono-code text-tertiary text-xs truncate">
                      {qr.link.shortUrl.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-border-light rounded-lg p-4 mb-6 flex justify-center items-center">
                <img 
                  src={qr.pngData} 
                  alt={`QR Code for ${qr.link.title}`} 
                  className="w-32 h-32 mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity bg-white p-1 rounded"
                />
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                  <span className="material-symbols-outlined text-xs">bar_chart</span>
                  <span>{qr.scans?.toLocaleString() || 0} Total Clicks</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(qr._id, qr.link.slug, 'png')}
                    className="flex-1 bg-primary text-on-primary font-label-sm text-label-sm py-2 rounded flex items-center justify-center gap-1 hover:bg-surface-tint transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> PNG
                  </button>
                  <button 
                    onClick={() => handleDownload(qr._id, qr.link.slug, 'svg')}
                    className="flex-1 bg-surface-container-lowest text-on-surface border border-border-light font-label-sm text-label-sm py-2 rounded flex items-center justify-center gap-1 hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">code</span> SVG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

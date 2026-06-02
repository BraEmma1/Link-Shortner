'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function AnalyticsClient() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get('linkId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  
  // The backend might return different shapes for "overall" vs "link-specific"
  // so we adapt to it.
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const endpoint = linkId ? `/analytics/${linkId}` : '/analytics/overall';
        const response = await api.get(endpoint);
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch analytics');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Error fetching analytics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [linkId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-secondary">
        <span className="material-symbols-outlined text-[40px] animate-spin mb-4">refresh</span>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <p className="font-semibold mb-2">Error loading analytics</p>
        <p className="text-sm">{error}</p>
        <Link href="/links" className="mt-4 inline-block text-primary hover:underline">
          Return to Links
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const isSpecific = !!linkId;

  return (
    <>
      {/* ── Page Header ── */}
      {!isSpecific && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background flex items-center gap-3">
              Account Analytics
            </h2>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Deep-dive into link performance and audience behaviour across all your links.
            </p>
          </div>
          <div className="flex gap-4 items-center bg-surface-container-lowest p-4 rounded-xl border border-border-light shadow-sm">
            <div className="text-center">
              <p className="text-label-sm text-secondary uppercase font-semibold">Total Clicks</p>
              <p className="text-headline-md font-bold text-primary">
                {data.totalClicks?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Chart Grid ── */}
      <div className={!isSpecific ? "grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-12" : "flex flex-col gap-gutter"}>
        
        {/* OVERALL ANALYTICS VIEW */}
        {!isSpecific && data.dailyClicks && (
          <div className="bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-6 lg:col-span-2">
            <h3 className="font-headline-md text-[18px] text-on-background mb-6">Click Volume (Last 30 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyClicks} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!isSpecific && data.topLinks && (
          <div className="bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-6 lg:col-span-2">
            <h3 className="font-headline-md text-[18px] text-on-background mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_fire_department</span>
              Top Performing Links
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="pb-3 font-label-sm text-secondary uppercase">Title</th>
                    <th className="pb-3 font-label-sm text-secondary uppercase">Short URL</th>
                    <th className="pb-3 font-label-sm text-secondary uppercase text-right">Clicks</th>
                    <th className="pb-3 font-label-sm text-secondary uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topLinks.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-secondary">No clicks recorded yet.</td></tr>
                  ) : data.topLinks.map((link: any) => (
                    <tr key={link._id} className="border-b border-border-light/50 last:border-0 hover:bg-background-subtle transition-colors">
                      <td className="py-3 font-medium">{link.title || 'Untitled'}</td>
                      <td className="py-3 font-mono-code text-[13px] text-secondary">{link.shortUrl?.replace(/^https?:\/\//, '') || link.slug}</td>
                      <td className="py-3 font-mono-code font-semibold text-right">{link.clicks.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <Link href={`/analytics?linkId=${link._id}`} className="text-primary hover:underline text-sm font-medium">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LINK-SPECIFIC ANALYTICS VIEW */}
        {isSpecific && (
          <div className="flex-1 w-full max-w-container-max mx-auto space-y-gutter pb-24">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-on-surface">Detail</span>
              </div>
              <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-4">
                <div>
                  <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
                    {data.linkDetails?.title || 'Untitled Link'}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-surface-container px-3 py-1 rounded-full font-mono-code text-mono-code text-tertiary-container border border-tertiary-fixed">
                      {data.linkDetails?.shortUrl?.replace(/^https?:\/\//, '')}
                    </span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(data.linkDetails?.shortUrl)}
                      className="material-symbols-outlined text-secondary text-sm cursor-pointer hover:text-primary transition-colors"
                      title="Copy to clipboard"
                    >
                      content_copy
                    </button>
                    <span className="text-secondary text-body-sm hidden sm:inline truncate max-w-sm" title={data.linkDetails?.originalUrl}>
                      → {data.linkDetails?.originalUrl}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="bg-surface-container-lowest border border-secondary text-secondary px-4 py-2 rounded-DEFAULT font-label-md text-label-md flex items-center gap-2 hover:bg-background-subtle transition-colors">
                    <span className="material-symbols-outlined text-sm">download</span> Export
                  </button>
                </div>
              </div>
            </div>

            {/* Overview Stats & QR Preview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-gutter">
                <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-label-sm text-label-sm text-secondary uppercase mb-2">Total Clicks</p>
                  <p className="font-display-lg text-display-lg text-on-surface">{data.linkDetails?.totalClicks?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-label-sm text-label-sm text-secondary uppercase mb-2">Unique Visitors</p>
                  <p className="font-display-lg text-display-lg text-on-surface">{data.linkDetails?.uniqueVisitors?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-label-sm text-label-sm text-secondary uppercase mb-2">Unique Countries</p>
                  <p className="font-display-lg text-display-lg text-on-surface">{data.geographicDistribution?.length || 0}</p>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-surface-container rounded-full opacity-50 pointer-events-none"></div>
                {data.linkDetails?.qrCodeUrl ? (
                  <img src={data.linkDetails.qrCodeUrl} alt="QR Code" className="w-24 h-24 mb-4 z-10 bg-white" />
                ) : (
                  <div className="w-24 h-24 mb-4 bg-gray-100 flex items-center justify-center z-10"><span className="material-symbols-outlined text-gray-400">qr_code</span></div>
                )}
                <a 
                  href={data.linkDetails?.qrCodeUrl || '#'} 
                  download="qrcode.png"
                  className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1 z-10"
                >
                  Download QR <span className="material-symbols-outlined text-[14px]">download</span>
                </a>
              </div>
            </div>

            {/* Chart Section: Clicks Over Time */}
            <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-[18px] text-on-surface">Clicks Over Time</h3>
                <select className="bg-background-subtle border border-border-light rounded-DEFAULT text-body-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-secondary">
                  <option>Last 30 Days</option>
                </select>
              </div>
              
              <div className="h-64 w-full">
                {data.dailyClicks && data.dailyClicks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyClicks} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Line type="monotone" dataKey="clicks" stroke="#ad0014" strokeWidth={3} dot={{ r: 4, fill: '#ad0014', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-secondary">No click data available yet</div>
                )}
              </div>
            </div>

            {/* Grid of Cards (Bento style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              
              {/* Top Countries List */}
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm col-span-1 lg:col-span-1 flex flex-col">
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface mb-4">Top Countries</h3>
                <div className="flex-1 space-y-4">
                  {data.geographicDistribution?.length === 0 ? (
                    <p className="text-secondary text-sm">No location data.</p>
                  ) : data.geographicDistribution?.slice(0, 4).map((geo: any) => (
                    <div key={geo.country}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{geo.country === 'Unknown' ? '🌐' : '🌎'}</span>
                          <span className="font-body-md text-body-sm text-on-surface">{geo.country === 'Unknown' ? 'Unknown' : geo.country}</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-secondary">{geo.percentage}% ({geo.count})</span>
                      </div>
                      <div className="w-full bg-background-subtle h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-secondary h-full" style={{ width: `${geo.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrers (Horizontal Bar) */}
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm col-span-1 lg:col-span-2 flex flex-col">
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface mb-6">Referrers</h3>
                <div className="space-y-5 flex-1">
                  {data.trafficSources?.length === 0 ? (
                    <p className="text-secondary text-sm">No referrer data.</p>
                  ) : data.trafficSources?.slice(0, 4).map((source: any, idx: number) => {
                    const barColors = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-surface-variant'];
                    return (
                      <div key={source.source}>
                        <div className="flex justify-between font-body-sm text-body-sm mb-1">
                          <span className="text-on-surface flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${barColors[idx % 4]}`}></span> {source.source}
                          </span>
                          <span className="text-secondary">{source.count}</span>
                        </div>
                        <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
                          <div className={`${barColors[idx % 4]} h-full rounded-full`} style={{ width: `${source.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Devices (Donut Chart representation) */}
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm col-span-1 flex flex-col items-center">
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface mb-4 self-start w-full">Devices</h3>
                <div className="h-40 w-full mb-6">
                  {data.deviceBreakdown?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="device"
                        >
                          {data.deviceBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-secondary">No device data</div>
                  )}
                </div>
                <div className="w-full flex justify-center gap-4 text-label-sm font-label-sm text-secondary flex-wrap">
                  {data.deviceBreakdown?.map((entry: any, index: number) => (
                    <div key={entry.device} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span> {entry.device}
                    </div>
                  ))}
                </div>
              </div>

              {/* Browsers List */}
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-border-light shadow-sm col-span-1 md:col-span-1 lg:col-span-2">
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface mb-4">Browsers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-light">
                        <th className="pb-2 font-label-sm text-label-sm text-secondary font-medium uppercase tracking-wider">Browser</th>
                        <th className="pb-2 font-label-sm text-label-sm text-secondary font-medium uppercase tracking-wider text-right">Visits</th>
                        <th className="pb-2 font-label-sm text-label-sm text-secondary font-medium uppercase tracking-wider text-right">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm font-body-sm">
                      {data.browserBreakdown?.length === 0 ? (
                        <tr><td colSpan={3} className="py-4 text-center text-secondary">No browser data.</td></tr>
                      ) : data.browserBreakdown?.map((browser: any) => (
                        <tr key={browser.browser} className="border-b border-border-light/50 hover:bg-background-subtle transition-colors last:border-0">
                          <td className="py-3 flex items-center gap-2 text-on-surface">
                            <span className="material-symbols-outlined text-secondary text-[18px]">public</span> {browser.browser}
                          </td>
                          <td className="py-3 text-right text-secondary">{browser.count}</td>
                          <td className="py-3 text-right font-medium text-on-surface">{browser.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

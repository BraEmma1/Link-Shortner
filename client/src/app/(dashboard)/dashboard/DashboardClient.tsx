'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import KpiCard from '@/components/ui/KpiCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function DashboardClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  const [filterType, setFilterType] = useState('30');
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({ days: '30' });

  // Initialize custom dates defaults
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    setSelectedStart(start);
    setSelectedEnd(end);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/analytics/overall', { params: queryParams });
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [queryParams]);

  const handlePresetSelect = (daysStr: string) => {
    setFilterType(daysStr);
    setQueryParams({ days: daysStr });
    setIsCalendarOpen(false);
  };

  const handleApplyCustomRange = () => {
    if (!selectedStart || !selectedEnd) {
      alert('Please select both start and end dates');
      return;
    }
    setQueryParams({
      startDate: selectedStart.toISOString().split('T')[0],
      endDate: selectedEnd.toISOString().split('T')[0]
    });
    setIsCalendarOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    const prevMonthDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    const currentMonthDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const nextMonthDays = [];
    const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      if (date < selectedStart) {
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isBetweenDays = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return d > s && d < e;
  };

  const isBetweenPreview = (date: Date, start: Date | null, hovered: Date | null) => {
    if (!start || hovered === null || selectedEnd !== null) return false;
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(start).setHours(0, 0, 0, 0);
    const h = new Date(hovered).setHours(0, 0, 0, 0);
    if (h < s) return false;
    return d > s && d < h;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getTriggerLabel = () => {
    if (filterType !== 'custom') {
      return `Last ${filterType} Days`;
    }
    if (selectedStart && selectedEnd) {
      return `${formatDateLabel(selectedStart)} - ${formatDateLabel(selectedEnd)}`;
    }
    if (selectedStart) {
      return `${formatDateLabel(selectedStart)} - Select end`;
    }
    return 'Custom Range';
  };

  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-secondary">
        <span className="material-symbols-outlined text-[40px] animate-spin mb-4">refresh</span>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <p className="font-semibold mb-2">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 inline-block text-primary hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">
            Overview
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Track your link performance and audience engagement.
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsCalendarOpen(v => !v)}
            className="flex items-center gap-2 bg-surface-container-lowest border border-border-light rounded-lg px-4 py-2 font-body-sm text-body-sm hover:bg-background-subtle focus:ring-2 focus:ring-secondary transition-all outline-none text-on-surface cursor-pointer shadow-sm select-none"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
            <span>{getTriggerLabel()}</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">expand_more</span>
          </button>

          {isCalendarOpen && (
            <>
              {/* Overlay backdrop to close picker on click outside */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsCalendarOpen(false)}
              />
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 bg-surface-container-lowest border border-border-light rounded-xl shadow-lg z-50 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border-light overflow-hidden animate-fadeIn">
                {/* Presets Panel (Left side) */}
                <div className="p-3 flex flex-col gap-1 w-full sm:w-40 bg-background-subtle/50">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider px-2 py-1 mb-1 select-none">Presets</span>
                  {[
                    { label: 'Last 7 Days', value: '7' },
                    { label: 'Last 21 Days', value: '21' },
                    { label: 'Last 30 Days', value: '30' },
                    { label: 'Custom Range', value: 'custom' },
                  ].map(preset => {
                    const isActive = filterType === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          if (preset.value === 'custom') {
                            setFilterType('custom');
                          } else {
                            handlePresetSelect(preset.value);
                          }
                        }}
                        className={`text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                          isActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-on-surface hover:bg-background-subtle'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Panel (Right side) - only shown for custom selection */}
                {filterType === 'custom' && (
                  <div className="p-4 w-72 select-none">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={handlePrevMonth}
                        type="button" 
                        className="p-1 hover:bg-background-subtle rounded-full text-secondary hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] font-bold">chevron_left</span>
                      </button>
                      <span className="font-semibold text-xs text-on-surface">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={handleNextMonth}
                        type="button" 
                        className="p-1 hover:bg-background-subtle rounded-full text-secondary hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] font-bold">chevron_right</span>
                      </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <span key={d} className="text-[10px] font-bold text-secondary uppercase tracking-wider py-1">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map(({ date, isCurrentMonth }, idx) => {
                        const isSelectedStart = isSameDay(date, selectedStart);
                        const isSelectedEnd = isSameDay(date, selectedEnd);
                        const inRange = isBetweenDays(date, selectedStart, selectedEnd);
                        const inPreview = isBetweenPreview(date, selectedStart, hoveredDate);

                        let btnClass = "w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-lg transition-all focus:outline-none ";
                        
                        if (isSelectedStart || isSelectedEnd) {
                          btnClass += "bg-primary text-white shadow-sm font-bold scale-95";
                        } else if (inRange || inPreview) {
                          btnClass += "bg-primary/10 text-primary rounded-none hover:bg-primary/20";
                        } else {
                          btnClass += isCurrentMonth 
                            ? "text-on-surface hover:bg-background-subtle" 
                            : "text-secondary/40 hover:bg-background-subtle";
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleDateClick(date)}
                            onMouseEnter={() => setHoveredDate(date)}
                            onMouseLeave={() => setHoveredDate(null)}
                            className={btnClass}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-light">
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(false)}
                        className="px-3 py-1.5 bg-surface-container border border-border-light rounded-lg text-[11px] font-bold text-on-surface hover:bg-surface-variant transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCustomRange}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-surface-tint transition-all shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter mb-gutter">
        <KpiCard
          icon="link"
          title="Total Links"
          value={data.totalLinksCount?.toLocaleString() || '0'}
          badge="Lifetime"
          iconBg="bg-surface-container"
          iconColor="text-tertiary"
          badgeVariant="neutral"
        />
        <KpiCard
          icon="ads_click"
          title="Total Clicks"
          value={data.totalClicks?.toLocaleString() || '0'}
          badge={queryParams.days ? `Last ${queryParams.days} Days` : 'Custom Range'}
          iconBg="bg-primary-fixed-dim"
          iconColor="text-primary"
          badgeVariant="neutral"
        />
        <KpiCard
          icon="check_circle"
          title="Active Links"
          value={data.activeLinksCount?.toLocaleString() || '0'}
          badge="Currently Active"
          iconBg="bg-tertiary-fixed-dim"
          iconColor="text-tertiary-container"
          badgeVariant="success"
        />
        <KpiCard
          icon="bolt"
          title="Clicks Today"
          value={data.clicksToday?.toLocaleString() || '0'}
          badge="Since Midnight"
          iconBg="bg-[#FFF4E5]"
          iconColor="text-[#D97706]"
          badgeVariant="success"
        />
      </div>

      {/* ── Analytics Bento Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        {/* Click Trends Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-gutter flex flex-col min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-on-background">
              Click Trends ({queryParams.days ? `Last ${queryParams.days} Days` : 'Custom Range'})
            </h3>
            <Link href="/analytics" className="text-secondary hover:text-primary transition-colors text-sm font-medium flex items-center gap-1">
              Full Analytics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            {data.dailyClicks && data.dailyClicks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyClicks} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
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
            ) : (
              <div className="flex h-full items-center justify-center text-secondary">No click data available yet</div>
            )}
          </div>
        </div>

        {/* Traffic Sources + Device Breakdown */}
        <div className="lg:col-span-1 flex flex-col gap-gutter">
          <div className="flex-1 bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-gutter min-h-[200px] flex flex-col">
            <h3 className="font-headline-md text-[18px] text-on-background mb-2">
              Traffic Sources
            </h3>
            <div className="flex-1 w-full min-h-[140px]">
              {data.trafficSources?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.trafficSources} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="source" width={80} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-secondary text-sm">No source data</div>
              )}
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-gutter min-h-[200px] flex flex-col">
            <h3 className="font-headline-md text-[18px] text-on-background mb-2">
              Device Breakdown
            </h3>
            <div className="flex-1 w-full min-h-[140px]">
              {data.deviceBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="device"
                    >
                      {data.deviceBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-secondary text-sm">No device data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Links Table / Cards on Mobile ───────────────────── */}
      <div className="bg-surface-container-lowest rounded-lg border border-border-light shadow-sm overflow-hidden flex flex-col mb-12">
        <div className="p-gutter border-b border-border-light flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-background">
            Top Performing Links
          </h3>
          <Link
            href="/links"
            className="text-primary font-label-md text-label-md hover:underline font-bold"
          >
            View All
          </Link>
        </div>

        {/* Desktop View Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-border-light">
                {['Title', 'Short URL', 'Clicks', 'Status', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      className={`py-3 px-gutter font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold${col === 'Actions' || col === 'Clicks' ? ' text-right' : ''}`}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-background">
              {data.topLinks?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-secondary">No links created yet.</td></tr>
              ) : data.topLinks?.map((link: any) => (
                <tr
                  key={link._id}
                  className="border-b border-border-light/50 hover:bg-background-subtle transition-all last:border-0"
                >
                  <td className="py-4 px-gutter font-medium">{link.title || 'Untitled'}</td>
                  <td className="py-4 px-gutter">
                    <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono-code text-[13px] text-primary hover:underline">
                      {link.shortUrl?.replace(/^https?:\/\//, '') || link.slug}
                    </a>
                  </td>
                  <td className="py-4 px-gutter text-right font-mono-code font-semibold">{link.clicks.toLocaleString()}</td>
                  <td className="py-4 px-gutter">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {link.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-gutter text-right">
                    <Link href={`/analytics?linkId=${link._id}`} className="text-secondary hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards List */}
        <div className="block md:hidden divide-y divide-border-light/50">
          {data.topLinks?.length === 0 ? (
            <div className="py-8 text-center text-secondary text-sm">No links created yet.</div>
          ) : (
            data.topLinks?.map((link: any) => (
              <div key={link._id} className="p-4 flex items-center justify-between hover:bg-background-subtle transition-all">
                <div className="flex gap-3 overflow-hidden">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">description</span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-label-md text-label-md text-on-surface truncate max-w-[180px]">
                      {link.title || 'Untitled'}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono-code text-[11px] text-tertiary bg-surface-container px-1.5 py-0.5 rounded truncate max-w-[150px]">
                        {link.shortUrl?.replace(/^https?:\/\//, '') || link.slug}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(link.shortUrl);
                        }}
                        className="text-secondary hover:text-primary transition-colors"
                        title="Copy link"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-3">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {link.clicks.toLocaleString()}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">clicks</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${link.status === 'active' ? 'bg-[#1FB07E]' : 'bg-secondary'}`}></span>
                    <Link href={`/analytics?linkId=${link._id}`} className="text-primary text-xs hover:underline flex items-center">
                      <span className="material-symbols-outlined text-base">bar_chart</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Deep-dive analytics for all your links and campaigns.',
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-64 text-secondary">
        <span className="material-symbols-outlined text-[40px] animate-spin mb-4">refresh</span>
        <p>Loading analytics dashboard...</p>
      </div>
    }>
      <AnalyticsClient />
    </Suspense>
  );
}

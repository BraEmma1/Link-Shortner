'use client';

import { useEffect } from 'react';
import { startKeepAlive, stopKeepAlive } from '@/lib/keepAlive';

/**
 * KeepAliveProvider
 *
 * Mounts invisibly in the root layout to:
 *  - Immediately warm up the Express backend on first page load
 *  - Keep the server alive with a ping every 14 minutes
 *
 * This prevents Render free-tier cold starts from making the app feel slow.
 */
export default function KeepAliveProvider() {
  useEffect(() => {
    startKeepAlive();
    return () => stopKeepAlive();
  }, []);

  return null;
}

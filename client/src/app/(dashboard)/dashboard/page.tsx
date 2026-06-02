import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track your link performance and audience engagement.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}

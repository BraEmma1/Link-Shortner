import type { Metadata } from 'next';
import NewsroomClient from './NewsroomClient';

export const metadata: Metadata = {
  title: 'Vaultz Media Link Center',
  description: 'Generate clean, trackable links for stories, campaigns, and social media distribution.',
};

export default function RootLandingPage() {
  return <NewsroomClient />;
}

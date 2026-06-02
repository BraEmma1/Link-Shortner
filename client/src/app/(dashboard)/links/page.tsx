import type { Metadata } from 'next';
import LinksClient from './LinksClient';

export const metadata: Metadata = {
  title: 'Links',
  description: 'Manage and organize all your shortened links.',
};

export default function LinksPage() {
  return <LinksClient />;
}

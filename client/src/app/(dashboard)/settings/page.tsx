import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account, team, and workspace preferences.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}

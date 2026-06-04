import type { Metadata } from 'next';
import QRCodesClient from './QRCodesClient';

export const metadata: Metadata = {
  title: 'QR Code Center',
  description: 'Manage and download high-resolution QR codes for your shortened links.',
};

export default function QRCodesPage() {
  return <QRCodesClient />;
}

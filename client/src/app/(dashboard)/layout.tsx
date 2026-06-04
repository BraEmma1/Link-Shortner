'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SideNavBar from '@/components/layout/SideNavBar';
import TopNavBar from '@/components/layout/TopNavBar';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Links', href: '/dashboard/links', icon: 'link' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'bar_chart' },
  { label: 'QR', href: '/dashboard/qr', icon: 'qr_code' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        targetUrl,
        customSlug: customSlug || undefined,
        title: title || undefined,
      };

      const { data } = await api.post('/links', payload);
      
      if (data.success) {
        setGeneratedLink(data.link.shortUrl);
        // Reset form
        setTargetUrl('');
        setCustomSlug('');
        setTitle('');
        
        // Optional: close modal automatically after a delay
        // setTimeout(() => setIsCreateModalOpen(false), 2500);
      } else {
        setError(data.error || 'Failed to create link');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred while creating the link');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setError('');
    setGeneratedLink('');
    setIsCopied(false);
    setTargetUrl('');
    setCustomSlug('');
    setTitle('');
  };

  if (pathname === '/') {
    return (
      <div className="bg-background-subtle text-on-surface min-h-screen flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="bg-background-subtle text-on-surface h-screen overflow-hidden flex">
      {/* Fixed Sidebar */}
      <SideNavBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 w-full h-full relative">
        {/* Sticky Top Bar */}
        <TopNavBar onCreateLink={() => setIsCreateModalOpen(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto pb-24 md:pb-margin-desktop">
          {children}
        </main>

        {/* Mobile FAB for Create Action */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-50 active:scale-95 transition-transform md:hidden"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-3 bg-surface border-t border-border-light shadow-lg rounded-t-xl md:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1.5 scale-95 active:scale-90 transition-all font-bold'
                    : 'flex flex-col items-center justify-center text-secondary px-4 py-1.5 active:scale-95 transition-all'
                }
              >
                <span className={`material-symbols-outlined${isActive ? ' fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-label-sm text-label-sm mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Create Link Modal (shared across all dashboard pages) ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        title={generatedLink ? "Link Created!" : "Create New Link"}
      >
        {generatedLink ? (
          <div className="p-6 pb-8">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
              </div>
              <h3 className="text-on-surface font-headline-sm font-semibold mb-2">Short Link Ready!</h3>
              <p className="text-secondary font-body-sm mb-6">Your short URL has been generated and is ready to share.</p>
              
              <div className="flex items-center gap-2 bg-surface-container-lowest border border-border-light rounded-lg p-1.5 pl-4 max-w-sm mx-auto shadow-inner">
                <input 
                  type="text" 
                  value={generatedLink} 
                  readOnly 
                  className="bg-transparent border-none outline-none font-mono-code text-[14px] text-on-surface flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className={`p-2.5 rounded flex items-center justify-center transition-all ${isCopied ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-primary text-white hover:bg-surface-tint shadow-sm'}`}
                  title="Copy to clipboard"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setGeneratedLink('')}
                className="px-5 py-2.5 bg-surface-container-lowest border border-border-light text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors min-h-[40px]"
              >
                Create Another Link
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateLink} className="p-6 space-y-5">
            {/* Notifications */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            {/* Destination URL */}
          <div>
            <label
              htmlFor="destinationUrl"
              className="block font-label-sm text-label-sm text-on-surface mb-1.5"
            >
              Destination URL <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                link
              </span>
              <input
                id="destinationUrl"
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/very/long/path/to/resource"
                className="w-full pl-10 pr-4 py-2.5 bg-background-subtle border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-sm text-body-sm transition-all text-on-surface"
              />
            </div>
            <p className="mt-1.5 font-body-sm text-[11px] text-secondary">
              The long URL you want to shorten.
            </p>
          </div>

          {/* Custom Slug & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="customSlug"
                className="block font-label-sm text-label-sm text-on-surface mb-1.5"
              >
                Custom Slug{' '}
                <span className="text-secondary font-normal ml-1">(Optional)</span>
              </label>
              <div className="flex items-center rounded-lg border border-border-light bg-background-subtle overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <span className="pl-3 pr-1 py-2.5 text-secondary font-mono-code text-[13px] bg-surface-variant/30 border-r border-border-light whitespace-nowrap">
                  vlz.link/
                </span>
                <input
                  id="customSlug"
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-campaign"
                  className="w-full px-2 py-2.5 bg-transparent border-none focus:ring-0 outline-none font-mono-code text-[13px] text-on-surface"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="linkTitle"
                className="block font-label-sm text-label-sm text-on-surface mb-1.5"
              >
                Link Title{' '}
                <span className="text-secondary font-normal ml-1">(Optional)</span>
              </label>
              <input
                id="linkTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q3 Marketing Blast"
                className="w-full px-3 py-2.5 bg-background-subtle border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-sm text-body-sm transition-all text-on-surface"
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label
              htmlFor="expirationDate"
              className="block font-label-sm text-label-sm text-on-surface mb-1.5"
            >
              Expiration Date{' '}
              <span className="text-secondary font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                calendar_today
              </span>
              <input
                id="expirationDate"
                type="datetime-local"
                className="w-full pl-10 pr-4 py-2.5 bg-background-subtle border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-sm text-body-sm transition-all text-on-surface"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border-light -mx-6 px-6 pb-0 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={isLoading}
              className="px-5 py-2.5 bg-surface-container-lowest border border-border-light text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors min-h-[40px] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors shadow-sm hover:shadow-md min-h-[40px] flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              )}
              {isLoading ? 'Generating...' : 'Generate Link'}
            </button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
}

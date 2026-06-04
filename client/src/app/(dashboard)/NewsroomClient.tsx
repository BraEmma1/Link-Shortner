'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function NewsroomClient() {
  const { isAuthenticated } = useAuth();

  // Shortener form state
  const [targetUrl, setTargetUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [displayDomain, setDisplayDomain] = useState('thevaultzmedia.com');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        setDisplayDomain('localhost:5000');
      }
    }
  }, []);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isQRDownloading, setIsQRDownloading] = useState(false);

  // Element reference for focus
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsGenerating(true);
    setError('');
    setGeneratedLink('');

    // Introduce a brief loading state for micro-animation feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const payload = {
        targetUrl,
        customSlug: customSlug || undefined,
      };

      const { data } = await api.post('/links', payload);

      if (data.success) {
        setGeneratedLink(data.link.shortUrl);
      } else {
        setError(data.error || 'Failed to generate link');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'An error occurred while generating the short URL'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadQRCode = async () => {
    if (!generatedLink) return;
    setIsQRDownloading(true);
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(generatedLink)}&color=ad0014`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${customSlug || 'shortlink'}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download QR code', err);
      // Fallback: open in a new window/tab
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(generatedLink)}&color=ad0014`, '_blank');
    } finally {
      setIsQRDownloading(false);
    }
  };

  const resetShortener = () => {
    setGeneratedLink('');
    setTargetUrl('');
    setCustomSlug('');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-subtle">
      {/* ── Landing Header ── */}
      <header className="bg-surface border-b border-border-light shadow-sm w-full">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/The_Vaultz_News_Logo.png"
              alt="The Vaultz News Logo"
              className="h-9 w-auto object-contain shrink-0"
            />
            <span className="hidden md:inline text-[10px] text-secondary font-bold uppercase tracking-wider border-l border-border-light pl-3 py-1">
              Newsroom Portal
            </span>
          </div>

          {/* Action Button */}
          <div>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg font-label-md text-label-md transition-all active:scale-95 shadow-sm inline-flex items-center gap-2 hover:shadow"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Open Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-surface-container-lowest border border-border-light hover:bg-surface-container-low text-on-surface px-5 py-2.5 rounded-lg font-label-md text-label-md transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Landing Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-margin-mobile py-16">
        <div className="w-full max-w-2xl space-y-8">
          {/* Branding Banner */}
          <div className="text-center space-y-3">
            <h1 className="font-display-lg text-4xl md:text-5xl text-on-background font-extrabold tracking-tight">
              Instant Story Link Shortener
            </h1>
            <p className="font-body-lg text-body-md md:text-body-lg text-secondary max-w-lg mx-auto leading-relaxed">
              Paste your long URL to generate a trackable shortcut in seconds.
            </p>
          </div>

          {/* Shortener Container */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-md border border-border-light/75 p-6 md:p-8 space-y-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {/* URL Input */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-background font-bold">
                  Story URL
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[22px]">
                    link
                  </span>
                  <input
                    ref={urlInputRef}
                    required
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://thevaultzmedia.com/news/article-slug-name"
                    className="w-full pl-12 pr-4 py-3.5 bg-background-subtle border border-border-light rounded-xl outline-none transition-all font-body-md text-body-md text-on-surface shadow-inner"
                  />
                </div>
              </div>

              {/* Custom Slug Input */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-background font-bold">
                  Custom Slug <span className="text-secondary-fixed-dim text-xs font-normal">(Optional)</span>
                </label>
                <div className="flex rounded-xl border border-border-light bg-background-subtle transition-all shadow-inner">
                  <span className="flex items-center px-4 bg-surface-container-low border-r border-border-light text-secondary font-medium text-body-md select-none rounded-l-[11px]">
                    {displayDomain}/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="e.g. galamsey"
                    className="w-full px-4 py-3.5 bg-transparent outline-none font-body-md text-body-md text-on-surface rounded-r-[11px]"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-headline-md font-bold shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-75 min-h-[54px]"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[22px] animate-spin">sync</span>
                    <span>Shortening link...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">bolt</span>
                    <span>Generate Short Link</span>
                  </>
                )}
              </button>
            </form>

            {/* Results & Optional QR Code Preview */}
            {generatedLink && (
              <div className="bg-surface-container rounded-xl border border-primary-container/15 p-6 animate-fadeIn space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                  {/* Link Details */}
                  <div className="flex-1 w-full min-w-0 space-y-2">
                    <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-extrabold">
                      Short Link Created
                    </p>
                    <div className="bg-surface-container-lowest border border-border-light p-3.5 rounded-lg flex items-center justify-between shadow-inner">
                      <code className="font-mono-code text-primary font-bold text-base md:text-lg truncate select-all pr-2">
                        {generatedLink}
                      </code>
                      <button
                        onClick={handleCopy}
                        className={`flex-shrink-0 p-2 rounded-md transition-colors ${isCopied
                            ? 'text-[#10B981] bg-green-50'
                            : 'text-secondary hover:text-primary hover:bg-background-subtle'
                          }`}
                        title="Copy Link"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-surface-container-lowest border border-border-light px-4 py-2.5 rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span>Open Link</span>
                      </a>
                      <button
                        onClick={resetShortener}
                        className="bg-on-background text-white px-4 py-2.5 rounded-lg font-label-sm text-label-sm hover:bg-black transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        <span>Create Another</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Code Column */}
                  <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center justify-center p-3 bg-surface-container-lowest border border-border-light rounded-xl">
                    <div className="relative w-32 h-32 flex items-center justify-center bg-white p-1 rounded-lg shadow-sm border border-border-light/40 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedLink)}&color=ad0014`}
                        alt="Short link QR code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={downloadQRCode}
                      disabled={isQRDownloading}
                      className="mt-2.5 inline-flex items-center gap-1 font-label-sm text-[11px] font-bold text-secondary hover:text-primary transition-all disabled:opacity-50"
                    >
                      {isQRDownloading ? (
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-xs">download</span>
                      )}
                      <span>Download QR PNG</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 bg-surface-container-lowest border-t border-border-light">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-secondary">
          <div className="flex items-center gap-2 opacity-70">
            <span className="material-symbols-outlined text-sm">link</span>
            <span>The Vaultz Corporation</span>
          </div>
          <div>© 2026 Vaultz Links. Internal Editorial Portal.</div>
        </div>
      </footer>
    </div>
  );
}

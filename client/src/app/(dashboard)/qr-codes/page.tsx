import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Codes',
  description: 'Generate and manage QR codes for your links.',
};

export default function QrCodesPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">
            QR Codes
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Generate, customize, and download QR codes for your links.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="bg-surface-container-lowest border border-border-light rounded-lg px-4 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-secondary outline-none">
            <option>All Links</option>
            <option>Active Only</option>
          </select>
        </div>
      </div>

      {/* ── QR Code Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter mb-12">
        {/* Skeleton cards — replaced with real QR data in Phase 2 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-gutter flex flex-col items-center gap-4 hover:shadow-[0_4px_12px_rgba(39,58,100,0.05)] transition-shadow"
          >
            {/* QR placeholder square */}
            <div className="w-32 h-32 bg-surface-container rounded-lg animate-pulse" />
            {/* Link title */}
            <div className="w-full space-y-2">
              <div className="h-4 bg-surface-container rounded animate-pulse w-3/4 mx-auto" />
              <div className="h-3 bg-surface-container rounded animate-pulse w-1/2 mx-auto" />
            </div>
            {/* Actions */}
            <div className="flex gap-2 w-full">
              <button className="flex-1 py-2 border border-border-light rounded-lg font-label-sm text-label-sm text-secondary hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </button>
              <button className="py-2 px-3 border border-border-light rounded-lg text-secondary hover:text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

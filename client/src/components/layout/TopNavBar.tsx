'use client';

import { useAuth } from '@/context/AuthContext';

interface TopNavBarProps {
  /** Called when user clicks "Create Link" button */
  onCreateLink?: () => void;
}

export default function TopNavBar({ onCreateLink }: TopNavBarProps) {
  const { user } = useAuth();

  // Build initials from display name (e.g. "John Doe" → "JD")
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'VL';

  return (
    <header className="sticky top-0 w-full z-40 bg-surface-container-lowest border-b border-border-light shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop py-unit h-16">
      {/* ── Left: Search / Mobile Brand ────────────────── */}
      <div className="flex items-center flex-1 max-w-md">
        {/* Desktop search */}
        <div className="relative w-full hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search links, domains, tags..."
            className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-colors font-body-sm text-body-sm placeholder:text-on-surface-variant"
          />
        </div>

        {/* Mobile brand fallback with link icon */}
        <div className="flex md:hidden items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">link</span>
          <h1 className="font-headline-md text-headline-lg-mobile font-bold text-primary">
            Vaultz Links
          </h1>
        </div>
      </div>

      {/* ── Right: Actions & Profile ───────────────────── */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button suppressHydrationWarning className="hidden md:flex text-on-surface-variant hover:text-primary transition-colors items-center justify-center w-10 h-10 rounded-full hover:bg-background-subtle">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Help */}
        <button suppressHydrationWarning className="hidden md:flex text-on-surface-variant hover:text-primary transition-colors items-center justify-center w-10 h-10 rounded-full hover:bg-background-subtle">
          <span className="material-symbols-outlined">help</span>
        </button>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-border-light mx-2" />

        {/* Create Link CTA */}
        <button
          suppressHydrationWarning
          id="create-link-btn"
          onClick={onCreateLink}
          className="hidden md:flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors gap-2 min-h-[40px]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Link
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-md text-label-md ml-2 border border-border-light select-none cursor-pointer shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}

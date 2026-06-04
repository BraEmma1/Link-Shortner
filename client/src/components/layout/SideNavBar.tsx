'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Links', href: '/dashboard/links', icon: 'link' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'analytics' },
  { label: 'QR Codes', href: '/dashboard/qr', icon: 'qr_code' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
];

export default function SideNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  return (
    <nav className="hidden md:flex flex-col h-full p-gutter fixed left-0 top-0 w-64 z-50 bg-sidebar-dark shadow-md">
      {/* ── Logo / Brand ─────────────────────────────── */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined fill text-[20px]">link</span>
        </div>
        <div>
          <h1 className="font-headline-lg text-[20px] font-bold text-surface-container-lowest leading-tight">
            Vaultz Links
          </h1>
          <p className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">
            Enterprise Tier
          </p>
        </div>
      </div>

      {/* ── Navigation Links ──────────────────────────── */}
      <div className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 px-3 py-2 bg-primary-container text-white rounded-lg font-bold scale-[0.98] transition-transform'
                  : 'flex items-center gap-3 px-3 py-2 text-secondary-fixed-dim hover:text-surface-container-lowest hover:bg-[#334670] transition-colors duration-200 rounded-lg'
              }
            >
              <span
                className={`material-symbols-outlined${isActive ? ' fill' : ''}`}
              >
                {item.icon}
              </span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Footer CTA ────────────────────────────────── */}
      <div className="mt-auto pt-4 flex flex-col gap-2">
        {isAuthenticated && (
          <button suppressHydrationWarning className="w-full py-2 px-4 rounded-lg border border-secondary-fixed-dim text-surface-container-lowest hover:bg-[#334670] transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              workspace_premium
            </span>
            Upgrade Plan
          </button>
        )}

        {isAuthenticated ? (
          <button
            suppressHydrationWarning
            onClick={logout}
            className="w-full py-2 px-4 rounded-lg text-secondary-fixed-dim hover:text-surface-container-lowest hover:bg-[#334670] transition-colors font-label-md text-label-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        ) : (
          <button
            suppressHydrationWarning
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 rounded-lg bg-primary text-white hover:bg-surface-tint transition-colors font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

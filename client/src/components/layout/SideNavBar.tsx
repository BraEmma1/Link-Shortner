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
      <div className="mb-8 px-2 flex flex-col gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/The_Vaultz_News_Logo.png"
          alt="The Vaultz News Logo"
          className="h-10 w-auto object-contain self-start"
        />
        <p className="font-label-sm text-[10px] text-secondary-fixed-dim uppercase tracking-wider mt-1 border-t border-slate-700/20 pt-1.5 w-full">
          Enterprise Tier
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-1">
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
                  ? 'flex items-center gap-3 px-3 py-2 bg-primary-container text-white rounded-lg font-bold scale-[0.98] transition-transform'
                  : 'flex items-center gap-3 px-3 py-2 text-secondary-fixed-dim hover:text-surface-container-lowest hover:bg-[#334670] transition-colors duration-200 rounded-lg'
              }
            >
              <span className={`material-symbols-outlined${isActive ? ' fill' : ''}`}>
                {item.icon}
              </span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-2">
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

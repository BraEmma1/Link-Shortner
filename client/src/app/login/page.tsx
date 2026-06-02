'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Metadata } from 'next';

// Note: metadata export works in Server Components only.
// For client components, set it in a parent or a separate metadata file.
// The root layout handles default metadata.

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('demo@vaultzlinks.io');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased h-screen w-screen overflow-hidden flex">
      {/* ── Left Panel: Branding ─────────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar-dark flex-col justify-between p-margin-desktop relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined fill">link</span>
          </div>
          <span className="font-headline-lg text-headline-lg text-surface-container-lowest tracking-tight">
            Vaultz Links
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-lg mb-20">
          <h1 className="font-display-lg text-display-lg text-surface-container-lowest mb-6">
            Create, Track and Manage Smart Links.
          </h1>
          <p className="font-body-lg text-body-lg text-secondary-fixed-dim">
            Enterprise-grade URL management platform engineered for clarity,
            trust, and executive-level precision.
          </p>
        </div>

        {/* Abstract UI hint */}
        <div className="absolute bottom-0 right-0 w-3/4 h-2/3 bg-gradient-to-tl from-[#1E293B] to-transparent rounded-tl-3xl border-t border-l border-[#334155] shadow-2xl overflow-hidden p-6 opacity-80 pointer-events-none translate-x-12 translate-y-12">
          <div className="w-full h-full bg-[#0F172A] rounded-xl border border-[#334155] p-4 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-1/3 h-24 bg-[#1E293B] rounded-lg border border-[#334155]" />
              <div className="w-2/3 h-24 bg-[#1E293B] rounded-lg border border-[#334155]" />
            </div>
            <div className="w-full h-40 bg-[#1E293B] rounded-lg border border-[#334155]" />
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ──────────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined fill">link</span>
            </div>
            <span className="font-headline-md text-headline-md text-sidebar-dark tracking-tight">
              Vaultz Links
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Welcome back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-error-container text-error px-4 py-3 rounded-lg font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Email or Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="font-label-md text-label-md text-on-surface"
              >
                Email Address or Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">
                  person
                </span>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full bg-background-subtle border border-border-light rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="font-label-md text-label-md text-on-surface"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-subtle border border-border-light rounded-lg pl-10 pr-12 py-3 font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border border-border-light rounded bg-background-subtle checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
                  />
                  <span className="material-symbols-outlined absolute text-surface-container-lowest opacity-0 peer-checked:opacity-100 pointer-events-none text-[16px]">
                    check
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember for 30 days
                </span>
              </label>
              <a
                href="#"
                className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              id="submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-surface-tint disabled:opacity-70 disabled:cursor-not-allowed text-white font-label-md text-label-md py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 min-h-[40px]"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <a
                href="#"
                className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
              >
                Request access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

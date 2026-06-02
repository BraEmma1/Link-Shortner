'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Metadata } from 'next';

// ─────────────────────────────────────────────
// Modern Login Page — ported from Stitch design
// "Vaultz Links - Modern Login (Alt)"
// ─────────────────────────────────────────────

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const busy = isSubmitting || isLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-style: normal;
          font-size: 20px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }

        .fill-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .bold-icon  { font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 24; }

        /* ── Desktop layout ── */
        .login-page {
          height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background-color: #eff4ff;
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image:
            linear-gradient(#334670 1px, transparent 1px),
            linear-gradient(90deg, #334670 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
        }

        .login-page::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #eff4ff 0%, transparent 60%, rgba(185,203,254,0.1) 100%);
          pointer-events: none;
          z-index: 0;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
          padding: 32px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Mobile-only brand (shown above card on mobile) */
        .mobile-brand { display: none; }

        /* Brand inside card (desktop) */
        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .brand-icon {
          width: 56px;
          height: 56px;
          background: #d22528;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(210, 37, 40, 0.3);
        }

        .brand-icon .material-symbols-outlined {
          font-size: 28px;
          color: #fff;
        }

        .brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.5px;
        }

        .login-heading {
          width: 100%;
          text-align: center;
          margin-bottom: 24px;
        }

        .login-heading h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 26px;
          font-weight: 600;
          color: #0d1c2e;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .login-heading p {
          font-size: 15px;
          color: #5c403d;
          line-height: 1.5;
        }

        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #0d1c2e;
          letter-spacing: 0.01em;
        }

        .input-wrap { position: relative; }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #5c403d;
          font-size: 18px;
          pointer-events: none;
          z-index: 1;
        }

        .input-action {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #5c403d;
          font-size: 18px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-action:hover { color: #0d1c2e; }

        .field input[type="email"],
        .field input[type="password"],
        .field input[type="text"] {
          width: 100%;
          background: #f8f9ff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 13px 16px 13px 44px;
          font-size: 15px;
          color: #0d1c2e;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .field input:focus {
          background: #fff;
          border-color: #ad0014;
          box-shadow: 0 0 0 3px rgba(173, 0, 20, 0.1);
        }

        .field input::placeholder { color: #b0a0a0; }

        .row-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-wrap {
          position: relative;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .checkbox-wrap input[type="checkbox"] {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 1.5px solid #E2E8F0;
          border-radius: 4px;
          background: #f8f9ff;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .checkbox-wrap input[type="checkbox"]:checked {
          background: #ad0014;
          border-color: #ad0014;
        }

        .checkbox-check {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 12px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .checkbox-wrap input[type="checkbox"]:checked + .checkbox-check { opacity: 1; }

        .remember-label span {
          font-size: 13px;
          color: #5c403d;
        }

        .forgot-link {
          font-size: 13px;
          font-weight: 600;
          color: #ad0014;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 0.75; text-decoration: underline; }

        .error-alert {
          background: #ffdad6;
          border: 1px solid #ffb3ac;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #93000a;
          font-size: 13px;
          line-height: 1.5;
          animation: slideDown 0.2s ease;
        }

        .error-alert .material-symbols-outlined {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .btn-login {
          width: 100%;
          background: #d22528;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          padding: 15px 24px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(210, 37, 40, 0.35);
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          margin-top: 4px;
          letter-spacing: 0.01em;
        }

        .btn-login:hover:not(:disabled) {
          background: #ad0014;
          box-shadow: 0 6px 20px rgba(173, 0, 20, 0.4);
          transform: translateY(-1px);
        }

        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          margin-top: 24px;
          text-align: center;
        }

        .login-footer p {
          font-size: 13px;
          color: #5c403d;
        }

        .login-footer a {
          font-weight: 600;
          color: #ad0014;
          text-decoration: none;
          margin-left: 4px;
          transition: opacity 0.2s;
        }

        .login-footer a:hover { opacity: 0.75; text-decoration: underline; }

        .divider {
          width: 100%;
          border: none;
          border-top: 1px solid #E2E8F0;
          margin: 8px 0;
        }

        /* ── Small desktop / tablet ── */
        @media (max-height: 700px) {
          .brand { margin-bottom: 16px; }
          .login-heading { margin-bottom: 16px; }
          .login-form { gap: 14px; }
          .login-card { padding: 24px 32px; }
          .brand-icon { width: 44px; height: 44px; }
          .brand-name { font-size: 18px; }
          .login-heading h1 { font-size: 22px; }
        }

        /* ── Mobile: bottom-sheet layout ── */
        @media (max-width: 520px) {

          /* Page becomes a column: brand at top, card at bottom */
          .login-page {
            flex-direction: column;
            justify-content: flex-end;
            align-items: stretch;
            padding: 0;
          }

          /* Mobile brand floats on the gradient background */
          .mobile-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            flex: 1;
            padding-bottom: 8px;
            z-index: 10;
            position: relative;
          }

          .mobile-brand-icon {
            width: 68px;
            height: 68px;
            background: #d22528;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(210, 37, 40, 0.35);
          }

          .mobile-brand-icon .material-symbols-outlined {
            font-size: 34px;
            color: #fff;
          }

          .mobile-brand-name {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 26px;
            font-weight: 700;
            color: #0F172A;
            letter-spacing: -0.5px;
          }

          .mobile-brand-tagline {
            font-size: 13px;
            color: #5c6e8a;
            margin-top: -6px;
            letter-spacing: 0.02em;
          }

          /* Hide the in-card brand on mobile */
          .brand { display: none; }

          /* Bottom-sheet card */
          .login-card {
            max-width: none;
            width: 100%;
            border-radius: 28px 28px 0 0;
            box-shadow: 0 -8px 40px rgba(13, 28, 46, 0.10);
            border: none;
            border-top: 1px solid #e6eeff;
            padding: 32px 28px 44px;
          }

          /* Drag handle hint */
          .login-card::before {
            content: '';
            display: block;
            width: 36px;
            height: 4px;
            background: #d5e3fc;
            border-radius: 9999px;
            margin: 0 auto 24px;
          }

          /* Tighter heading */
          .login-heading {
            margin-bottom: 20px;
          }

          .login-heading h1 {
            font-size: 22px;
            margin-bottom: 6px;
          }

          .login-heading p {
            font-size: 14px;
          }

          /* Bigger touch targets on mobile */
          .login-form { gap: 16px; }

          .field input[type="email"],
          .field input[type="password"],
          .field input[type="text"] {
            padding: 15px 16px 15px 46px;
            font-size: 16px; /* prevents iOS zoom */
            border-radius: 14px;
          }

          .input-icon { font-size: 20px; left: 14px; }

          .input-action {
            font-size: 20px;
            right: 14px;
            padding: 8px; /* bigger tap area */
          }

          /* Larger checkbox tap area */
          .checkbox-wrap { width: 20px; height: 20px; }
          .checkbox-wrap input[type="checkbox"] { width: 20px; height: 20px; }

          .remember-label span { font-size: 14px; }
          .forgot-link { font-size: 14px; }

          /* Full-height button for easy tapping */
          .btn-login {
            padding: 17px 24px;
            font-size: 16px;
            border-radius: 14px;
            margin-top: 8px;
          }

          .login-footer { margin-top: 20px; }
          .login-footer p { font-size: 14px; }

          .divider { margin: 6px 0; }
        }

        /* Extra small phones */
        @media (max-width: 360px) {
          .login-card { padding: 28px 20px 40px; }
          .mobile-brand-name { font-size: 22px; }
          .mobile-brand-icon { width: 58px; height: 58px; }
        }
      `}</style>

      <div className="login-page">

        {/* Mobile-only: brand floats on gradient above the bottom-sheet card */}
        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <span className="material-symbols-outlined fill-icon">link</span>
          </div>
          <span className="mobile-brand-name">Vaultz Links</span>
          <span className="mobile-brand-tagline">Branded links & analytics</span>
        </div>

        <main className="login-card">

          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">
              <span className="material-symbols-outlined fill-icon">link</span>
            </div>
            <span className="brand-name">Vaultz Links</span>
          </div>

          {/* Heading */}
          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Sign in to manage your branded links and analytics.</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={busy}
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                  disabled={busy}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  suppressHydrationWarning
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="row-options">
              <label className="remember-label">
                <div className="checkbox-wrap">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={busy}
                  />
                  <span className="material-symbols-outlined checkbox-check bold-icon">check</span>
                </div>
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            {/* Error */}
            {error && (
              <div className="error-alert" role="alert">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-login"
              disabled={busy}
              id="login-submit-btn"
            >
              {busy ? (
                <>
                  <div className="spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <hr className="divider" style={{ marginTop: '32px' }} />

          {/* Footer */}
          <div className="login-footer">
            <p>
              Don&apos;t have an account?
              <a href="#">Request access</a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

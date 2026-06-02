import { redirect } from 'next/navigation';

/**
 * Root page — redirects to /dashboard.
 * The middleware will intercept unauthenticated requests to /dashboard
 * and redirect them to /login automatically.
 */
export default function RootPage() {
  redirect('/dashboard');
}

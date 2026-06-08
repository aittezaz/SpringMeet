// app/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true); // Always show success to prevent enumeration
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-6">
      <div className="bg-surface border border-white/10 rounded-3xl p-10 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div>
          <span className="font-display text-xl font-bold grad-text">SpringMeet</span>
        </Link>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="font-display text-2xl font-bold mb-3">Check your email</h1>
            <p className="text-white/40 text-sm mb-6">If that email exists, we've sent a reset link. Check your inbox and spam folder.</p>
            <Link href="/login" className="text-bloom hover:underline text-sm">← Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-center mb-2">Reset password</h1>
            <p className="text-white/40 text-center text-sm mb-8">Enter your email and we'll send a reset link</p>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-bloom/50 transition-all" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center mt-6"><Link href="/login" className="text-bloom text-sm hover:underline">← Back to sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}

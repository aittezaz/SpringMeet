'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');
    try {
      await login(email, password);
      toast.success('Welcome back! 🌸');
      router.push('/queue');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-[80px] opacity-15 bg-bloom top-1/4 -left-20" />
        <div className="absolute w-96 h-96 rounded-full blur-[80px] opacity-10 bg-petal bottom-1/4 -right-20" />
      </div>
      <div className="bg-surface border border-white/10 rounded-3xl p-10 w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div>
          <span className="font-display text-xl font-bold grad-text">SpringMeet</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-center mb-2">Welcome back 🌸</h1>
        <p className="text-white/40 text-center text-sm mb-8">Sign in to continue meeting amazing people</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-white/50 font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-bloom hover:underline">Forgot password?</Link>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-bloom/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-2">
            {isLoading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div className="flex items-center gap-3 my-6 text-white/20 text-xs"><div className="flex-1 h-px bg-white/10"/><span>or</span><div className="flex-1 h-px bg-white/10"/></div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => toast('Google login coming soon!')} className="glass border border-white/10 py-3 rounded-xl text-sm text-white/60 hover:bg-white/10 transition-all">🔵 Google</button>
          <button onClick={() => toast('Apple login coming soon!')} className="glass border border-white/10 py-3 rounded-xl text-sm text-white/60 hover:bg-white/10 transition-all">⚫ Apple</button>
        </div>
        <p className="text-center text-sm text-white/40">Don't have an account? <Link href="/signup" className="text-bloom hover:underline">Join free</Link></p>
      </div>
    </div>
  );
}

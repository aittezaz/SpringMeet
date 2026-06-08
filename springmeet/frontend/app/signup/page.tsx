'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName:'', username:'', email:'', password:'', confirm:'', dob:'', country:'', tos:false, safe:false });
  const [strength, setStrength] = useState(0);

  const checkStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  };

  const strengthColor = ['', '#EF4444','#F97316','#EAB308','#34D399'][strength];
  const strengthLabel = ['','Weak','Fair','Good','Strong ✓'][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.username || !form.email || !form.password || !form.dob || !form.country) return toast.error('Please fill all required fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    const age = (Date.now() - new Date(form.dob).getTime()) / (1000*60*60*24*365.25);
    if (age < 18) return toast.error('You must be 18+ to use SpringMeet');
    if (!form.tos || !form.safe) return toast.error('Please accept the Terms of Service and community pledge');
    setLoading(true);
    try {
      await authApi.register({ email: form.email, password: form.password, username: form.username, displayName: form.firstName, dateOfBirth: form.dob, country: form.country });
      toast.success('Account created! Check your email to verify. 🌸');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const countries = ['Pakistan','United States','United Kingdom','India','Japan','Germany','Brazil','South Korea','Turkey','Saudi Arabia','South Africa','Nigeria','Australia','Canada','France','Egypt','Argentina','Mexico','Indonesia','Bangladesh','Other'];

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-6 pt-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-[80px] opacity-15 bg-bloom -top-20 -left-20" />
        <div className="absolute w-96 h-96 rounded-full blur-[80px] opacity-10 bg-petal -bottom-20 -right-20" />
      </div>
      <div className="bg-surface border border-white/10 rounded-3xl p-10 w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div>
          <span className="font-display text-xl font-bold grad-text">SpringMeet</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-center mb-2">Create your account</h1>
        <p className="text-white/40 text-center text-sm mb-8">Join 2M+ people making connections worldwide 🌍</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-2 font-medium">First Name</label>
              <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName:e.target.value})} placeholder="Aittezaz" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2 font-medium">Username</label>
              <input type="text" value={form.username} onChange={e => setForm({...form, username:e.target.value})} placeholder="@springlover" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium">Password</label>
            <input type="password" value={form.password} onChange={e => { setForm({...form, password:e.target.value}); checkStrength(e.target.value); }} placeholder="Create a strong password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
            {form.password && <div className="mt-2"><div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${strength * 25}%`, background: strengthColor }} /></div><div className="text-xs mt-1" style={{ color: strengthColor }}>{strengthLabel}</div></div>}
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} placeholder="Repeat password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-2 font-medium">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2 font-medium">Country</label>
              <select value={form.country} onChange={e => setForm({...form, country:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 focus:bg-bloom/5 transition-all" required>
                <option value="">Select...</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="text-xs text-white/30 bg-white/3 rounded-xl p-3">You must be 18+ to use SpringMeet. We verify your age during registration.</div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.tos} onChange={e => setForm({...form, tos:e.target.checked})} className="mt-0.5 accent-bloom flex-shrink-0" />
            <span className="text-xs text-white/50 leading-relaxed">I am 18+ and agree to the <Link href="/terms" className="text-bloom hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-bloom hover:underline">Privacy Policy</Link></span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.safe} onChange={e => setForm({...form, safe:e.target.checked})} className="mt-0.5 accent-bloom flex-shrink-0" />
            <span className="text-xs text-white/50 leading-relaxed">I agree to use SpringMeet responsibly and respect all other users</span>
          </label>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-bloom/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {loading ? 'Creating account...' : '🌸 Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-white/40 mt-6">Already have an account? <Link href="/login" className="text-bloom hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}

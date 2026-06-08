// Save as: app/contact/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', topic:'General question', message:'' });
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill in all fields');
    setSent(true);
    toast.success('Message sent! Aittezaz will reply within 24h 🌸');
  };
  return (
    <div className="min-h-screen bg-deep">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-deep/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div><span className="font-display font-bold grad-text">SpringMeet</span></Link>
          <Link href="/signup" className="bg-gradient-to-r from-bloom to-petal text-white px-4 py-2 rounded-xl text-sm font-semibold">Join Free</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-bloom font-semibold">Get in touch</span>
          <h1 className="font-display text-5xl font-bold mt-3 mb-4">Contact Us 🌸</h1>
          <p className="text-white/50 max-w-lg mx-auto font-light">Have a question, suggestion, or need help? We'd love to hear from you.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Reach us directly</h2>
            {[
              { icon:'📧', label:'Email', val:'aittezazahmad@gmail.com', href:'mailto:aittezazahmad@gmail.com' },
              { icon:'📞', label:'Phone / WhatsApp', val:'+92 341 909 8201', href:'tel:+923419098201' },
              { icon:'💬', label:'WhatsApp Chat', val:'Chat with Aittezaz directly', href:'https://wa.me/923419098201' },
              { icon:'👤', label:'Founder', val:'Aittezaz Ahmad', href:'#' },
            ].map(item => (
              <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                className="flex items-center gap-4 p-4 bg-surface border border-white/10 rounded-2xl mb-3 hover:border-bloom/30 hover:translate-x-1 transition-all text-white no-underline">
                <div className="w-10 h-10 rounded-xl bg-bloom/15 flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
                <div><div className="text-xs text-white/30 mb-0.5">{item.label}</div><div className="text-sm font-medium">{item.val}</div></div>
              </a>
            ))}
            <div className="mt-6 p-5 bg-bloom/5 border border-bloom/10 rounded-2xl">
              <div className="font-semibold text-sm mb-2">⏱️ Response time</div>
              <p className="text-xs text-white/40 leading-relaxed">We typically respond within 24 hours. For urgent safety concerns, we aim for 2 hours.</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Send a message</h2>
            {sent ? (
              <div className="bg-leaf/10 border border-leaf/20 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-display text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-white/50 text-sm">Aittezaz will reply to <strong>{form.email}</strong> within 24 hours. 🌸</p>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-surface border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <div><label className="block text-xs text-white/50 mb-2">Your Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 transition-all" /></div>
                <div><label className="block text-xs text-white/50 mb-2">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 transition-all" /></div>
                <div><label className="block text-xs text-white/50 mb-2">Topic</label>
                  <select value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 transition-all">
                    {['General question','Report a problem','Safety concern','Account issue','Partnership / Business','Feature suggestion','Other'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-white/50 mb-2">Message</label><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="How can we help?" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 transition-all resize-none" /></div>
                <button type="submit" className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-bloom/30 hover:-translate-y-0.5 transition-all">Send Message →</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

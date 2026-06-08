'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [timerSecs, setTimerSecs] = useState(754);
  const [demoInput, setDemoInput] = useState('');
  const [demoMsgs, setDemoMsgs] = useState([
    { id: 1, type: 'in', text: "Hey! What's something you're genuinely passionate about? 🌿" }
  ]);
  const msgsRef = useRef<HTMLDivElement>(null);

  const replies = [
    "That's so interesting! Tell me more 🌿",
    "Honestly same... this feels different somehow 😊",
    "Haha you're really easy to talk to!",
    "Wait really? I love that. Where are you from?",
    "I think I needed to hear that today 💫",
    "You're surprisingly deep for a stranger 🥺",
    "Okay I'm clicking Accept. This is too good to lose!",
  ];
  let replyIdx = 0;

  useEffect(() => {
    const t = setInterval(() => setTimerSecs(s => s > 0 ? s - 1 : 754), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [demoMsgs]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendDemo = () => {
    if (!demoInput.trim()) return;
    const msg = demoInput.trim();
    setDemoInput('');
    setDemoMsgs(m => [...m, { id: Date.now(), type: 'out', text: msg }]);
    setTimeout(() => {
      setDemoMsgs(m => [...m, { id: Date.now() + 1, type: 'in', text: replies[replyIdx++ % replies.length] }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-deep text-white overflow-x-hidden">
      {/* Animated BG */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[90px] opacity-20 bg-bloom -top-48 -left-48" style={{ animation: 'drift 20s ease-in-out infinite' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-15 bg-petal -bottom-36 -right-36" style={{ animation: 'drift 18s ease-in-out infinite reverse' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-10 bg-blossom top-1/2 left-1/3" style={{ animation: 'drift 15s ease-in-out infinite 5s' }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-deep/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-lg" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>🌸</div>
            <span className="font-display text-xl font-bold grad-text">SpringMeet</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="#how" className="text-white/60 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">How it works</a>
            <a href="#modes" className="text-white/60 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Modes</a>
            <a href="#safety" className="text-white/60 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Safety</a>
            <a href="/contact" className="text-white/60 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Sign in</Link>
            <Link href="/signup" className="bg-gradient-to-r from-bloom to-petal text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-bloom/40 hover:-translate-y-0.5 transition-all">Join Free 🌸</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-bloom/10 border border-bloom/20 rounded-full px-4 py-2 text-sm text-pink-300 mb-8">
                <span className="w-2 h-2 rounded-full bg-bloom animate-pulse" />
                2,400+ live conversations right now
              </div>
              <h1 className="font-display text-6xl md:text-7xl font-black leading-[1.05] mb-6">
                Make spring<br /><span className="grad-text">all over</span><br />the world.
              </h1>
              <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md font-light">
                Meet a real stranger in a 15-minute timed conversation. If you both feel the spark — the chat becomes permanent. If not — it disappears. No pressure. Pure magic.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                <Link href="/queue" className="bg-gradient-to-r from-bloom to-petal text-white px-7 py-4 rounded-2xl text-base font-semibold hover:shadow-xl hover:shadow-bloom/40 hover:-translate-y-1 transition-all flex items-center gap-2">🌸 Meet a Stranger</Link>
                <Link href="/signup" className="glass text-white px-7 py-4 rounded-2xl text-base font-medium hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center gap-2">💫 Find a Soulmate</Link>
                <Link href="/signup" className="border border-petal/30 text-petal px-7 py-4 rounded-2xl text-base font-medium hover:bg-petal/10 hover:-translate-y-1 transition-all">⚡ Start a Spark</Link>
              </div>
              <div className="flex gap-8 pt-8 border-t border-white/10">
                {[['140+','Countries'],['2M+','Conversations'],['68%','Accept Rate'],['18+','Age Verified']].map(([n,l]) => (
                  <div key={l}><div className="font-display text-2xl font-bold grad-text">{n}</div><div className="text-xs text-white/40 mt-1">{l}</div></div>
                ))}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative flex justify-center">
              <div className="w-64 h-[520px] rounded-[36px] glass border border-white/10 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-lg">🦋</div>
                    <div>
                      <div className="text-sm font-semibold">Luna, 24 · Amsterdam</div>
                      <div className="text-xs text-leaf flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse" />Online</div>
                    </div>
                  </div>
                </div>
                <div className="bg-bloom/10 border border-bloom/20 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Session ends in</div>
                  <div className="font-display text-2xl font-bold grad-text">{fmt(timerSecs)}</div>
                </div>
                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                  {[
                    { t: 'in', m: "Hey! Favourite season? 🍂" },
                    { t: 'out', m: "Autumn — everything slows down 🌿" },
                    { t: 'in', m: "Most poetic thing I've heard! 😭" },
                    { t: 'out', m: "Haha this feels different somehow" },
                    { t: 'in', m: "Should we accept each other? 👀" },
                  ].map((msg, i) => (
                    <div key={i} className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[85%] ${msg.t === 'in' ? 'bg-white/7 border border-white/10 self-start rounded-bl-sm' : 'bg-gradient-to-r from-bloom/30 to-petal/30 border border-bloom/20 self-end rounded-br-sm'}`}>{msg.m}</div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-bloom to-petal text-white text-xs font-bold">❤️ Accept</button>
                  <button className="flex-1 py-2.5 rounded-xl bg-white/7 text-white/50 text-xs">Skip</button>
                </div>
              </div>
              <div className="absolute top-8 -right-4 glass border border-white/10 rounded-2xl px-3 py-2 text-xs" style={{ animation: 'float 5s ease-in-out infinite' }}>
                <div className="text-white/40 text-[10px]">Match found</div>
                <div className="text-leaf font-semibold">✓ Both accepted!</div>
              </div>
              <div className="absolute bottom-24 -left-6 glass border border-white/10 rounded-2xl px-3 py-2 text-xs" style={{ animation: 'float 5s ease-in-out infinite 2.5s' }}>
                <div className="text-white/40 text-[10px]">Spark started</div>
                <div className="text-bloom font-semibold">🔥 15 min timer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-bloom font-semibold">The magic</span>
            <h2 className="font-display text-5xl font-bold mt-3 mb-4">How SpringMeet works</h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto font-light">Four steps. Fifteen minutes. Possibly a friendship that lasts a lifetime.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['👤','Create profile','Set your vibe, interests, and conversation style. 100% free.'],
              ['🎯','Pick your mode','Deep talk, soulmate, friendship, or pure chaos. You choose.'],
              ['⏱️','15-minute spark','The timer creates beautiful pressure. Be real. Be you.'],
              ['💌','Mutual accept','Both say yes? Permanent inbox. Didn\'t? Clean slate.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="text-center group">
                <div className="w-20 h-20 rounded-full bg-bloom/10 border border-bloom/20 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:bg-bloom/20 group-hover:scale-105 transition-all">{icon}</div>
                <div className="font-display font-bold text-base mb-2">{title}</div>
                <div className="text-white/40 text-sm leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODES */}
      <section id="modes" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <span className="text-xs uppercase tracking-widest text-bloom font-semibold">Conversation modes</span>
          <h2 className="font-display text-5xl font-bold mt-3 mb-4">Find your kind of spark</h2>
          <p className="text-white/50 text-lg mb-14 max-w-md font-light">Every conversation deserves the right energy from the start.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              ['🌹','Find a Soulmate','For those ready to meet someone who might change their life. Real chemistry.','Most popular','bp'],
              ['🌊','Deep Talk','Skip small talk. Jump into life, meaning, dreams, fears.','Trending','bv'],
              ['🌱','Friendship Mode','No romance. Warm, genuine human connection across borders.','Wholesome','bg'],
              ['🎲','Fun & Random','Chaos energy. Weird debates, shared playlists — anything goes.','Wild','ba'],
              ['🌍','Make Spring Worldwide','Connect across cultures. Real-time translation bridges every border.','Global','bb'],
              ['🔮','AI Icebreaker','Let AI spark the first question — weird, fun, and unexpected.','New ✨','bv'],
            ].map(([icon, name, desc, badge]) => (
              <Link href="/queue" key={name} className="card hover:border-bloom/30 hover:-translate-y-1 cursor-pointer group block">
                <span className="text-3xl mb-4 block">{icon}</span>
                <div className="font-display font-bold text-lg mb-2">{name}</div>
                <div className="text-white/40 text-sm leading-relaxed mb-4">{desc}</div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-bloom/10 text-pink-300 border border-bloom/20">{badge}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section className="relative z-10 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-bloom font-semibold">Try it now</span>
            <h2 className="font-display text-5xl font-bold mt-3 mb-4">Feel the conversation</h2>
            <p className="text-white/50 font-light">Type something — no sign-up needed for this preview.</p>
          </div>
          <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-bloom/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-petal to-sky flex items-center justify-center text-lg">🌿</div>
                <div>
                  <div className="font-semibold text-sm">Kai · Seoul, South Korea</div>
                  <div className="text-xs text-white/40">🌏 Online · Friendship Mode</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase mb-1">Ends in</div>
                <div className="font-display text-xl font-bold grad-text">{fmt(timerSecs)}</div>
              </div>
            </div>
            <div ref={msgsRef} className="p-5 flex flex-col gap-3 min-h-[240px] max-h-72 overflow-y-auto">
              {demoMsgs.map(msg => (
                <div key={msg.id} className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[78%] msg-enter ${msg.type === 'in' ? 'bg-white/7 border border-white/10 self-start rounded-bl-sm' : 'bg-gradient-to-r from-bloom/25 to-petal/25 border border-bloom/20 self-end rounded-br-sm'}`}>{msg.text}</div>
              ))}
            </div>
            <div className="flex gap-3 p-4 border-t border-white/10">
              <input value={demoInput} onChange={e => setDemoInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendDemo()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-bloom/50 placeholder-white/20" placeholder="Be real. Be yourself. Type anything..." />
              <button onClick={sendDemo} className="bg-gradient-to-r from-bloom to-petal w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:scale-105 transition-transform">➤</button>
            </div>
            <div className="flex gap-3 p-4 pt-0">
              <Link href="/signup" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-bloom to-petal text-white text-sm font-bold text-center">❤️ Sign up & Accept for real</Link>
              <button onClick={() => setDemoMsgs([{ id: Date.now(), type: 'in', text: "Hey! New chat — what's on your mind? 🌸" }])} className="flex-1 py-3 rounded-xl bg-white/7 text-white/50 text-sm border border-white/10">Skip & Meet Next →</button>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-leaf/5 to-sky/5 border border-leaf/15 rounded-3xl p-14">
            <div className="grid md:grid-cols-2 gap-14 items-start">
              <div>
                <span className="text-xs uppercase tracking-widest text-leaf font-semibold">Safety first</span>
                <h2 className="font-display text-4xl font-bold mt-3 mb-5">A safe space to be real</h2>
                <p className="text-white/50 leading-relaxed mb-8 font-light">SpringMeet is strictly 18+. Every session is protected by AI moderation, community trust systems, and a dedicated human moderation team.</p>
                <div className="flex flex-wrap gap-2">
                  {['🛡️ AI Moderation','⚠️ 3-Strike System','🚫 Instant Block','👁️ Human Review'].map(b => (
                    <span key={b} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-leaf/10 text-emerald-300 border border-leaf/20">{b}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  ['🤖','AI moderation','Every message scanned for toxicity before it\'s seen.'],
                  ['📊','3-strike system','First warning. Second warning. Third: suspended or banned.'],
                  ['🗑️','Expired chats vanish','No mutual accept = deleted. No logs, no archive, no trace.'],
                  ['🌍','Human moderation','Reports reviewed by real people 24/7.'],
                  ['🚫','Permanent block','Blocked users never appear in your queue again.'],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex gap-3 p-4 bg-leaf/5 border border-leaf/10 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-leaf/15 flex items-center justify-center text-base flex-shrink-0">{icon}</div>
                    <div>
                      <div className="text-sm font-semibold mb-1">{title}</div>
                      <div className="text-xs text-white/40 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-6xl mb-6">🌸</div>
          <h2 className="font-display text-5xl font-black leading-tight mb-5">Your next 15 minutes<br />could <span className="grad-text">change everything.</span></h2>
          <p className="text-white/50 text-lg mb-12 font-light">2,400 people are in the queue right now. Someone is waiting to meet you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="bg-gradient-to-r from-bloom to-petal text-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-bloom/40 hover:-translate-y-1 transition-all">🌸 Start for Free</Link>
            <Link href="/contact" className="glass border border-white/10 text-white px-10 py-5 rounded-2xl text-lg font-medium hover:bg-white/10 hover:-translate-y-1 transition-all">Contact Us →</Link>
          </div>
          <p className="text-white/25 text-sm mt-8">No credit card. No obligations. 18+ only. Built by Aittezaz Ahmad.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div>
                <span className="font-display font-bold grad-text">SpringMeet</span>
              </div>
              <p className="text-white/35 text-sm leading-relaxed">Make spring all over the world. Real strangers. Real conversations. 140+ countries.</p>
              <div className="flex gap-2 mt-5">
                <a href="mailto:aittezazahmad@gmail.com" className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-sm hover:border-bloom/30 transition-colors">📧</a>
                <a href="https://wa.me/923419098201" target="_blank" className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-sm hover:border-bloom/30 transition-colors">💬</a>
                <a href="tel:+923419098201" className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-sm hover:border-bloom/30 transition-colors">📞</a>
              </div>
            </div>
            {[
              ['Product', [['Meet Strangers','/queue'],['How it Works','#how'],['Modes','#modes'],['Demo Chat','#demo']]],
              ['Company', [['About','/about'],['Contact','/contact'],['Safety Center','/safety'],['Blog','#']]],
              ['Legal', [['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Cookie Policy','#'],['GDPR','#']]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h4 className="text-xs uppercase tracking-widest text-white/30 font-semibold mb-5">{title as string}</h4>
                {(links as [string,string][]).map(([label, href]) => (
                  <Link key={label} href={href} className="block text-sm text-white/40 hover:text-white mb-3 transition-colors">{label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
            <div>© 2025 SpringMeet. Built by <a href="mailto:aittezazahmad@gmail.com" className="text-bloom">Aittezaz Ahmad</a>. All rights reserved.</div>
            <div>🌸 Making the world a little more springy, one conversation at a time.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

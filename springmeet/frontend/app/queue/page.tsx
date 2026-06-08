'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { matchingApi } from '../../lib/api';

const MODES = [
  { id:'SOULMATE', icon:'🌹', label:'Soulmate' },
  { id:'DEEP_TALK', icon:'🌊', label:'Deep Talk' },
  { id:'FRIENDSHIP', icon:'🌱', label:'Friendship' },
  { id:'RANDOM', icon:'🎲', label:'Random' },
  { id:'GLOBAL', icon:'🌍', label:'Global' },
  { id:'AI_ICEBREAKER', icon:'🔮', label:'AI Mode' },
];

type Phase = 'pick' | 'searching' | 'found';

export default function QueuePage() {
  const router = useRouter();
  const [mode, setMode] = useState('RANDOM');
  const [phase, setPhase] = useState<Phase>('pick');
  const [dots, setDots] = useState(0);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    if (phase !== 'searching') return;
    const d = setInterval(() => setDots(p => (p + 1) % 4), 500);
    return () => clearInterval(d);
  }, [phase]);

  const startSearch = async () => {
    setPhase('searching');
    try {
      const { data } = await matchingApi.joinQueue({ mode });
      if (data.matched) {
        setMatch({ sessionId: data.sessionId });
        setPhase('found');
      } else {
        // Poll for match via socket in real app; simulate here
        setTimeout(() => {
          const partners = [
            { displayName:'Luna', country:'Netherlands', emoji:'🦋' },
            { displayName:'Kai', country:'South Korea', emoji:'🌿' },
            { displayName:'Sofia', country:'Argentina', emoji:'🌺' },
            { displayName:'Alex', country:'UK', emoji:'⭐' },
          ];
          setMatch({ partner: partners[Math.floor(Math.random()*partners.length)], sessionId:'demo-session' });
          setPhase('found');
        }, 4000);
      }
    } catch {
      // Demo mode — simulate match
      setTimeout(() => {
        const partners = [
          { displayName:'Luna', country:'Netherlands', emoji:'🦋' },
          { displayName:'Kai', country:'South Korea', emoji:'🌿' },
        ];
        setMatch({ partner: partners[Math.floor(Math.random()*partners.length)], sessionId:'demo-session' });
        setPhase('found');
      }, 3000 + Math.random() * 2000);
    }
  };

  const cancel = async () => {
    try { await matchingApi.leaveQueue(); } catch {}
    setPhase('pick');
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 bg-bloom top-1/4 left-1/4" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-10 bg-petal bottom-1/4 right-1/4" />
      </div>

      <div className="bg-surface border border-white/10 rounded-3xl p-12 w-full max-w-lg relative z-10 text-center">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div>
          <span className="font-display font-bold grad-text">SpringMeet</span>
        </Link>

        {phase === 'pick' && (
          <>
            <h1 className="font-display text-3xl font-bold mb-2">Choose your mode 🌸</h1>
            <p className="text-white/40 text-sm mb-8">Pick the kind of conversation you want to have</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`py-4 px-3 rounded-2xl border text-center transition-all ${mode === m.id ? 'border-bloom bg-bloom/10 text-bloom' : 'border-white/10 bg-white/3 text-white/60 hover:border-white/20'}`}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className="text-xs font-medium">{m.label}</div>
                </button>
              ))}
            </div>
            <button onClick={startSearch} className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-bloom/30 hover:-translate-y-0.5 transition-all">Enter Queue →</button>
            <p className="text-white/25 text-xs mt-5">Average wait: ~12 seconds · 2,400+ online</p>
          </>
        )}

        {phase === 'searching' && (
          <>
            <div className="w-24 h-24 rounded-full border-2 border-bloom/20 border-t-bloom mx-auto mb-8 flex items-center justify-center" style={{ animation: 'spin 1s linear infinite' }}>
              <span className="text-3xl" style={{ animation: 'spin 1s linear infinite reverse' }}>🌸</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Finding your match{'.'.repeat(dots)}</h2>
            <p className="text-white/40 text-sm mb-2">Mode: <span className="text-white font-medium">{MODES.find(m => m.id === mode)?.icon} {MODES.find(m => m.id === mode)?.label}</span></p>
            <p className="text-white/25 text-xs mb-10">Searching through 2,400+ people</p>
            <button onClick={cancel} className="glass border border-white/10 text-white/60 px-8 py-3 rounded-xl text-sm hover:bg-white/10 transition-all">Cancel</button>
          </>
        )}

        {phase === 'found' && match && (
          <>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-4xl mx-auto mb-6" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>🌸</div>
            <h2 className="font-display text-3xl font-bold mb-3">Match found!</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-2xl">{match.partner?.emoji || '🦋'}</div>
              <div className="w-20 h-0.5 bg-gradient-to-r from-bloom to-petal" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-petal to-sky flex items-center justify-center text-xl">👤</div>
            </div>
            <p className="font-semibold text-lg mb-1">{match.partner?.displayName || 'Your match'} from {match.partner?.country || 'the world'}</p>
            <p className="text-white/40 text-sm mb-8">Your 15-minute conversation starts now! ⏱️</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push(`/chat/${match.sessionId}`)} className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-bloom/30 transition-all">🌸 Start Chatting →</button>
              <button onClick={() => { setPhase('pick'); setMatch(null); }} className="glass border border-white/10 text-white/60 py-3 rounded-xl text-sm hover:bg-white/10 transition-all">Skip this match</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

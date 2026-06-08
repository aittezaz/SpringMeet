'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const DEMO_REPLIES = [
  "That's really interesting — tell me more! 🌿",
  "I wasn't expecting that answer, I love it 😊",
  "You're surprisingly easy to talk to 🥺",
  "Haha okay you're funny, I'll give you that 😂",
  "Honestly same. It's weird how much I agree.",
  "That's the most real thing I've heard all day 💫",
  "Wait — seriously? Where are you from?",
  "I think I needed to hear that today...",
  "Okay I'm definitely clicking Accept after this 🌸",
];

export default function ChatPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [secsLeft, setSecsLeft] = useState(15 * 60);
  const [msgs, setMsgs] = useState([
    { id: 1, type: 'in', text: "Hey! 👋 I'm glad we matched. What's been the highlight of your week?", time: '12:00', status: '✓✓' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [myAccepted, setMyAccepted] = useState(false);
  const [theirAccepted, setTheirAccepted] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (secsLeft <= 0) { toast.error('Session expired — chat deleted 🍂'); router.push('/queue'); return; }
    const t = setTimeout(() => setSecsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secsLeft]);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isUrgent = secsLeft < 120;
  const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const sendMsg = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMsgs(m => [...m, { id: Date.now(), type: 'out', text, time: nowTime(), status: '✓' }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, type: 'in', text: DEMO_REPLIES[replyIdx % DEMO_REPLIES.length], time: nowTime(), status: '✓✓' }]);
      setReplyIdx(i => i + 1);
    }, 1200 + Math.random() * 800);
  };

  const accept = () => {
    if (myAccepted) return;
    setMyAccepted(true);
    toast.success('You accepted! Waiting for them... 💌');
    // Simulate other person accepting after 3 seconds
    setTimeout(() => {
      setTheirAccepted(true);
      setShowAcceptModal(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-deep/80 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/queue" className="text-white/40 hover:text-white transition-colors text-sm">← Back</Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-lg">🦋</div>
            <div>
              <div className="text-sm font-semibold">Luna · Amsterdam</div>
              <div className="text-xs text-leaf flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse" />Online</div>
            </div>
          </div>
          {/* Timer */}
          <div className="text-center">
            <div className="text-[10px] text-white/30 uppercase tracking-widest">Ends in</div>
            <div className={`font-display text-xl font-bold ${isUrgent ? 'text-bloom timer-urgent' : 'grad-text'}`}>{fmt(secsLeft)}</div>
          </div>
          {/* Report */}
          <button onClick={() => toast('Report submitted. Our team will review within 24h. 🛡️')} className="text-white/20 hover:text-white/60 transition-colors text-xs">⚑</button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-gradient-to-r from-bloom to-petal transition-all" style={{ width: `${(secsLeft / (15 * 60)) * 100}%` }} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 max-w-2xl mx-auto w-full px-4">
        <div className="py-6 text-center">
          <div className="text-xs text-white/20 bg-white/5 rounded-full px-4 py-1.5 inline-block">🌸 You matched! {DEMO_REPLIES.length > 5 ? 'Mode: Friendship' : 'Mode: Deep Talk'} · 15 min timer started</div>
        </div>
        <div className="flex flex-col gap-4">
          {msgs.map(msg => (
            <div key={msg.id} className={`flex ${msg.type === 'out' ? 'justify-end' : 'justify-start'} msg-enter`}>
              {msg.type === 'in' && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">🦋</div>}
              <div className="max-w-[75%]">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'in' ? 'bg-white/7 border border-white/10 rounded-tl-sm' : 'bg-gradient-to-br from-bloom/30 to-petal/30 border border-bloom/20 rounded-tr-sm'}`}>{msg.text}</div>
                <div className={`text-[10px] text-white/20 mt-1 flex items-center gap-1 ${msg.type === 'out' ? 'justify-end' : ''}`}>{msg.time} {msg.type === 'out' && <span className="text-sky">{msg.status}</span>}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-sm flex-shrink-0">🦋</div>
              <div className="px-4 py-3 bg-white/7 border border-white/10 rounded-2xl rounded-tl-sm flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>
        <div ref={msgsEndRef} />
      </div>

      {/* Accept Banner */}
      {myAccepted && !theirAccepted && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-bloom/10 border-b border-bloom/20 py-2 text-center text-sm text-pink-300">
          💌 You accepted! Waiting for Luna to accept...
        </div>
      )}

      {/* Input + Accept */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Accept row */}
          {!theirAccepted && (
            <div className="flex gap-3 mb-3">
              <button onClick={accept} disabled={myAccepted}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${myAccepted ? 'bg-bloom/20 text-pink-300 border border-bloom/30 cursor-not-allowed' : 'bg-gradient-to-r from-bloom to-petal text-white hover:shadow-lg hover:shadow-bloom/30 hover:-translate-y-0.5'}`}>
                {myAccepted ? '✓ You accepted — waiting...' : '❤️ Accept & Save This Chat'}
              </button>
              <button onClick={() => { toast('Moving to next stranger... 🌸'); setTimeout(() => router.push('/queue'), 800); }}
                className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-all">
                Skip →
              </button>
            </div>
          )}
          {/* Message input */}
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMsg()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-bloom/50 placeholder-white/20"
              placeholder="Type a message..." maxLength={2000} />
            <button onClick={sendMsg} disabled={!input.trim()}
              className="bg-gradient-to-r from-bloom to-petal w-11 h-11 rounded-xl flex items-center justify-center text-lg disabled:opacity-40 hover:scale-105 transition-transform">➤</button>
          </div>
        </div>
      </div>

      {/* Mutual Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-surface border border-white/10 rounded-3xl p-10 max-w-sm w-full text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="font-display text-3xl font-bold mb-3">It's a Match!</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">You both accepted each other! This conversation is now saved permanently in your inbox.</p>
            <div className="bg-bloom/8 border border-bloom/15 rounded-2xl p-4 mb-6">
              <div className="text-xs text-white/30 mb-1">Matched with</div>
              <div className="font-semibold">Luna · Amsterdam 🦋</div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/inbox" className="w-full bg-gradient-to-r from-bloom to-petal text-white py-4 rounded-2xl font-bold block">🌸 Go to Inbox</Link>
              <button onClick={() => setShowAcceptModal(false)} className="glass border border-white/10 text-white/60 py-3 rounded-xl text-sm">Continue Chatting</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

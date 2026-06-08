// ═══════════════ app/inbox/page.tsx ═══════════════
'use client';
import Link from 'next/link';

const DEMO_INBOX = [
  { id:'1', name:'Luna', country:'Amsterdam 🇳🇱', emoji:'🦋', msg:'The way everything slows down...', time:'2m', unread:true },
  { id:'2', name:'Kai', country:'Seoul 🇰🇷', emoji:'🌿', msg:'Are you free to call tonight?', time:'1h', unread:false },
  { id:'3', name:'Sofia', country:'Buenos Aires 🇦🇷', emoji:'🌺', msg:"I've been thinking about what you said...", time:'2d', unread:false },
  { id:'4', name:'Alex', country:'London 🇬🇧', emoji:'⭐', msg:'That playlist you shared is amazing!', time:'3d', unread:false },
];

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-deep">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-deep/80 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div>
            <span className="font-display font-bold grad-text">SpringMeet</span>
          </Link>
          <Link href="/queue" className="bg-gradient-to-r from-bloom to-petal text-white px-4 py-2 rounded-xl text-sm font-semibold">+ New Match</Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold mb-1">Your Inbox 💌</h1>
          <p className="text-white/40 text-sm">Accepted connections — permanent and private</p>
        </div>
        {DEMO_INBOX.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💌</div>
            <p className="text-white/40 mb-6">No accepted connections yet</p>
            <Link href="/queue" className="bg-gradient-to-r from-bloom to-petal text-white px-6 py-3 rounded-xl font-semibold">Meet Someone Now 🌸</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {DEMO_INBOX.map(chat => (
              <Link href={`/inbox/${chat.id}`} key={chat.id}
                className="flex items-center gap-4 p-4 bg-surface border border-white/10 rounded-2xl hover:border-bloom/30 hover:bg-surface/80 transition-all group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bloom to-petal flex items-center justify-center text-2xl flex-shrink-0">{chat.emoji}</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-leaf border-2 border-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{chat.name}</span>
                    <span className="text-xs text-white/30">{chat.country}</span>
                  </div>
                  <div className={`text-xs truncate ${chat.unread ? 'text-white font-medium' : 'text-white/40'}`}>{chat.msg}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-white/30">{chat.time}</span>
                  {chat.unread && <div className="w-2 h-2 rounded-full bg-bloom" />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// app/privacy/page.tsx
import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    ['Data we collect', 'We collect your email, username, country, age, and optional profile details. We collect conversation metadata (timestamps, session outcomes) but NOT expired chat content — that is permanently deleted when a session expires. We collect abuse and moderation events to keep the platform safe for everyone.'],
    ['How we use your data', 'To match you with other users, to protect the community through moderation, to send you important account notifications, and to improve the product. We never sell your data to advertisers or third parties. Period.'],
    ['Expired conversations', 'When a timed session expires without mutual acceptance, all message content is permanently and irreversibly deleted from our servers. Only metadata (session existed, outcome: expired) is retained for safety analytics. Your private conversations are your business, not ours.'],
    ['Accepted conversations', 'Accepted chats are stored securely and are only accessible to the two people involved. You can delete your copy of any conversation at any time from your inbox.'],
    ['Your rights', 'You can request your data, correct it, or delete your entire account at any time from Settings. Account deletion removes all personal data within 30 days. Contact us: aittezazahmad@gmail.com'],
    ['Cookies', 'We use only essential cookies for authentication. No tracking cookies. No advertising cookies. You can disable cookies but this will affect login functionality.'],
    ['Security', 'All data is encrypted in transit (HTTPS/TLS) and at rest. Passwords are hashed using bcrypt. JWT tokens expire regularly. We follow security best practices and update our systems regularly.'],
    ['Contact', 'Privacy questions: Aittezaz Ahmad · aittezazahmad@gmail.com · +92 341 909 8201'],
  ];
  return (
    <div className="min-h-screen bg-deep">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-deep/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bloom to-petal flex items-center justify-center">🌸</div><span className="font-display font-bold grad-text">SpringMeet</span></Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <Link href="/" className="text-bloom text-sm hover:underline mb-8 block">← Back to home</Link>
        <span className="text-xs uppercase tracking-widest text-bloom font-semibold">Legal</span>
        <h1 className="font-display text-4xl font-bold mt-3 mb-2">Privacy Policy</h1>
        <p className="text-white/30 text-sm mb-10">Last updated: January 2025 · Built by Aittezaz Ahmad</p>
        <div className="flex flex-col gap-5">
          {sections.map(([title, body]) => (
            <div key={title} className="bg-surface border border-white/10 rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold mb-3">{title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

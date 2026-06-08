import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    ['Age requirement (18+)', 'SpringMeet is strictly for users aged 18 and above. By signing up, you confirm you are at least 18 years old. Users who misrepresent their age will be permanently banned and reported where required by law.'],
    ['Acceptable use', 'You agree NOT to: harass, threaten, or abuse other users; send spam or illegal content; impersonate others; attempt to circumvent moderation systems; use the platform for commercial solicitation; or share content that violates any applicable law. Violations result in warnings, suspension, or permanent ban depending on severity.'],
    ['Timed conversations', 'You understand that conversations without mutual acceptance are permanently deleted at session expiry. SpringMeet is not responsible for lost connections — the system works exactly as designed and disclosed.'],
    ['Privacy of others', 'You agree to respect the privacy of other users. Do not share, screenshot, or record conversations without the other person\'s explicit consent. We implement best-effort technical privacy protections, though browser-based screenshot detection is inherently limited.'],
    ['Safety', 'You agree to report harmful content using the in-app report feature. SpringMeet reserves the right to terminate accounts that violate community standards, with or without prior warning for severe violations.'],
    ['Moderation', 'SpringMeet uses AI-assisted moderation and human review. Automated systems may flag or remove content. You can appeal moderation decisions by contacting us. Three valid warnings may result in account suspension.'],
    ['Disclaimer', 'SpringMeet is provided "as is". We strive for uptime but cannot guarantee continuous service. We are not liable for the content of user conversations.'],
    ['Contact', 'Questions about these terms: Aittezaz Ahmad · aittezazahmad@gmail.com · +92 341 909 8201'],
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
        <h1 className="font-display text-4xl font-bold mt-3 mb-2">Terms of Service</h1>
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

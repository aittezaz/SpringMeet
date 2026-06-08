import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'SpringMeet – Make Spring All Over the World',
  description: 'Meet real strangers in 15-minute timed conversations. Make friends worldwide. Safe, fun, real.',
  keywords: 'meet strangers, make friends, online chat, global friends, SpringMeet',
  authors: [{ name: 'Aittezaz Ahmad', url: 'mailto:aittezazahmad@gmail.com' }],
  openGraph: {
    title: 'SpringMeet – Make Spring All Over the World',
    description: 'Meet real strangers in 15-minute timed conversations.',
    type: 'website',
    locale: 'en_US',
  },
  manifest: '/manifest.json',
  themeColor: '#FF6B9D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-deep text-white antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#161D2E', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#34D399', secondary: '#161D2E' } },
            error: { iconTheme: { primary: '#FF6B9D', secondary: '#161D2E' } },
          }}
        />
      </body>
    </html>
  );
}

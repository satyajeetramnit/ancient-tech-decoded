import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '🛕 Ancient Tech Decoded — The Celestial Archive',
  description:
    'Where ancient stories meet the frontier of science. Investigating mythological narratives through primary textual scholarship, modern physics, and speculative engineering.',
  keywords: [
    'Ancient Tech Decoded',
    'Brahmastra',
    'Mahabharata',
    'BORI Critical Edition',
    'Vedic Science',
    'Speculative Engineering',
    'Ancient Indian Epics',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-obsidian text-gray-100 min-h-screen selection:bg-gold-antique selection:text-black">
        {children}
      </body>
    </html>
  );
}

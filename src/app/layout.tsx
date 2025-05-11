import { Inter, Lexend } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

export const metadata = {
  title: 'RelateAI – The Founder's Full Funnel Revenue Platform',
  description: 'Outreach powered by AI. Strategy powered by research.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="min-h-screen bg-neutral-50">
        {children}
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
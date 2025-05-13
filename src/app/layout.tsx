'use client';

import { Inter, Lexend } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccountProvider } from '@/contexts/AccountContext';
import { MeddppiccProvider } from '@/contexts/MeddppiccContext';
import { ContactProvider } from '@/contexts/ContactContext';
import { MessageProvider } from '@/contexts/MessageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="min-h-screen bg-neutral-50">
        <AuthProvider>
          <AccountProvider>
            <MeddppiccProvider>
              <ContactProvider>
                <MessageProvider>
                  <ProtectedRoute>
                    {children}
                  </ProtectedRoute>
                  <Toaster position="top-right" />
                  <Analytics />
                </MessageProvider>
              </ContactProvider>
            </MeddppiccProvider>
          </AccountProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
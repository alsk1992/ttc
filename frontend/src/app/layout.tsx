import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solana Tic-Tac-Toe',
  description: 'Play tic-tac-toe on Solana with SOL betting',
  keywords: ['Solana', 'tic-tac-toe', 'blockchain', 'crypto', 'gaming'],
  authors: [{ name: 'Solana Tic-Tac-Toe Team' }],
  openGraph: {
    title: 'Solana Tic-Tac-Toe',
    description: 'Play tic-tac-toe on Solana with SOL betting',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <WalletProvider>
          <div className="min-h-full flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
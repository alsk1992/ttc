import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '井字游戏 · Tic-Tac-Toe on BNB',
  description: 'Play Tic-Tac-Toe on BNB Chain with crypto betting · 币安链上的井字游戏',
  keywords: ['BNB', 'BSC', '井字游戏', 'tic-tac-toe', 'blockchain', 'crypto', 'gaming', '币安链'],
  authors: [{ name: '井字游戏 Team' }],
  openGraph: {
    title: '井字游戏 · Tic-Tac-Toe on BNB',
    description: 'Play Tic-Tac-Toe on BNB Chain · 币安链上的井字游戏',
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
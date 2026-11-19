import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MENCLO PORTAL — Men & Clo Retail Management',
  description: 'Sistem manajemen ritel terpadu untuk Men & Clo | Penjualan, SDM, Inventaris & Laporan Bisnis',
  keywords: ['menclo', 'retail', 'manajemen', 'penjualan', 'SDM'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

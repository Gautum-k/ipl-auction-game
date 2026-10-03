import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SocketProvider } from '../context/SocketContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Gautum's IPL Auction Room — Real-time Multiplayer IPL Auction",
  description:
    "An open-source, multiplayer IPL Auction game. Friends create a room, share a code, and bid against each other for real IPL players using authentic IPL mega-auction rules.",
  keywords: ['IPL', 'Cricket', 'IPL Auction', 'Multiplayer', 'Cricket Game', 'BCCI', 'CSK', 'MI', 'RCB'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body
        className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col selection:bg-amber-500/30 selection:text-amber-200"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <SocketProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </SocketProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

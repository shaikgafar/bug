import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './bugsense-hero.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'BugSense - Autonomous Multi-Agent Software Bug Triage',
  description: 'BugSense: Triage Smarter • Build Faster. GENAI-23 autonomous multi-agent platform orchestrating Triage, Intelligence, Reproduction, and Routing agents to isolate software defects on demand.',
  icons: {
    icon: '/bugsense-icon.png',
    shortcut: '/bugsense-icon.png',
    apple: '/bugsense-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-black selection:text-white bg-white text-neutral-900`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="border-t border-black/10 bg-white py-8 text-center text-xs text-neutral-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-black flex items-center justify-center p-1">
                  <img src="/bugsense-icon.png" alt="BugSense" className="h-full w-full object-contain" />
                </div>
                <span className="font-bold text-black tracking-tight">BugSense</span>
                <span className="text-neutral-300">&bull;</span>
                <span className="text-neutral-500">Triage Smarter &bull; Build Faster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>4 Autonomous Agents Online (Triage, Intelligence, Reproduction, Routing)</span>
              </div>
              <div className="text-neutral-400">
                <span>GENAI-23 Autonomous Bug Triage Engine</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

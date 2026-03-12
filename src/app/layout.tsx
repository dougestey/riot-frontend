import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import { Geist, Geist_Mono } from 'next/font/google';
import { Oswald } from 'next/font/google';
import pkg from '../../package.json';
import { Providers } from './providers';
import { ViewTransitionsWrapper } from '@/components/ViewTransitionsWrapper';
import { PwaSplashRemover } from '@/components/PwaSplashRemover';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RIOT',
  description: 'Discover events near you',
  applicationName: 'RIOT',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RIOT',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased`}
      >
        <div
          id="pwa-splash"
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/riot_logo.png"
              alt=""
              width={56}
              height={56}
              className="shrink-0"
              priority
            />
            <span className="font-brand text-xl font-bold uppercase tracking-wider text-white">
              RIOT
            </span>
            <span className="text-xs font-medium text-white/60">
              {pkg.version}
            </span>
          </div>
        </div>
        <PwaSplashRemover />
        <ViewTransitionsWrapper>
          <Providers>{children}</Providers>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}

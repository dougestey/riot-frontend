import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Oswald } from 'next/font/google';
import { Providers } from './providers';
import { ViewTransitionsWrapper } from '@/components/ViewTransitionsWrapper';
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
        <ViewTransitionsWrapper>
          <Providers>{children}</Providers>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}

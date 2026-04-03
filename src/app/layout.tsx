import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import ClientLayout from './ClientLayout';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cashflow — Personal Finance Tracker',
  description: 'Track your income, expenses, and financial goals with a beautiful dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="h-full antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var d = JSON.parse(localStorage.getItem('finance_app_data'));
                if (d && d.theme === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            })();
          `}}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

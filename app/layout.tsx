import "./globals.css";
import { Inter } from 'next/font/google';
import NavBar from "@/components/NavBar";
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Patreon Requests Dashboard",
  description: "Track and manage Patreon character requests",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style>
          {`html { color-scheme: light !important; }`}
        </style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Force light mode by removing any dark class
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
                // Only add dark if user explicitly saved it
                const theme = localStorage.getItem('theme-preference');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <NavBar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <div className="fixed bottom-4 right-4 z-50">
              <Toaster />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

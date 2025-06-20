import type { Metadata } from 'next';
import { Poppins, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { cn } from '@/lib/utils';
import AppWrapper from '@/components/layout/AppWrapper';

export const metadata: Metadata = {
  title: {
    default: 'Ali Imran - Full-Stack Developer | Portfolio',
    template: '%s | Ali Imran',
  },
  description: 'Welcome to the portfolio of Ali Imran, a skilled Full-Stack Developer specializing in the MERN stack, PHP, and CMS platforms. Explore my projects, learn about my skills, and get in touch for collaboration.',
  keywords: ['Full-Stack Developer', 'MERN Stack', 'PHP', 'WordPress', 'Shopify', 'React Developer', 'Node.js', 'Next.js', 'Portfolio', 'Ali Imran'],
};

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700']
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['700', '800', '900']
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(poppins.variable, montserrat.variable, "font-body antialiased min-h-screen flex flex-col bg-background text-foreground")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

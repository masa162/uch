'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
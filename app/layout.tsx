// app/layout.tsx
import type { Metadata } from 'next';
import { AppProvider } from './lib/context/AppContext';
import './globals.css';

export const metadata: Metadata = {
    title: 'ABO Newspaper - Subscription Service',
    description: 'Premium newspaper subscription service',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="bg-paper text-ink font-serif antialiased">
        <AppProvider>
            {children}
        </AppProvider>
        </body>
        </html>
    );
}

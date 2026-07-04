import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowthOS AI — Your AI Executive Team',
  description: 'Autonomous Multi-Agent Business Growth Operating System. Your AI Executive Team that Thinks, Plans, Executes, and Grows Your Business.',
  keywords: 'AI business growth, multi-agent AI, business intelligence, startup OS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-hero min-h-screen">{children}</body>
    </html>
  );
}

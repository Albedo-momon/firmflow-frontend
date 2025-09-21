import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'FirmFlow - Document Processing Platform',
  description: 'Streamline your document processing workflow with FirmFlow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen bg-white">{children}</main>
      </body>
    </html>
  );
}

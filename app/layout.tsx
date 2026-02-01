import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ClientRouter } from '@/components/ClientRouter';
import React from 'react';

export const metadata = {
  title: 'MockupFlow',
  description: 'Create chatbot mockups instantly',
};

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased">
        <ClientRouter>
          <AuthProvider>{children}</AuthProvider>
        </ClientRouter>
      </body>
    </html>
  );
}
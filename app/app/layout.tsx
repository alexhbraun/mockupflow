'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Link } from '@/components/Link';

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect removed as auth is no longer required
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app" className="flex items-center gap-2 group transition-all">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform">
                M
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">MockupFlow</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/app" className="px-4 py-2 rounded-full text-indigo-600 bg-indigo-50 transition-colors">Dashboard</Link>
              <Link href="/app/mockups/new" className="px-4 py-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Gallery</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block" />
            <Link href="/app/mockups/new">
              <button className="h-9 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                New Mockup
              </button>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
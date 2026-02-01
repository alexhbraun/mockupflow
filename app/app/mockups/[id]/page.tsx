'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from '@/lib/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mockup } from '@/lib/types';
import { Editor } from '@/components/Editor/Editor';

export default function BuilderPage() {
  const { id } = useParams();
  const [mockup, setMockup] = useState<Mockup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('BuilderPage initializing. ID:', id);
    if (!id) {
      console.warn('No ID found in params');
      setLoading(false);
      return;
    }

    // Check if we are in local override mode (via URL or just failure)
    const isLocal = window.location.search.includes('local=true');
    console.log('Is local mode:', isLocal);

    if (isLocal) {
      console.log('Using predefined local mockup');
      setMockup({
        id: id as string,
        shareId: id as string,
        ownerId: 'local-user',
        name: 'Local Mockup',
        description: 'Created in local mode',
        channel: 'WEB',
        theme: { chatTitle: 'Chat Support', primaryColor: '#4f46e5', headerTextColor: '#FFFFFF', iconColor: '#2563EB' },
        assets: { backgroundUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926' },
        flow: [{ id: '1', type: 'BOT_MESSAGE', text: 'Hi! I am a local bot.', delayMs: 800 }],
        createdAt: {} as any,
        updatedAt: {} as any
      });
      setLoading(false);
      return;
    }

    const fetchMockup = async () => {
      console.log('Starting fetch for mockup:', id);
      const docRef = doc(db, 'mockups', id as string);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );

      try {
        const snap = await Promise.race([getDoc(docRef), timeoutPromise]) as any;
        if (snap.exists()) {
          console.log('Mockup found in Firestore');
          setMockup({ id: snap.id, ...snap.data() } as Mockup);
        } else {
          console.warn('Mockup not found in Firestore, falling back');
          throw new Error('not-found');
        }
      } catch (err) {
        console.error("Fetch failed or timed out:", err);
        setMockup({
          id: id as string,
          shareId: id as string,
          ownerId: 'local-user',
          name: 'Local Mockup (Fallback)',
          description: 'Loaded via fallback mode due to database connectivity issues.',
          channel: 'WEB',
          theme: { chatTitle: 'Chat Support', primaryColor: '#4f46e5', headerTextColor: '#FFFFFF', iconColor: '#4f46e5' },
          assets: { backgroundUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926' },
          flow: [{ id: '1', type: 'BOT_MESSAGE', text: 'Hi! I am the local system. The remote database is currently unreachable, but you can build your flow here.', delayMs: 800 }],
          createdAt: {} as any,
          updatedAt: {} as any
        });
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchMockup();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F1F5F9] space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-100" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Initializing Workspace</h2>
          <p className="text-slate-400 text-sm font-medium animate-pulse uppercase tracking-widest">Bridging secure connection...</p>
        </div>
      </div>
    );
  }

  return <Editor initialMockup={mockup} />;
}
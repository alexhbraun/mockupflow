'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { nanoid } from 'nanoid';

export default function NewMockupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function create() {
      // Allow fallback to local-only mode if Auth/DB fails
      const useLocalMode = true; // Force local mode for demo if needed, or try-catch check

      try {
        const id = nanoid(10);
        // Try Firestore if available, use public-user UID
        if (db) {
          const createPromise = addDoc(collection(db, 'mockups'), {
            ownerId: 'public-user',
            shareId: nanoid(10),
            name: 'Untitled Mockup',
            channel: 'WEB',
            description: '',
            theme: { chatTitle: 'Chat Support', primaryColor: '#2563EB', headerTextColor: '#FFFFFF', iconColor: '#2563EB', launcherColor: '#2563EB' },
            assets: { backgroundUrl: 'https://picsum.photos/400/800' },
            flow: [
              { id: nanoid(6), type: 'BOT_MESSAGE', text: 'Welcome to Guardian Pest Solutions. I am Guardian Bot, your AI Customer Service Assistant here to provide expert support. How can I assist you today?', delayMs: 1000 },
              { id: nanoid(6), type: 'INPUT_CAPTURE', prompt: "What's your name?", fieldKey: 'name', fieldType: 'text', required: true, delayMs: 500 },
              { id: nanoid(6), type: 'BOT_MESSAGE', text: 'Nice to meet you! 👋', delayMs: 800 },
              { id: nanoid(6), type: 'QUICK_REPLIES', text: 'How can I help you today?', options: ['Get a Quote', 'Schedule Service', 'Ask a Question'], delayMs: 600 },
              { id: nanoid(6), type: 'BOT_MESSAGE', text: 'Great! Let me connect you with the right team member.', delayMs: 800 }
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          // Fallback if it takes too long (e.g. 3s)
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));

          try {
            const doc = await Promise.race([createPromise, timeoutPromise]) as any;
            router.replace(`/app/mockups/${doc.id}`);
            return;
          } catch (e) {
            console.warn("Firestore creation failed or timed out, falling back to local mode", e);
          }
        }

        // Fallback: Just navigate to a new ID. The Editor will handle "not found" by creating a fresh state.
        console.warn("Using local mode (no auth/db)");
        router.replace(`/app/mockups/${id}?local=true`);

      } catch (e) {
        console.error('NewMockupPage: Error creating mockup:', e);
        // Fallback
        router.replace(`/app/mockups/${nanoid(10)}?local=true`);
      }
    }
    create();
  }, [router]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push('/app')}
          className="text-blue-600 hover:underline"
        >
          Go back to dashboard
        </button>
      </div>
    );
  }

  return <div className="p-8 text-center">Creating workspace...</div>;
}
'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { Mockup } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ViewerPage() {
  const { shareId } = useParams(); // Note: In this simple app, we are using ID as shareId for simplicity
  const searchParams = useSearchParams();
  const [mockup, setMockup] = useState<Mockup | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract tracking & personalization params
  const trackingParams = {
    idid: searchParams.get('idid'),
    adid: searchParams.get('adid'),
    affid: searchParams.get('affid')
  };
  const personalization = searchParams.get('for');

  useEffect(() => {
    if (!shareId) return;

    const idStr = shareId as string;

    const resolveMockup = async () => {
      try {
        // 1. Try technical ID first (direct lookup, no index needed)
        const snap = await getDoc(doc(db, 'mockups', idStr));
        if (snap.exists()) {
          setMockup({ id: snap.id, ...snap.data() } as Mockup);
          setLoading(false);
          return;
        }

        // 2. Try API-based slug resolution (avoids Firestore index issues)
        const apiResponse = await fetch(`/api/resolve/${idStr}`);
        if (apiResponse.ok) {
          const mockupData = await apiResponse.json();
          setMockup(mockupData as Mockup);
          setLoading(false);
          return;
        }

        // 3. Fallback: not found
        console.error("Mockup not found for ID or slug:", idStr);
        setLoading(false);
      } catch (err) {
        console.error("Viewer resolution error", err);
        setLoading(false);
      }
    };

    resolveMockup();
  }, [shareId]);

  const fetchMockupFromApi = (id: string) => {
    fetch(`/api/public/mockup/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) setMockup(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  if (loading) return <div className="h-screen w-screen bg-gray-50 flex items-center justify-center animate-pulse">Loading...</div>;
  if (!mockup) return <div className="h-screen flex items-center justify-center text-gray-500">Mockup not found</div>;

  return (
    <div className="w-screen h-screen bg-transparent flex items-center justify-center p-0">
      <div 
        className="relative h-full w-full max-w-lg mx-auto flex items-center justify-center animate-in zoom-in-95 duration-500 max-h-[90vh]"
      >
        {/* Apple iPhone 15 Pro Style Frame */}
        <div 
          className="relative shadow-2xl rounded-[48px] overflow-hidden border-[12px] border-slate-900 bg-black h-full shrink-0"
          style={{ aspectRatio: '9/19.5', height: '100%', width: 'auto' }}
        >
          {/* Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-800/50 ml-auto mr-4" />
          </div>

          <div className="w-full h-full relative">
            <ChatInterface
              flow={mockup.flow}
              theme={mockup.theme}
              assets={mockup.assets}
              channel={mockup.channel}
              liveMode={true}
              systemPrompt={mockup.prompt}
              startsOpen={true}
              personalization={personalization}
              trackingParams={trackingParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
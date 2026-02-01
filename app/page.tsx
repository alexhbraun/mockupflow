'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { collection, query, where, getDocs, orderBy, getAggregateFromServer, sum, average, count } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mockup } from '@/lib/types';
import { Link } from '@/components/Link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, BarChart2, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  console.log('Dashboard component rendered');
  const { user, loading: authLoading } = useAuth();
  console.log('Auth state:', { user: user?.email, authLoading });
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, completionRate: 0, avgTime: 0 });

  useEffect(() => {
    console.log('Dashboard useEffect triggered', { user: user?.email, authLoading });
    async function fetchData() {
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('Auth still loading, returning early');
        return;
      }
      
      // If no user, stop loading (AppLayout will handle redirect)
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch mockups
        // Note: If orderBy fails due to missing index, try without it
        let q;
        try {
          q = query(collection(db, 'mockups'), where('ownerId', '==', user.uid), orderBy('updatedAt', 'desc'));
        } catch (indexError) {
          // Fallback to query without orderBy if index doesn't exist
          console.warn('Firestore index missing, using query without orderBy:', indexError);
          q = query(collection(db, 'mockups'), where('ownerId', '==', user.uid));
        }
        const snapshot = await getDocs(q);
        const fetchedMockups = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Mockup[];
        // Sort client-side if orderBy wasn't used
        fetchedMockups.sort((a, b) => {
          const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
          const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setMockups(fetchedMockups);

        // Simple client-side aggregation for MVP
        setStats({
          totalSessions: 0, 
          completionRate: 0,
          avgTime: 0
        });
      } catch (error) {
        console.error('Error fetching mockups:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading]);

  console.log('Dashboard render - loading state:', { authLoading, loading });
  if (authLoading || loading) {
    console.log('Rendering loading state');
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }
  console.log('Rendering dashboard content');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Mockups</h1>
        <Link href="/app/mockups/new">
          <Button><Plus size={18} /> New Mockup</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600"><MessageSquare size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Total Mockups</p>
            <p className="text-2xl font-bold">{mockups.length}</p>
          </div>
        </Card>
      </div>

      {mockups.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any mockups yet.</p>
          <Link href="/app/mockups/new">
            <Button variant="outline">Create your first mockup</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map(mockup => (
            <Link key={mockup.id} href={`/app/mockups/${mockup.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden relative border border-gray-200">
                  {mockup.assets.backgroundUrl ? (
                    <img src={mockup.assets.backgroundUrl} className="w-full h-full object-cover opacity-80" alt="bg" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Preview</div>
                  )}
                  <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-bold ${mockup.channel === 'WEB' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {mockup.channel}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 truncate">{mockup.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-grow">{mockup.description || 'No description'}</p>
                <div className="mt-4 text-xs text-gray-400 flex justify-between">
                  <span>{mockup.flow?.length || 0} steps</span>
                  <span>Updated {mockup.updatedAt?.toDate().toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
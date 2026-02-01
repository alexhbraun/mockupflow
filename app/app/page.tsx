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
  const { user, loading: authLoading } = useAuth();
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, completionRate: 0, avgTime: 0 });

  useEffect(() => {
    async function fetchData() {
      const uid = 'public-user';
      console.log('Fetching mockups for public user');

      if (!db) {
        console.error('Firestore db is not initialized');
        setLoading(false);
        return;
      }

      const totalTimeout = 8000;
      const timeoutId = setTimeout(() => { }, totalTimeout); // Dummy id for cleanup

      try {
        const fetchMockups = async () => {
          let snapshot;
          try {
            // Try ordered query
            const q = query(collection(db, 'mockups'), where('ownerId', '==', uid), orderBy('updatedAt', 'desc'));
            const fetchPromise = getDocs(q);
            const tPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
            snapshot = await Promise.race([fetchPromise, tPromise]) as any;
          } catch (err) {
            console.warn('Primary query failed, using simple fallback:', err);
            // Fallback to simple query
            const q = query(collection(db, 'mockups'), where('ownerId', '==', uid));
            const fetchPromise = getDocs(q);
            const tPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
            snapshot = await Promise.race([fetchPromise, tPromise]) as any;
          }
          return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })) as Mockup[];
        };

        const fetchedMockups = await Promise.race([
          fetchMockups(),
          new Promise<Mockup[]>((_, reject) => setTimeout(() => reject(new Error('global-timeout')), totalTimeout))
        ]);

        // Sort client-side for consistent UI
        fetchedMockups.sort((a, b) => {
          const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
          const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
          return bTime - aTime;
        });

        console.log('Fetched mockups:', fetchedMockups.length);
        setMockups(fetchedMockups);
      } catch (error) {
        console.error('Dashboard fetch error or timeout:', error);
        setMockups([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your conversion mockups.</p>
        </div>
        <Link href="/app/mockups/new">
          <Button size="lg" className="shadow-lg shadow-indigo-200">
            <Plus size={18} /> Create Mockup
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-2 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Mockups</p>
            <MessageSquare size={16} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockups.length}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Experiments</p>
            <BarChart2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Views (24h)</p>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
            <CheckCircle size={16} className="text-blue-500" />
          </div>
          <p className="text-lg font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md self-start mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Operational
          </p>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
          <Link href="/app/mockups/new" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
        </div>

        {mockups.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
              <Plus className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Start your first journey</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 mb-6">Create a high-converting chat mockup in minutes and start testing your flows.</p>
            <Link href="/app/mockups/new">
              <Button variant="outline" size="lg" className="px-10">Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockups.map(mockup => (
              <Link key={mockup.id} href={`/app/mockups/${mockup.id}`}>
                <Card className="group p-0 overflow-hidden border-gray-200/60 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div className="h-48 bg-slate-50 relative overflow-hidden">
                    {mockup.assets.backgroundUrl ? (
                      <img src={mockup.assets.backgroundUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="bg" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                        <MessageSquare size={48} className="opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${mockup.channel === 'WEB'
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-emerald-500 text-white border-emerald-400'
                        }`}>
                        {mockup.channel}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{mockup.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2 flex-grow leading-relaxed">
                      {mockup.description || 'No description provided for this mockup.'}
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        <span>{mockup.flow?.length || 0} stages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>
                          {mockup.updatedAt?.toDate
                            ? new Date(mockup.updatedAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : mockup.updatedAt?.seconds
                              ? new Date(mockup.updatedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
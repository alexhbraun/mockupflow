import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // Query for mockup with matching idid
    const q = query(
      collection(db, 'mockups'),
      where('idid', '==', slug),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return NextResponse.json({ error: 'Mockup not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const mockup = { id: doc.id, ...doc.data() };

    return NextResponse.json(mockup);
  } catch (error: any) {
    console.error('Slug resolution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

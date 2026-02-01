import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: Request, { params }: { params: { shareId: string } }) {
  const { shareId } = params;

  try {
    const q = await adminDb.collection('mockups').where('shareId', '==', shareId).limit(1).get();
    
    if (q.empty) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const doc = q.docs[0];
    const data = doc.data();

    // Sanitize - remove ownerId, etc if needed. Sending mostly everything for rendering.
    return NextResponse.json({
      id: doc.id,
      name: data.name,
      channel: data.channel,
      theme: data.theme,
      assets: data.assets,
      flow: data.flow
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

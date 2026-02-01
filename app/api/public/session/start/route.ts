import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const { mockupId, shareId } = await req.json();
    
    const ref = await adminDb.collection('sessions').add({
      mockupId,
      shareId,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      currentStepIndex: 0,
      captured: {},
      durationSeconds: 0
    });

    return NextResponse.json({ sessionId: ref.id });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const { sessionId, stepIndex, data, isComplete } = await req.json();
    
    const updateData: any = {
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      currentStepIndex: stepIndex,
    };

    if (data) {
      // Merge captured data
      const key = `captured.${Object.keys(data)[0]}`;
      updateData[key] = Object.values(data)[0];
    }

    if (isComplete) {
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await adminDb.collection('sessions').doc(sessionId).update(updateData);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

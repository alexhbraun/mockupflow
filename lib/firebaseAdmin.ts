import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('Firebase Admin: Missing environment variables, skipping initialization.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

const adminDb = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
export { adminDb };

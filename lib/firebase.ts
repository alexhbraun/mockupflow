import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const getEnv = (key: string) => {
  try {
    // Check if process.env exists (Node/Next.js) or if injected by window.process
    return process.env[key];
  } catch (e) {
    return undefined;
  }
};

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY') || 'mock-api-key',
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || 'mock.firebaseapp.com',
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'mock-project',
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || 'mock.appspot.com',
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || '00000000',
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID') || '1:00000000:web:00000000'
};

// Initialize Firebase (Singleton)
console.log('--- Firebase Initialization Diagnostics ---');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key starts with:', firebaseConfig.apiKey?.substring(0, 5) + '...');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('-------------------------------------------');

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Initialize with undefined so components can check
}

export { app, auth, db, storage };
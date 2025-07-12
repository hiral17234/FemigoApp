
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type Storage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This is a check to ensure that all required environment variables are present.
// If any are missing, we can provide a clear error message.
const requiredKeys = Object.values(firebaseConfig);
const missingKey = requiredKeys.some(value => !value || (typeof value === 'string' && value.includes('YOUR_')));

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: Storage;
let firebaseError: string | null = null;


if (missingKey) {
    firebaseError = "One or more Firebase environment variables are missing. Please check your .env file.";
    console.error(firebaseError);
    // Assign empty objects to prevent crashes, but functionality will be disabled.
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as Storage;
} else {
    // Initialize Firebase only if the app hasn't been initialized yet.
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
}

export { app, auth, db, storage, firebaseError };


import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  error: null;
}

interface FirebaseError {
  error: string;
  app: null;
  auth: null;
  db: null;
}

let firebaseServices: FirebaseServices | FirebaseError | null = null;

function getFirebaseServices(): FirebaseServices | FirebaseError {
  if (firebaseServices) {
    return firebaseServices;
  }

  const isConfigValid = firebaseConfig.apiKey &&
                        typeof firebaseConfig.apiKey === 'string' &&
                        !firebaseConfig.apiKey.includes('YOUR_');

  if (!isConfigValid) {
    const errorMessage = "Firebase configuration is missing or incomplete. Please check your .env file and restart the server.";
    console.error(errorMessage);
    firebaseServices = { 
        error: errorMessage,
        app: null,
        auth: null,
        db: null,
    };
    return firebaseServices;
  }

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    firebaseServices = { app, auth, db, error: null };
    return firebaseServices;
  } catch (e: any) {
     const errorMessage = `Firebase initialization failed: ${e.message}. Please verify your credentials in the .env file.`;
     console.error(errorMessage, e);
     firebaseServices = {
        error: errorMessage,
        app: null,
        auth: null,
        db: null,
     };
     return firebaseServices;
  }
}

export { getFirebaseServices };

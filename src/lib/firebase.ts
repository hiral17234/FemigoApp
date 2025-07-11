
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const keyMapping = {
    apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
    authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    appId: "NEXT_PUBLIC_FIREBASE_APP_ID"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseError: string | null = null;

try {
    const missingOrInvalidKeys: string[] = [];
    for (const [key, value] of Object.entries(firebaseConfig)) {
        if (!value || typeof value !== 'string' || value.includes('YOUR_')) {
            missingOrInvalidKeys.push(keyMapping[key as keyof typeof keyMapping]);
        }
    }

    if (missingOrInvalidKeys.length > 0) {
        throw new Error(missingOrInvalidKeys.join(", "));
    }

    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

} catch (error: any) {
    const errorIntro = "Firebase configuration failed. The following required variable(s) are missing or invalid in your .env file:";
    firebaseError = `${errorIntro}\n\n- ${error.message}`;
    console.error(firebaseError);
    // Provide dummy objects to prevent the app from crashing where auth/db is used.
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
}

export { app, auth, db, firebaseError };

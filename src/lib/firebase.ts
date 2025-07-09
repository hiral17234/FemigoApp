
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Check for missing configuration and display a user-friendly message
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || firebaseConfig.apiKey.startsWith('YOUR_')) {
    if (typeof window !== 'undefined') {
        // This stops the app and shows a clear error message instead of a generic crash.
        document.body.innerHTML = `
            <div style="font-family: sans-serif; padding: 2rem; text-align: center; background-color: #06010F; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
                <h1 style="color: #EC008C; font-size: 2rem; margin-bottom: 1rem;">Firebase Configuration Error</h1>
                <p style="font-size: 1.2rem; max-width: 600px; line-height: 1.6;">
                    Your Firebase API Key or Project ID is missing or incorrect.
                </p>
                <p style="margin-top: 1.5rem; font-size: 1rem;">
                    Please copy the necessary keys from your <strong>Firebase project settings</strong> into the
                    <code style="background-color: #333; padding: 0.2em 0.5em; border-radius: 4px; font-family: monospace; margin: 0 4px;">.env</code>
                    file in your project's root directory and then <strong>restart the development server</strong>.
                </p>
            </div>
        `;
    }
} else {
    // Initialize Firebase ONLY if the configuration is valid
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
}


export { app, auth, db };

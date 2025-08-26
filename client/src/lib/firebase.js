import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

/**
 * Firebase configuration object loaded from environment variables.
 *
 * Contains all necessary Firebase project settings for authentication,
 * Firestore database, and cloud functions.
 *
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase app instance initialized with project configuration.
 *
 * @type {import('firebase/app').FirebaseApp}
 */
export const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance for user management.
 *
 * Handles user sign-in, sign-out, and authentication state management.
 *
 * @type {import('firebase/auth').Auth}
 */
export const auth = getAuth(app);

/**
 * Firestore database instance for data storage and retrieval.
 *
 * Used for storing user subscriptions, checkout sessions, and payment configuration.
 *
 * @type {import('firebase/firestore').Firestore}
 */
export const db = getFirestore(app);

/**
 * Firebase Cloud Functions instance for server-side operations.
 *
 * Handles Stripe payment processing and billing portal creation.
 *
 * @type {import('firebase/functions').Functions}
 */
export const functions = getFunctions(app, 'us-central1');

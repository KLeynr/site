
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes the Firebase app and its services (Firestore and Auth).
 * Uses the custom config provided for 'dopacheckai'.
 */
export function initializeFirebase() {
  const firebaseApp: FirebaseApp = getApps().length === 0 
    ? initializeApp(firebaseConfig) 
    : getApp();
  
  const firestore: Firestore = getFirestore(firebaseApp);
  const auth: Auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';

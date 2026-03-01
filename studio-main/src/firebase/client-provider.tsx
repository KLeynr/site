
'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { signInAnonymously } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // Firebase'i sadece bir kez initialize et
  const { firebaseApp, firestore, auth } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    // Arka planda anonim giriş yapmayı dene. 
    // Eğer Firebase Console'da Anonymous Auth kapalıysa bu hata verebilir ama uygulamayı durdurmaz.
    signInAnonymously(auth).catch((err) => {
      console.warn("Firebase Anonim Giriş Hatası (Muhtemelen Console'dan kapalı):", err.message);
    });
  }, [auth]);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}

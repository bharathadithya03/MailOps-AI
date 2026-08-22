'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsFirebaseLive(configured);

    if (configured && auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            let userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: 'Admin',
            };

            if (db) {
              try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                  userData = { ...userData, ...userDoc.data() };
                }
              } catch (e) {
                console.warn('Could not read user profile from Firestore:', e);
              }
            }

            setUser(userData);
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.warn('Firebase onAuthStateChanged error:', err);
      }
    }

    // Local / fallback auth check
    try {
      const stored = localStorage.getItem('mailops_current_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage auth read error:', e);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (isFirebaseConfigured() && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        let userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || email.split('@')[0] || 'User',
          role: 'Admin',
        };

        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) {
              userData = { ...userData, ...userDoc.data() };
            }
          } catch (e) {
            console.warn('Firestore user fetch notice:', e);
          }
        }

        setUser(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mailops_current_user', JSON.stringify(userData));
        }
        return userData;
      } catch (error) {
        console.error('Firebase login error:', error);
        throw error;
      }
    } else {
      // Fallback local auth simulation
      const usersStr = typeof window !== 'undefined' ? localStorage.getItem('mailops_users') : null;
      const users = usersStr ? JSON.parse(usersStr) : [];
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (matched && matched.password === password) {
        const userData = {
          uid: matched.uid || `local-${Date.now()}`,
          email: matched.email,
          displayName: matched.displayName || matched.name || email.split('@')[0],
          role: 'Admin',
        };
        setUser(userData);
        localStorage.setItem('mailops_current_user', JSON.stringify(userData));
        return userData;
      } else if (!matched) {
        // Automatically allow demo login if user created on the fly
        const userData = {
          uid: `demo-${Date.now()}`,
          email,
          displayName: email.split('@')[0] || 'Admin User',
          role: 'Admin',
        };
        setUser(userData);
        localStorage.setItem('mailops_current_user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Invalid email or password');
      }
    }
  };

  const signup = async (email, password, name) => {
    if (isFirebaseConfigured() && auth) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await updateProfile(result.user, { displayName: name });
        } catch (e) {
          console.warn('Profile update notice:', e);
        }

        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: name || email.split('@')[0],
          createdAt: new Date().toISOString(),
          role: 'Admin',
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', result.user.uid), userData);
          } catch (e) {
            console.warn('Firestore setDoc notice (ensure Firestore rules allow write):', e);
          }
        }

        setUser(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mailops_current_user', JSON.stringify(userData));
        }
        return userData;
      } catch (error) {
        console.error('Firebase signup error:', error);
        throw error;
      }
    } else {
      // Fallback local auth simulation
      const usersStr = typeof window !== 'undefined' ? localStorage.getItem('mailops_users') : null;
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        const error = new Error('An account with this email already exists.');
        error.code = 'auth/email-already-in-use';
        throw error;
      }

      const newUser = {
        uid: `usr_${Date.now()}`,
        email,
        password,
        displayName: name,
        createdAt: new Date().toISOString(),
        role: 'Admin',
      };

      users.push(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mailops_users', JSON.stringify(users));
        localStorage.setItem('mailops_current_user', JSON.stringify(newUser));
      }

      setUser(newUser);
      return newUser;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mailops_current_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isFirebaseLive }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

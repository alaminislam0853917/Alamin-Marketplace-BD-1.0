import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { ref, onValue, set, update } from 'firebase/database';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, phone: string, email: string, pass: string, address?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: { name: string; phone: string; address: string }) => Promise<void>;
  authErrorMap: (error: any) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Translate Firebase Auth errors to clear Bengali messages
  const authErrorMap = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'এই ইমেইলটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করুন।';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়! দয়া করে আবার চেক করুন।';
      case 'auth/user-not-found':
        return 'এই ইমেইলের কোনো অ্যাকাউন্ট পাওয়া যায়নি। নতুন অ্যাকাউন্ট তৈরি করুন।';
      case 'auth/invalid-email':
        return 'দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন।';
      case 'auth/weak-password':
        return 'পাসওয়ার্ডটি অত্যন্ত দুর্বল। অন্তত ৬টি অক্ষরের পাসওয়ার্ড দিন।';
      case 'auth/too-many-requests':
        return 'অনেকবার ভুল চেষ্টা করা হয়েছে। নিরাপত্তার জন্য কিছুক্ষণ পর চেষ্টা করুন।';
      case 'auth/network-request-failed':
        return 'ইন্টারনেট সংযোগে সমস্যা দেখা দিয়েছে। সংযোগ চেক করে পুনরায় চেষ্টা করুন।';
      default:
        return error?.message || 'একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।';
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Listen to user profile in Realtime Database: users/{uid}
        const userRef = ref(db, `users/${user.uid}`);
        unsubscribeProfile = onValue(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setUserProfile({
                name: data.name || user.displayName || 'সম্মানিত গ্রাহক',
                phone: data.phone || '',
                address: data.address || '',
                points: Number(data.points) || 0
              });
            } else {
              // Node doesn't exist yet, construct from auth
              setUserProfile({
                name: user.displayName || 'সম্মানিত গ্রাহক',
                phone: '',
                address: '',
                points: 0
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user profile:', error);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Login handler
  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  // Register handler - STRICTLY follows requirement:
  // "রেজিস্ট্রেশনের সময় users/{uid} নোডে { name, phone, address, points: 0 } সেভ করবে"
  const register = async (name: string, phone: string, email: string, pass: string, address = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = userCredential.user;

    // Update display name in Firebase Auth
    try {
      await updateAuthProfile(user, { displayName: name });
    } catch (err) {
      console.warn('Could not update display name in Auth:', err);
    }

    // Save profile to users/{uid}
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      points: 0
    });
  };

  // Customer profile update - Only updates name, phone, address (cannot touch points!)
  const updateCustomerProfile = async (data: { name: string; phone: string; address: string }) => {
    if (!currentUser) throw new Error('ইউজার লগইন অবস্থায় নেই');

    const userRef = ref(db, `users/${currentUser.uid}`);
    await update(userRef, {
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim()
    });

    // Also update auth displayName
    try {
      await updateAuthProfile(currentUser, { displayName: data.name.trim() });
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        register,
        logout,
        updateCustomerProfile,
        authErrorMap
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

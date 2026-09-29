import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Member } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  currentMember: Member | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateMemberProfile: (updates: Partial<Member>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'sacert_auth_session_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const syncCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user && user.memberId) {
      const member = db.getMemberByMemberId(user.memberId);
      setCurrentMember(member || null);
    } else {
      setCurrentMember(null);
    }
  };

  useEffect(() => {
    // Clear any persistent auto-login in localStorage so browsing the link always starts at the login page
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      // ignore
    }

    // Check active tab's sessionStorage
    try {
      const savedUserId = sessionStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId) {
        const user = db.getUserById(savedUserId);
        if (user && user.accountStatus !== 'DISABLED') {
          syncCurrentUser(user);
        } else {
          sessionStorage.removeItem(CURRENT_USER_KEY);
          syncCurrentUser(null);
        }
      } else {
        // Never auto-login; always land directly on login screen
        syncCurrentUser(null);
      }
    } catch (e) {
      syncCurrentUser(null);
    }

    const unsubscribe = db.subscribe(() => {
      try {
        const currentId = sessionStorage.getItem(CURRENT_USER_KEY);
        if (currentId) {
          const u = db.getUserById(currentId);
          if (u) {
            syncCurrentUser(u);
          }
        }
      } catch (e) {
        // ignore
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = db.authenticate(username, password);
    if (res.success && res.user) {
      try {
        sessionStorage.setItem(CURRENT_USER_KEY, res.user.id);
      } catch (e) {
        // ignore
      }
      syncCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setCurrentMember(null);
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    db.resetUserPassword(currentUser.id, newPassword, currentUser.fullName, false);
    const updated = db.getUserById(currentUser.id);
    if (updated) {
      syncCurrentUser(updated);
    }
    return { success: true };
  };

  const updateMemberProfile = async (updates: Partial<Member>): Promise<{ success: boolean; error?: string }> => {
    if (!currentMember || !currentUser) return { success: false, error: 'No member profile found' };

    // Member can only edit permitted personal fields
    const allowedKeys: (keyof Member)[] = [
      'contactNumber',
      'email',
      'emergencyContact',
      'emergencyContactNumber',
      'emergencyContactRelation',
      'address',
      'profilePhoto',
    ];

    const safeUpdates: Partial<Member> = {};
    for (const key of allowedKeys) {
      if (key in updates) {
        // @ts-expect-error dynamic key assignment
        safeUpdates[key] = updates[key];
      }
    }

    try {
      const updated = db.updateMember(currentMember.id, safeUpdates, currentUser.fullName);
      setCurrentMember(updated);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update profile' };
    }
  };

  const refreshUser = () => {
    if (currentUser) {
      const u = db.getUserById(currentUser.id);
      syncCurrentUser(u || null);
    }
  };

  const isAdmin = currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'SUPER_ADMIN';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentMember,
        isAuthenticated: !!currentUser,
        isAdmin: !!isAdmin,
        isSuperAdmin: !!isSuperAdmin,
        login,
        logout,
        changePassword,
        updateMemberProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

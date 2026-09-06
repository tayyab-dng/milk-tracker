import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';

const AuthContext = createContext(null);
const SESSION_KEY = 'milk_tracker_session';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session check
    (async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const user = session.user;
            const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
            setCurrentUser({ id: user.id, name, email: user.email });
            setIsLoading(false);
            return;
          }
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored && isMounted) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Session check error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    // 2. Auth State Change Listener
    let authListener = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const user = session.user;
          const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const userInfo = { id: user.id, name, email: user.email };
          setCurrentUser(userInfo);
          localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem(SESSION_KEY);
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      isMounted = false;
      if (authListener?.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Register
  const register = useCallback(async (name, email, password) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters for cloud security.' };
    }

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            data: { name: trimmedName }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const userInfo = { id: data.user.id, name: trimmedName, email: trimmedEmail };
          if (data.session) {
            setCurrentUser(userInfo);
            localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
            return { success: true, user: userInfo };
          }
          return {
            success: true,
            needsEmailConfirmation: true,
            message: 'Account created! Please check your email to confirm, then sign in.'
          };
        }
      }
      return { success: false, error: 'Authentication service unavailable.' };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              error: 'Please verify your email address before signing in (or disable "Confirm email" in Supabase Auth settings).'
            };
          }
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const name = data.user.user_metadata?.name || trimmedEmail.split('@')[0];
          const userInfo = { id: data.user.id, name, email: data.user.email };
          setCurrentUser(userInfo);
          localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
          return { success: true, user: userInfo };
        }
      }
      return { success: false, error: 'Authentication service unavailable.' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  // Update Profile Name
  const updateProfile = useCallback(async (newName) => {
    if (!currentUser) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length < 2) return;

    try {
      if (supabase) {
        await supabase.auth.updateUser({ data: { name: trimmed } });
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          name: trimmed,
          email: currentUser.email,
          updated_at: new Date().toISOString()
        });
      }
      const updated = { ...currentUser, name: trimmed };
      setCurrentUser(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Update profile error:', err);
    }
  }, [currentUser]);

  // Change Password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!currentUser) return { success: false, error: 'Not logged in.' };
    if (!currentPassword) {
      return { success: false, error: 'Please enter your current password.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    if (currentPassword === newPassword) {
      return { success: false, error: 'New password must be different from current password.' };
    }

    try {
      if (supabase) {
        // 1. Verify current password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: currentPassword
        });

        if (verifyError) {
          return {
            success: false,
            error: 'Current password is incorrect. Please try again.'
          };
        }

        // 2. Update to new password
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
      return { success: false, error: 'Auth service unavailable.' };
    } catch (err) {
      return { success: false, error: err.message || 'Password update failed.' };
    }
  }, [currentUser]);

  const value = {
    currentUser,
    isLoading,
    register,
    login,
    logout,
    changePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

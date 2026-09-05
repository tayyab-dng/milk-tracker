import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../../supabaseClient';
import { Storage, USERS_KEY, SESSION_KEY } from '../storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount & subscribe to Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    // 1. Initial session check from Supabase
    (async () => {
      try {
        if (supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const user = session.user;
            const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
            setCurrentUser({ id: user.id, name, email: user.email });
            await Storage.setJSON(SESSION_KEY, { userId: user.id, name, email: user.email });
            setIsLoading(false);
            return;
          }
        }

        // Fallback: check local storage session if Supabase had no active session or offline
        const localSession = await Storage.getJSON(SESSION_KEY, null);
        if (localSession?.userId && isMounted) {
          setCurrentUser({
            id: localSession.userId,
            name: localSession.name || 'User',
            email: localSession.email || ''
          });
        }
      } catch (err) {
        console.warn('Error restoring session:', err);
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
          await Storage.setJSON(SESSION_KEY, userInfo);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          await Storage.removeItem(SESSION_KEY);
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

  // Register with Supabase
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
            data: {
              name: trimmedName
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const userInfo = {
            id: data.user.id,
            name: trimmedName,
            email: trimmedEmail
          };

          // If session exists (email confirmation disabled or auto-confirmed)
          if (data.session) {
            setCurrentUser(userInfo);
            await Storage.setJSON(SESSION_KEY, userInfo);
            return { success: true };
          }

          // If email confirmation is required by Supabase project
          return {
            success: true,
            needsEmailConfirmation: true,
            message: 'Account created! Please check your email to confirm, or try logging in.'
          };
        }
      }

      return { success: false, error: 'Authentication service unavailable.' };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }, []);

  // Login with Supabase
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
          // Check for common error explanations
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
          const userInfo = {
            id: data.user.id,
            name: name,
            email: data.user.email
          };

          setCurrentUser(userInfo);
          await Storage.setJSON(SESSION_KEY, userInfo);
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
      await Storage.removeItem(SESSION_KEY);
      setCurrentUser(null);
    } catch (err) {
      console.warn('Logout error:', err);
      setCurrentUser(null);
    }
  }, []);

  // Update Profile Name
  const updateProfile = useCallback(async (name) => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          data: { name: trimmedName }
        });
        if (error) return { success: false, error: error.message };

        // Also update profiles table
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          name: trimmedName,
          email: currentUser.email,
          updated_at: new Date().toISOString()
        });
      }

      const updated = { ...currentUser, name: trimmedName };
      setCurrentUser(updated);
      await Storage.setJSON(SESSION_KEY, updated);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Update failed.' };
    }
  }, [currentUser]);

  // Change Password
  const changePassword = useCallback(async (newPassword) => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
      return { success: false, error: 'Supabase client unavailable.' };
    } catch (err) {
      return { success: false, error: err.message || 'Password change failed.' };
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      register,
      login,
      logout,
      updateProfile,
      changePassword
    }}>
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

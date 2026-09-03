import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Storage, USERS_KEY, SESSION_KEY } from '../storage';

const AuthContext = createContext(null);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Simple fast mobile hashing function
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const session = await Storage.getJSON(SESSION_KEY, null);
        if (session && session.userId) {
          const users = await Storage.getJSON(USERS_KEY, []);
          const user = users.find(u => u.id === session.userId);
          if (user && isMounted) {
            setCurrentUser({ id: user.id, name: user.name, email: user.email });
          } else {
            await Storage.removeItem(SESSION_KEY);
          }
        }
      } catch (err) {
        console.warn('Error restoring session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    try {
      const users = await Storage.getJSON(USERS_KEY, []);
      if (users.some(u => u.email === trimmedEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const passwordHash = hashPassword(password);
      const newUser = {
        id: generateId(),
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await Storage.setJSON(USERS_KEY, users);

      const session = { userId: newUser.id, loginTime: new Date().toISOString() };
      await Storage.setJSON(SESSION_KEY, session);

      setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const users = await Storage.getJSON(USERS_KEY, []);
      const user = users.find(u => u.email === trimmedEmail);

      if (!user) {
        return { success: false, error: 'No account found with this email.' };
      }

      const inputHash = hashPassword(password);
      if (user.passwordHash !== inputHash && user.password !== password) {
        return { success: false, error: 'Incorrect password.' };
      }

      const session = { userId: user.id, loginTime: new Date().toISOString() };
      await Storage.setJSON(SESSION_KEY, session);

      setCurrentUser({ id: user.id, name: user.name, email: user.email });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Storage.removeItem(SESSION_KEY);
      setCurrentUser(null);
    } catch (err) {
      console.warn('Logout error:', err);
    }
  }, []);

  const updateProfile = useCallback(async (name, email) => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const users = await Storage.getJSON(USERS_KEY, []);
      const otherUser = users.find(u => u.email === trimmedEmail && u.id !== currentUser.id);
      if (otherUser) {
        return { success: false, error: 'Email is already used by another account.' };
      }

      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, name: trimmedName, email: trimmedEmail };
        }
        return u;
      });

      await Storage.setJSON(USERS_KEY, updatedUsers);
      setCurrentUser(prev => ({ ...prev, name: trimmedName, email: trimmedEmail }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Update failed.' };
    }
  }, [currentUser]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }

    try {
      const users = await Storage.getJSON(USERS_KEY, []);
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        return { success: false, error: 'User not found.' };
      }

      const user = users[userIndex];
      const currentHash = hashPassword(currentPassword);
      if (user.passwordHash !== currentHash && user.password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      users[userIndex] = {
        ...user,
        passwordHash: hashPassword(newPassword)
      };

      await Storage.setJSON(USERS_KEY, users);
      return { success: true };
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

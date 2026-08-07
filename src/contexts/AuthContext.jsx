import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// localStorage keys for auth
const USERS_KEY = 'milk_tracker_users';
const SESSION_KEY = 'milk_tracker_session';

// Hash password using SHA-256 (Web Crypto API)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a simple unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Get all users from localStorage
function getStoredUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get stored session
function getStoredSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Save session
function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = getStoredSession();
    if (session && session.userId) {
      const users = getStoredUsers();
      const user = users.find(u => u.id === session.userId);
      if (user) {
        setCurrentUser({ id: user.id, name: user.name, email: user.email });
      } else {
        // Session references a non-existent user, clear it
        saveSession(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Register a new user
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

    const users = getStoredUsers();

    // Check for duplicate email
    if (users.some(u => u.email === trimmedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: generateId(),
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login
    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    setCurrentUser(sessionUser);
    saveSession({ userId: newUser.id });

    return { success: true, user: sessionUser };
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const users = getStoredUsers();
    const user = users.find(u => u.email === trimmedEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionUser = { id: user.id, name: user.name, email: user.email };
    setCurrentUser(sessionUser);
    saveSession({ userId: user.id });

    return { success: true, user: sessionUser };
  }, []);

  // Logout
  const logout = useCallback(() => {
    setCurrentUser(null);
    saveSession(null);
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!currentUser) {
      return { success: false, error: 'Not logged in.' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      return { success: false, error: 'User not found.' };
    }

    const currentHash = await hashPassword(currentPassword);
    if (users[userIndex].passwordHash !== currentHash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    users[userIndex].passwordHash = await hashPassword(newPassword);
    saveUsers(users);

    return { success: true };
  }, [currentUser]);

  // Update profile name
  const updateProfile = useCallback((newName) => {
    if (!currentUser) return;

    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName.length < 2) return;

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;

    users[userIndex].name = trimmedName;
    saveUsers(users);

    setCurrentUser(prev => ({ ...prev, name: trimmedName }));
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

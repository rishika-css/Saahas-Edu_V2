import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize user from localStorage on first load
  // so page refresh doesn't log the user out instantly
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Store JWT token separately so api.js can read it via getToken()
    if (token) localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clear token on logout
  };

  // Keep for backward compatibility with AuthGuard
  const getStoredUser = () => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getStoredUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

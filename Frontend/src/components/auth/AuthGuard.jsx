import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Navigate } from 'react-router-dom';

export const AuthGuard = ({ children }) => {
  const { login, logout } = useAuth();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'fail'

  useEffect(() => {
    const token = localStorage.getItem('token');

    // No token at all — send to login immediately
    if (!token) {
      setStatus('fail');
      return;
    }

    // Token exists — validate it with backend
    authAPI.getMe()
      .then((userData) => {
        // Refresh user data from backend in case profile changed
        login(userData, token);
        setStatus('ok');
      })
      .catch(() => {
        // Token is expired or invalid — clear everything
        logout();
        setStatus('fail');
      });
  }, []); // Run once on mount only

  // Still waiting for backend response
  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Token invalid or missing — redirect to login
  if (status === 'fail') {
    return <Navigate to="/login" replace />;
  }

  // All good — render the protected page
  return children;
};
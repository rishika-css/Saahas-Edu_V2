import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * GuestGuard — the inverse of AuthGuard.
 * If the user already has a valid token, redirect them to /home.
 * Otherwise, render children (e.g. LoginPage, LandingPage).
 */
export function GuestGuard({ children }) {
    const { token, loading } = useAuth();

    // Still hydrating from localStorage — don't flash anything
    if (loading) return null;

    // Already authenticated → go straight to home
    if (token) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

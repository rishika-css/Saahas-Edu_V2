import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BraillePage from "./pages/BraillePage";
import SignLanguagePage from "./pages/SignLanguagePage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import MentalHealthPage from "./pages/MentalHealthPage";
import JournalPage from "./pages/JournalPage";
import TestPage from "./pages/TestPage";
import CoursesPage from "./pages/CoursePage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import InclusiveLearnApp from "./components/game/Inclusivelearn";

// Auth + Layout
import { AuthGuard } from "./components/auth/AuthGuard";
import { GuestGuard } from "./components/auth/GuestGuard";
import AccessibilitySidebar from "./components/AccessibilitySidebar";

/* Wrap any page with the accessibility sidebar */
function AccessibleLayout({ children }) {
  return (
    <>
      {children}
      <AccessibilitySidebar />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public Routes (redirect to /home if already logged in) ── */}
            <Route
              path="/"
              element={
                <GuestGuard>
                  <AccessibleLayout>
                    <LandingPage />
                  </AccessibleLayout>
                </GuestGuard>
              }
            />
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <AccessibleLayout>
                    <LoginPage />
                  </AccessibleLayout>
                </GuestGuard>
              }
            />

            {/* ── Protected Routes ── */}
            <Route
              path="/home"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <HomePage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <StudentDashboardPage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/braille"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <BraillePage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/sign-language"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <SignLanguagePage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/mental-health"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <MentalHealthPage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/journal"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <JournalPage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/test"
              element={
                <AuthGuard>
                  <TestPage />
                </AuthGuard>
              }
            />
            <Route
              path="/courses"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <CoursesPage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/courses/:subject/:videoId"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <VideoPlayerPage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/games"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <InclusiveLearnApp />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

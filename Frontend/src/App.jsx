import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BraillePage from "./pages/BraillePage";
import SignLanguagePage from "./pages/SignLanguagePage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import MentalHealthPage from "./pages/MentalHealthPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import LandingPage from "./pages/LandingPage";
import TestPage from "./pages/TestPage";
import CoursesPage from "./pages/CoursePage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import InclusiveLearnApp from "./components/game/Inclusivelearn";
import AccessibilitySidebar from "./components/AccessibilitySidebar";

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
            <Route
              path="/"
              element={
                <AccessibleLayout>
                  <LandingPage />
                </AccessibleLayout>
              }
            />
            <Route path="/login" element={<AccessibleLayout>
              <LoginPage />
            </AccessibleLayout>} />{" "}
            {/* FIXED: was duplicate "/" */}
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
              path="/start-test"
              element={
                <AuthGuard>
                  <AccessibleLayout>
                    <TestPage />
                  </AccessibleLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/courses"
              element={
                <AuthGuard>
                  <CoursesPage />
                </AuthGuard>
              }
            />
            <Route
              path="/courses/:subject/:videoId"
              element={
                <AuthGuard>
                  <VideoPlayerPage />
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

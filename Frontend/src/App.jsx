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

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />

            {/* ── Protected Routes ── */}
            <Route path="/home" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><StudentDashboardPage /></AuthGuard>} />
            <Route path="/braille" element={<AuthGuard><BraillePage /></AuthGuard>} />
            <Route path="/sign-language" element={<AuthGuard><SignLanguagePage /></AuthGuard>} />
            <Route path="/mental-health" element={<AuthGuard><MentalHealthPage /></AuthGuard>} />
            <Route path="/journal" element={<AuthGuard><JournalPage /></AuthGuard>} />
            <Route path="/test" element={<AuthGuard><TestPage /></AuthGuard>} />
            <Route path="/courses" element={<AuthGuard><CoursesPage /></AuthGuard>} />
            <Route path="/courses/:subject/:videoId" element={<AuthGuard><VideoPlayerPage /></AuthGuard>} />
            <Route path="/games" element={<AuthGuard><InclusiveLearnApp /></AuthGuard>} />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Single global instance — persists across navigation, AI data never resets */}
          <AccessibilitySidebar />
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

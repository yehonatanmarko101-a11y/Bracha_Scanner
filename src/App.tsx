import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScanPage from "./pages/ScanPage";
import BrachotPage from "./pages/BrachotPage";
import AskRavPage from "./pages/AskRavPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import DisclaimerPage from "./pages/DisclaimerPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AuthPage from "./pages/AuthPage";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { ScanProvider } from "./contexts/ScanContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import AdminDashboard from "./components/AdminDashboard";
import { InstallNudge } from "./components/InstallNudge";

function AppContent() {
  const { hasAcceptedDisclaimer, language } = useSettings();
  const { user, loading } = useAuth();

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  if (!hasAcceptedDisclaimer) {
    return <DisclaimerPage />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ScanPage />} />
          <Route path="/brachot" element={<BrachotPage />} />
          <Route path="/ask" element={<AskRavPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
      <InstallNudge />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ScanProvider>
          <AppContent />
        </ScanProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

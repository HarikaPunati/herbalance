import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Diet } from "./pages/Diet";
import { Workout } from "./pages/Workout";
import { Grocery } from "./pages/Grocery";
import { Supplements } from "./pages/Supplements";
import { Profile } from "./pages/Profile";
import { Cycle } from "./pages/Cycle";
import { Login } from "./pages/Login";
import { ResetPassword } from "./pages/ResetPassword";
import { HealthDisclaimer, PrivacyPolicy } from "./pages/Legal";
import { RequireAuth } from "./lib/auth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/disclaimer" element={<HealthDisclaimer />} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/supplements" element={<Supplements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cycle" element={<Cycle />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

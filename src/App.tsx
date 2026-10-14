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

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<AppLayout />}>
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

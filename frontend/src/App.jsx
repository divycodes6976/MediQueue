import { Navigate, Route, Routes } from "react-router-dom";
import { ConditionalAppShell } from "@/components/layout/ConditionalAppShell";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DisplayPage from "@/pages/DisplayPage";
import DoctorPage from "@/pages/DoctorPage";
import ReceptionPage from "@/pages/ReceptionPage";
import TrackSearchPage from "@/pages/TrackSearchPage";
import TrackTokenPage from "@/pages/TrackTokenPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ConditionalAppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/display" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="/reception" element={<ReceptionPage />} />
        <Route path="/track" element={<TrackSearchPage />} />
        <Route path="/track/:token" element={<TrackTokenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ConditionalAppShell>
  );
}

import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import ComputersCheckin from "./pages/computersChekin/computersChekin";
import EnteredDevices from "./pages/enteredDevices/enteredDevices";
import MedicalDevicesCheckin from "./pages/medicalDeviceChekin/medicalDeviceChekin";
import BottomNav from "./components/BottomNav";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import DeviceDetail from "./pages/deviceDetail/deviceDetail";
import FrequentComputers from "./pages/frequentComputers/frequentComputers";
import DeviceEdit from "./pages/DeviceEdit/DeviceEdit";
import AuditPage from "./pages/Auditoria/AuditPage";
import TicketsPage from "./pages/tickets/TicketsPage";
import ForgotPassword from "./pages/auth/ForgotPassword";

// ✅ Layout con la barra inferior
function LayoutWithNav() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

// ✅ Ruta protegida básica (puedes mejorarla luego)
function ProtectedRoute() {
  // Ejemplo simple: leer un flag de localStorage
  const isAuthenticated = localStorage.getItem("loggedIn") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <LayoutWithNav />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir raíz a /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/computers/checkin" element={<ComputersCheckin />} />
          <Route path="/medical/checkin" element={<MedicalDevicesCheckin />} />
          <Route path="/devices/entered" element={<EnteredDevices />} />
          <Route path="/computers/frequent" element={<FrequentComputers />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
          <Route path="/devices/edit" element={<DeviceEdit />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

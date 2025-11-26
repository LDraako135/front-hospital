// src/App.tsx
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

// 🔹 nuevas páginas:
import ExternalCompanies from "./pages/externalCompanies/externalCompanies";
import EquipmentAuditsPage from "./pages/equipmentAudits/equipmentAudits";
import DeviceEditPage from "./pages/deviceEdit/deviceEdit";
import MyAuditPage from "./pages/auditMy/auditMy";
import DeletedUsersAuditPage from "./pages/auditDeletedUsers/auditDeletedUsers";



function LayoutWithNav() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Todo lo que lleva BottomNav */}
        <Route element={<LayoutWithNav />}>
          {/* Ingresos */}
          <Route path="/computers/checkin" element={<ComputersCheckin />} />
          <Route path="/medical/checkin" element={<MedicalDevicesCheckin />} />

          {/* Historial / dispositivos ingresados */}
          <Route path="/devices/entered" element={<EnteredDevices />} />

          {/* Computadores frecuentes (dashboard) */}
          <Route path="/computers/frequent" element={<FrequentComputers />} />

          {/* Detalle de dispositivo */}
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />

          {/* 🔹 EDITAR / ELIMINAR dispositivo */}
          <Route path="/devices/:deviceId/edit" element={<DeviceEditPage />} />

          {/* Empresas externas */}
          <Route path="/companies" element={<ExternalCompanies />} />

          {/* Auditorías / eliminaciones de un equipo */}
          <Route
            path="/equipment/:equipmentId/audits"
            element={<EquipmentAuditsPage />}
          />

          {/* 🔹 Auditorías de usuario */}
          <Route path="/audit/me" element={<MyAuditPage />} />
          <Route
            path="/audit/users/deleted"
            element={<DeletedUsersAuditPage />}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

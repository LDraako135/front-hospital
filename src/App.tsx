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
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<LayoutWithNav />}>
          <Route path="/computers/checkin" element={<ComputersCheckin />} />
          <Route path="/medical/checkin" element={<MedicalDevicesCheckin />} />
          <Route path="/devices/entered" element={<EnteredDevices />} />
          <Route path="/computers/frequent" element={<FrequentComputers />} />

          {/* Ruta corregida */}
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

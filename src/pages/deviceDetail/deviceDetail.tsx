import { useParams, useNavigate } from "react-router-dom";
import "../deviceDetail/deviceDetail.css";
const DeviceDetail = () => {
  const { deviceId } = useParams(); 
  const navigate = useNavigate(); 
  const device = {
    id: Number(deviceId),
    model: "Modelo1",
    provider: "Proveedor1",
    user: "Usuario1",
    entryTime: "10:00",
    exitTime: "12:00",
  };

  const handleExit = () => {
    alert(`Dispositivo ${device.model} ha salido.`); 
    navigate("/devices/entered"); 
  };

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <main className="md3-page">
      <section className="md3-card fd-card">
        <h1 className="fd-title">Detalles del Dispositivo</h1>

        <div className="device-card">
          <div className="device-card-img">
            <svg viewBox="0 0 400 220" className="device-svg">
              {/* Aquí va tu SVG */}
            </svg>
          </div>

          <div className="device-card-info">
            <div className="device-info-row">
              <span className="device-label">Modelo:</span>
              <span className="device-value">{device.model}</span>
            </div>
            <div className="device-info-row">
              <span className="device-label">Proveedor:</span>
              <span className="device-value">{device.provider}</span>
            </div>
            <div className="device-info-row">
              <span className="device-label">Nombre:</span>
              <span className="device-value">{device.user}</span>
            </div>
            <div className="device-info-row">
              <span className="device-label">Hora de entrada:</span>
              <span className="device-value">{device.entryTime}</span>
            </div>
            <div className="device-info-row">
              <span className="device-label">Hora de salida:</span>
              <span className="device-value">{device.exitTime}</span>
            </div>
          </div>

          <div className="device-info-row">
            <button className="dar-salida-btn" onClick={handleExit}>
              Dar salida
            </button>
            <button className="volver-btn" onClick={handleGoBack}>
              Volver
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DeviceDetail;

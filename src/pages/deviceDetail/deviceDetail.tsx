
import { useParams, useNavigate } from "react-router-dom";
import "../deviceDetail/deviceDetail.css";

const DeviceDetail = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  // Recuperar dispositivo guardado desde EnteredDevices
  const device = JSON.parse(
    sessionStorage.getItem("selectedDevice") || "null"
  );

  if (!device) {
    return (
      <main style={{ padding: 20 }}>
        <h2>No se encontró información del dispositivo.</h2>
        <button onClick={() => navigate(-1)}>Volver</button>
      </main>
    );
  }

  const handleExit = () => {
    alert(`Dispositivo ${device.model} ha salido.`);
    navigate("/devices/entered");
  };

  const handleGoBack = () => navigate(-1);

  return (
    <main className="md3-page">
      <section className="md3-card fd-card">
        <h1 className="fd-title">Detalles del Dispositivo</h1>

        <div className="device-card">
          <div className="device-card-img">
            {device.photoUrl ? (
              <img
                src={device.photoUrl}
                alt={device.model}
                className="device-detail-img"
              />
            ) : (
              <svg viewBox="0 0 400 220" className="device-svg"></svg>
            )}
          </div>

          <div className="device-card-info">
            <div className="device-info-row">
              <span className="device-label">Modelo:</span>
              <span className="device-value">{device.model}</span>
            </div>

            <div className="device-info-row">
              <span className="device-label">Proveedor:</span>
              <span className="device-value">{device.brand}</span>
            </div>

            <div className="device-info-row">
              <span className="device-label">Nombre:</span>
              <span className="device-value">{device.userName}</span>
            </div>

            <div className="device-info-row">
              <span className="device-label">Hora de entrada:</span>
              <span className="device-value">{device.entryTime}</span>
            </div>

            <div className="device-info-row">
              <span className="device-label">Hora de salida:</span>
              <span className="device-value">{device.exitTime}</span>
            </div>

            {device.serial && (
              <div className="device-info-row">
                <span className="device-label">Serial:</span>
                <span className="device-value">{device.serial}</span>
              </div>
            )}

            {device.color && (
              <div className="device-info-row">
                <span className="device-label">Color:</span>
                <span className="device-value">{device.color}</span>
              </div>
            )}
          </div>

          <div className="device-info-row btn-row">
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

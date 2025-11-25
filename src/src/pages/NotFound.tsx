import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1>😕 Ups...</h1>
        <h2>Esta página no existe</h2>
        <p>Parece que te perdiste.</p>

        <a href="/devices/entered" className="notfound-button">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

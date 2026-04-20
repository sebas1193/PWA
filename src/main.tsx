import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import LoginForm from "./components/Login";
import Dashboard from "./components/Dashboard";
import User from "./components/User";
interface Usuario {
  email: string;
  nombre: string;
  rol: string;
}

// loclstorage
const CLAVE_SESION = "medicare_usuario";

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // revisar si había una sesión guardada
  useEffect(() => {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION);
    if (sesionGuardada) {
      setUsuario(JSON.parse(sesionGuardada));
    }
  }, []);

  const handleLogin = (usuarioLogueado: Usuario) => {
    // Guardamos el usuario en localStorage para persistir la sesión
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuarioLogueado));
    setUsuario(usuarioLogueado);
  };

  const handleLogout = () => {
    localStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
  };

  return (
    <div>
      <header>
        <h1>MediCare+ Administración</h1>

        {/*si está logueado */}
        {usuario && (
          <User nombre={usuario.nombre} onLogout={handleLogout} />
        )}
      </header>

      <main>
        {/* sino est´a logueado entonces login*/}
        {usuario === null ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <Dashboard usuario={usuario} />
        )}
      </main>
    </div>
  );
}

//reigstro para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("Service Worker registrado correctamente"))
      .catch((err) => console.log("Error al registrar el Service Worker:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
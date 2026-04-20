import { useState } from "react";

//usuarios
const USUARIOS_FIJOS = 
[
  { email: "recepcion@medicare.com",
   password: "1234",
   nombre: "Ana López",
   rol: "recepcionista" },

  { email: "medico@medicare.com",
    password: "1234",
    nombre: "Dr. Carlos Ruiz",
    rol: "medico" },
];

interface Props {
  onLogin: (usuario: { email: string; nombre: string; rol: string }) => void;
}

function LoginForm({ onLogin }: Props) {
  //variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    //si existe
    const usuarioEncontrado = USUARIOS_FIJOS.find(
      (u) => u.email === email && u.password === password
    );

    if (!usuarioEncontrado) {
      // alerta error
      setError("Usuario o contraseña incorrectos");
      return;
    }

    // Si se encuentra
    setError("");
    onLogin({
      email: usuarioEncontrado.email,
      nombre: usuarioEncontrado.nombre,
      rol: usuarioEncontrado.rol,
    });
  };

  return (
    <div>
      <h2>Iniciar Sesión - MediCare+</h2>

      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>

      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}/>
      
      {error && <p>{error}</p>}

      <button onClick={handleSubmit}>Ingresar</button>

      <p>Usuarios de prueba:</p>
      <p>recepcion@medicare.com / 1234 (recepcionista)</p>
      <p>medico@medicare.com / 1234 (medico)</p>
    </div>
  );
}

export default LoginForm;
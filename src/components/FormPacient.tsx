import { useEffect, useState } from "react";

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
}

interface Props {
  pacienteAEditar: Paciente | null;
  onGuardar: (paciente: Paciente) => void;
}

function FormularioPaciente({ pacienteAEditar, onGuardar }: Props) {
  // Estado local para cada campo del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");

  // Estado para los errores de validación de cada campo
  const [errores, setErrores] = useState({
    nombre: "",
    apellido: "",
    dni: "",
  });

  useEffect(() => {
    if (pacienteAEditar) {
      setNombre(pacienteAEditar.nombre);
      setApellido(pacienteAEditar.apellido);
      setDni(pacienteAEditar.dni);
      setTelefono(pacienteAEditar.telefono);
    } else {
      setNombre("");
      setApellido("");
      setDni("");
      setTelefono("");
    }
    // Limpiamos errores al cambiar de modo
    setErrores({ nombre: "", apellido: "", dni: "" });
  }, [pacienteAEditar]);

  const validar = (): boolean => {
    // Objeto temporal para guardar los errores de esta validación
    const nuevosErrores = { nombre: "", apellido: "", dni: "" };
    let hayErrores = false;

    if (nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre es obligatorio";
      hayErrores = true;
    }

    if (apellido.trim() === "") {
      nuevosErrores.apellido = "El apellido es obligatorio";
      hayErrores = true;
    }

    if (dni.trim() === "") {
      nuevosErrores.dni = "El DNI es obligatorio";
      hayErrores = true;
    } else if (!/^\d{7,8}$/.test(dni.trim())) {
      // validación de 7 y 8 digitos en la cc
      nuevosErrores.dni = "El DNI debe tener 7 u 8 dígitos numéricos";
      hayErrores = true;
    }

    setErrores(nuevosErrores);
    return !hayErrores;
  };

  const handleGuardar = () => {
    // Si la validación falla, se mocha aquí
    if (!validar()) return;

    const paciente: Paciente = {
      // mantener el id o generar uno nuevo
      id: pacienteAEditar ? pacienteAEditar.id : Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
    };

    // Avisamos al componente padre que guarde este paciente
    onGuardar(paciente);
  };

  // titulo
  const titulo = pacienteAEditar ? "Editar Paciente" : "Agregar Paciente";

  return (
    <div>
      <h3>{titulo}</h3>

      <div>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {/* Mostramos el error del campo si existe */}
        {errores.nombre && <p>{errores.nombre}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
        {errores.apellido && <p>{errores.apellido}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="DNI (7 u 8 dígitos)"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
        {errores.dni && <p>{errores.dni}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Teléfono (opcional)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </div>

      <button onClick={handleGuardar}>
        {pacienteAEditar ? "Guardar cambios" : "Agregar paciente"}
      </button>
    </div>
  );
}

export default FormularioPaciente;

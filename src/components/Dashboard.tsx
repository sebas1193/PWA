import { useEffect, useState } from "react";
import FormularioPaciente from "./FormPacient";
import TablaPacientes from ".//TablePacients";

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
}

interface Usuario {
  email: string;
  nombre: string;
  rol: string;
}

interface Props {
  usuario: Usuario;
}

const CLAVE_PACIENTES = "medicare_pacientes";

function Dashboard({ usuario }: Props) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteAEditar, setPacienteAEditar] = useState<Paciente | null>(null);

  useEffect(() => {
    const pacientesGuardados = localStorage.getItem(CLAVE_PACIENTES);
    if (pacientesGuardados) {
      setPacientes(JSON.parse(pacientesGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CLAVE_PACIENTES, JSON.stringify(pacientes));
  }, [pacientes]);

  const handleGuardarPaciente = (paciente: Paciente) => {
    if (pacienteAEditar) {
      const actualizados = pacientes.map((p) =>
        p.id === paciente.id ? paciente : p
      );
      setPacientes(actualizados);
    } else {
      setPacientes([...pacientes, paciente]);
    }
    setPacienteAEditar(null);
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    setPacienteAEditar(paciente);
  };

  const handleEliminarPaciente = (id: number) => {
    const actualizados = pacientes.filter((p) => p.id !== id);
    setPacientes(actualizados);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>
        Bienvenido, {usuario.nombre} ({usuario.rol})
      </p>

      {usuario.rol === "medico" && (
        <div>
          <h3>Estadísticas</h3>
          <p>Total de pacientes registrados: {pacientes.length}</p>
        </div>
      )}

      {usuario.rol === "recepcionista" && (
        <FormularioPaciente
          pacienteAEditar={pacienteAEditar}
          onGuardar={handleGuardarPaciente}
        />
      )}

      <TablaPacientes
        pacientes={pacientes}
        onEditar={handleEditarPaciente}
        onEliminar={handleEliminarPaciente}
      />
    </div>
  );
}

export default Dashboard;
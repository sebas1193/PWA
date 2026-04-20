import { useState } from "react";

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
}

interface Props {
  pacientes: Paciente[];
  onEditar: (paciente: Paciente) => void;
  onEliminar: (id: number) => void;
}

function TablaPacientes({ pacientes, onEditar, onEliminar }: Props) {

  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const handleClickEliminar = (id: number) => {
    setIdAEliminar(id);
  };

  const handleConfirmarEliminar = () => {
    if (idAEliminar === null) return;
    onEliminar(idAEliminar);
    setIdAEliminar(null);
  };

  const handleCancelarEliminar = () => {
    setIdAEliminar(null);
  };

  const pacienteAEliminar = pacientes.find((p) => p.id === idAEliminar);

  return (
    <div>
      <h3>Lista de Pacientes</h3>

      {pacientes.length === 0 ? (
        <p>No hay pacientes registrados.</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>
                  {paciente.nombre} {paciente.apellido}
                </td>
                <td>{paciente.dni}</td>
                <td>{paciente.telefono || "-"}</td>
                <td>
                  {/* Editar */}
                  <button onClick={() => onEditar(paciente)}>Editar</button>
                  {/* Eliminar */}
                  <button onClick={() => handleClickEliminar(paciente.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {idAEliminar !== null && (
        <div>
          <p>
            ¿Estás seguro que querés eliminar a {pacienteAEliminar?.nombre}{" "}
            {pacienteAEliminar?.apellido}?
          </p>
          <button onClick={handleConfirmarEliminar}>Sí, eliminar</button>
          <button onClick={handleCancelarEliminar}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default TablaPacientes;
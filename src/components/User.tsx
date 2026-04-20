import { useRef, useState } from "react";

interface Props {
  nombre: string;
  onLogout: () => void;
}

function User({ nombre, onLogout }: Props) {
  // Estado para guardar la URL de la imagen que el usuario subió
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // useRef
  const inputFileRef = useRef<HTMLInputElement>(null);

  // split nombre
  const iniciales = nombre
    .split(" ")
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSeleccionarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Filereader
    const lector = new FileReader();
    lector.onload = () => {
      setAvatarUrl(lector.result as string);
    };
    lector.readAsDataURL(archivo);
  };

  return (
    <div>
      {/* Si hay avatar mostramos la imagen, si no mostramos las iniciales */}
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" width={50} height={50} style={{ borderRadius: "50%", objectFit: "cover" }} onClick={() => inputFileRef.current?.click()}/>
      ) : (
        <div
          onClick={() => inputFileRef.current?.click()}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#0C2340",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {iniciales}
        </div>
      )}

      <span> {nombre}</span>

      <input ref={inputFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSeleccionarImagen} />

      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}

export default User;
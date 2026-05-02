import { useState } from "react";

function AddContacts({ onAdd }: { onAdd: Function }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    onAdd({
      nombre: name,
      telefono: phone,
    });

    setName("");
    setPhone("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button type="submit">Add Contact</button>
    </form>
  );
}

export default AddContacts;
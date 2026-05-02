import { useState } from "react";
import ListContacts from "./Components/ListContacts";
import AddContacts from "./Components/AddContacts";

type Contact = {
  nombre: string;
  telefono: string;
};

function App() {
  const [contacts, setContacts] = useState<Contact[]>([
    { nombre: "Sebas", telefono: "1111111111" },
    { nombre: "Ana", telefono: "2222222222" },
  ]);

  //AddContact
  const addContact = (newContact: Contact) => {
    setContacts([...contacts, newContact]);
  };

  //DeleteContact
  const deleteContact = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  return (
    <>
      <AddContacts onAdd={addContact} />
      <ListContacts contacts={contacts} onDelete={deleteContact} />
    </>
  );
}

export default App;


type Contact = {
  nombre: string;
  telefono: string;
};

type Props = {
  contacts: Contact[];
  onDelete: (index: number) => void;
};

import DeleteContacts from "./DeleteContacts";

function ListContacts({ contacts, onDelete }: Props) {
  return (
    <div>
      <h2>Contacts</h2>
      <ul>
        {contacts.map((contact, index) => (
          <li key={index}>
            <strong>{contact.nombre}</strong> - {contact.telefono}
            
            <DeleteContacts onDelete={() => onDelete(index)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListContacts;
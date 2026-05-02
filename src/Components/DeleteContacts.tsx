type Props = {
  onDelete: () => void;
};

function DeleteContacts({ onDelete }: Props) {
  return <button onClick={onDelete}>❌ Delete</button>;
}

export default DeleteContacts;
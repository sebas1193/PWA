import { useState } from 'react';
import { IonItem, IonInput, IonButton } from '@ionic/react';

interface Props {
  onAdd: (title: string) => void;
}

const AddTaskForm: React.FC<Props> = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
  };

  return (
    <IonItem>
      <IonInput
        value={title}
        placeholder="New task..."
        onIonInput={e => setTitle(e.detail.value ?? '')}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
      />
      <IonButton slot="end" onClick={handleAdd} disabled={!title.trim()}>
        Add
      </IonButton>
    </IonItem>
  );
};

export default AddTaskForm;

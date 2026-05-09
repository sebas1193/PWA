import { IonItem, IonLabel, IonCheckbox, IonButton, IonIcon } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { Task } from '../types/task';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete }) => (
  <IonItem>
    <IonCheckbox
      slot="start"
      checked={task.completed}
      onIonChange={() => onToggle(task.id)}
    />
    <IonLabel style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1 }}>
      {task.title}
    </IonLabel>
    <IonButton fill="clear" slot="end" color="danger" onClick={() => onDelete(task.id)}>
      <IonIcon icon={trashOutline} />
    </IonButton>
  </IonItem>
);

export default TaskItem;

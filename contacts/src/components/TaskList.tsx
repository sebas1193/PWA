import { IonList, IonText } from '@ionic/react';
import { Task } from '../types/task';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onToggle, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <IonText color="medium">
        <p style={{ textAlign: 'center', marginTop: 40 }}>No tasks yet. Add one above!</p>
      </IonText>
    );
  }

  return (
    <IonList>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </IonList>
  );
};

export default TaskList;

import { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBadge } from '@ionic/react';
import { Task } from '../types/task';
import AddTaskForm from '../components/AddTaskForm';
import TaskList from '../components/TaskList';

const STORAGE_KEY = 'ionic_tasks';

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string) => {
    setTasks(prev => [...prev, { id: Date.now().toString(), title, completed: false }]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const pending = tasks.filter(t => !t.completed).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Task Manager{' '}
            {pending > 0 && <IonBadge color="primary">{pending}</IonBadge>}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <AddTaskForm onAdd={addTask} />
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
      </IonContent>
    </IonPage>
  );
};

export default Home;

import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotifPermission(): Promise<boolean> {
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export async function notify(title: string, body: string): Promise<void> {
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now() % 2147483647,
        title,
        body,
        schedule: { at: new Date(Date.now() + 500) },
      }],
    });
  } catch {
    // Notifications not available in this environment
  }
}

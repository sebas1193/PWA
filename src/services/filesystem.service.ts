import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import type { TrackingSession } from '../types/tracking.types';

const FILE = 'maps_sessions.json';

export async function loadSessions(): Promise<TrackingSession[]> {
  try {
    const res = await Filesystem.readFile({ path: FILE, directory: Directory.Documents, encoding: Encoding.UTF8 });
    return JSON.parse(res.data as string) as TrackingSession[];
  } catch {
    return [];
  }
}

export async function saveSession(session: TrackingSession): Promise<void> {
  const sessions = await loadSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session; else sessions.push(session);
  await Filesystem.writeFile({
    path: FILE,
    data: JSON.stringify(sessions),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = (await loadSessions()).filter(s => s.id !== id);
  await Filesystem.writeFile({
    path: FILE,
    data: JSON.stringify(sessions),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
}

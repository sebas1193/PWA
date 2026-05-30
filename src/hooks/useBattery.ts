import { useEffect, useRef, useState } from 'react';
import { Device } from '@capacitor/device';

export interface BatteryState {
  level: number;      // 0–1
  isCharging: boolean;
}

export function useBattery(pollMs = 30000): BatteryState {
  const [state, setState] = useState<BatteryState>({ level: 1, isCharging: false });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = () => Device.getBatteryInfo().then(b => setState({ level: b.batteryLevel ?? 1, isCharging: b.isCharging ?? false })).catch(() => {});

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, pollMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [pollMs]);

  return state;
}

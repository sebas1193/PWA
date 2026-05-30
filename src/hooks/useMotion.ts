import { useEffect, useRef, useState } from 'react';
import { Motion } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';
import { MOTION_STDDEV_THRESHOLD } from '../config';

const WINDOW = 15; // samples

export function useMotion() {
  const [isMoving, setIsMoving] = useState(false);
  const mags = useRef<number[]>([]);
  const handle = useRef<PluginListenerHandle | null>(null);

  useEffect(() => {
    Motion.addListener('accel', (e) => {
      const { x, y, z } = e.accelerationIncludingGravity;
      const mag = Math.sqrt(x * x + y * y + z * z);
      mags.current.push(mag);
      if (mags.current.length > WINDOW) mags.current.shift();
      if (mags.current.length === WINDOW) {
        const mean = mags.current.reduce((a, b) => a + b) / WINDOW;
        const stddev = Math.sqrt(mags.current.reduce((a, v) => a + (v - mean) ** 2, 0) / WINDOW);
        setIsMoving(stddev > MOTION_STDDEV_THRESHOLD);
      }
    }).then(h => { handle.current = h; }).catch(() => {});

    return () => { handle.current?.remove(); };
  }, []);

  return { isMoving };
}

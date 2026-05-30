import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

export interface NetworkState {
  connected: boolean;
  connectionType: string;
}

export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>({ connected: true, connectionType: 'unknown' });

  useEffect(() => {
    Network.getStatus().then(setState).catch(() => {});

    let handle: any;
    Network.addListener('networkStatusChange', (s) => setState(s)).then(h => { handle = h; });

    return () => { handle?.remove(); };
  }, []);

  return state;
}

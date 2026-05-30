import { useEffect, useState } from 'react'
import { Network } from '@capacitor/network'

export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Estado inicial
    Network.getStatus().then((status) => setIsOnline(status.connected))

    // Escucha cambios en tiempo real
    const handler = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected)
    })

    return () => {
      handler.then((h) => h.remove())
    }
  }, [])

  return { isOnline }
}

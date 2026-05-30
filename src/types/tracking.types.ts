export interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number; // m/s
}

export interface TrackingSession {
  id: string;
  date: string;          // YYYY-MM-DD
  startTime: number;
  endTime: number;
  points: TrackingPoint[];
  startAddress: string;
  totalDistance: number; // metres
  maxSpeed: number;      // m/s
}

export interface NearbyPlace {
  name: string;
  lat: number;
  lng: number;
  type: string;
  formatted: string;
}

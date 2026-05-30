// Replace with your OpenCage API key — free tier: 2500 requests/day
// Get one at https://opencagedata.com/
export const OPENCAGE_API_KEY = 'YOUR_OPENCAGE_API_KEY_HERE';

export const MOTION_STDDEV_THRESHOLD = 0.4;   // m/s² — above this = moving
export const LOW_BATTERY_THRESHOLD = 0.20;     // 20%
export const STILL_ALERT_MS = 5 * 60 * 1000;  // 5 minutes without movement
export const FAST_SPEED_MS = 12;               // 12 m/s ≈ 43 km/h
export const NEARBY_RESULTS = 8;

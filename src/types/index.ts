export interface Participant {
  id: string;
  name: string;
  color: string; // for grafer
}

export type TripStatus = 'planned' | 'completed';

export interface WeatherConditions {
  temperature?: number; // celsius
  snowCondition?: string; // e.g. "Pudder", "Islagt", "Slaps"
  visibility?: string; // e.g. "Klar", "Overskyet", "Tåke"
  windSpeed?: number; // m/s
  notes?: string;
}

export interface Trip {
  id: string;
  name: string; // fjellnavn / turens navn
  summit: string; // toppnavn
  altitude?: number; // moh
  date: string; // ISO date string
  status: TripStatus;

  // Metrikker
  distanceKm?: number;
  elevationGainM?: number;
  durationMinutes?: number;

  // Kart
  startLat?: number;
  startLng?: number;
  summitLat?: number;
  summitLng?: number;

  // Andre data
  weather?: WeatherConditions;
  participants: string[]; // Participant IDs
  notes?: string;
  imageUrls?: string[]; // base64 eller URL
}

export interface AppData {
  participants: Participant[];
  trips: Trip[];
}

export interface YearlyStats {
  year: number;
  participantId: string;
  totalDistanceKm: number;
  totalElevationGainM: number;
  tripCount: number;
  highestPeakM: number;
  totalDurationMinutes: number;
}

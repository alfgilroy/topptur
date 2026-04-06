import type { Trip, YearlyStats } from '../types';

export function computeYearlyStats(trips: Trip[]): YearlyStats[] {
  const completed = trips.filter((t) => t.status === 'completed');

  const map = new Map<string, YearlyStats>();

  for (const trip of completed) {
    const year = new Date(trip.date).getFullYear();
    for (const pid of trip.participants) {
      const key = `${year}-${pid}`;
      if (!map.has(key)) {
        map.set(key, {
          year,
          participantId: pid,
          totalDistanceKm: 0,
          totalElevationGainM: 0,
          tripCount: 0,
          highestPeakM: 0,
          totalDurationMinutes: 0,
        });
      }
      const s = map.get(key)!;
      s.tripCount += 1;
      s.totalDistanceKm += trip.distanceKm ?? 0;
      s.totalElevationGainM += trip.elevationGainM ?? 0;
      s.totalDurationMinutes += trip.durationMinutes ?? 0;
      if ((trip.altitude ?? 0) > s.highestPeakM) {
        s.highestPeakM = trip.altitude ?? 0;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.year - b.year || a.participantId.localeCompare(b.participantId));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}t` : `${h}t ${m}min`;
}

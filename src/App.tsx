import { useState } from 'react';
import Layout from './components/Layout';
import TripsPage from './pages/TripsPage';
import MapPage from './pages/MapPage';
import ReportPage from './pages/ReportPage';
import ParticipantsPage from './pages/ParticipantsPage';
import useLocalStorage from './hooks/useLocalStorage';
import type { Trip, Participant } from './types';

type Page = 'turer' | 'kart' | 'rapport' | 'deltagere';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('turer');
  const [trips, setTrips] = useLocalStorage<Trip[]>('topptur-trips', []);
  const [participants, setParticipants] = useLocalStorage<Participant[]>('topptur-participants', []);

  function handleAddTrip(trip: Trip) {
    setTrips(prev => [trip, ...prev]);
  }

  function handleUpdateTrip(updated: Trip) {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
  }

  function handleDeleteTrip(id: string) {
    setTrips(prev => prev.filter(t => t.id !== id));
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'turer' && (
        <TripsPage
          trips={trips}
          participants={participants}
          onAdd={handleAddTrip}
          onUpdate={handleUpdateTrip}
          onDelete={handleDeleteTrip}
        />
      )}
      {activePage === 'kart' && (
        <MapPage trips={trips} participants={participants} />
      )}
      {activePage === 'rapport' && (
        <ReportPage trips={trips} participants={participants} />
      )}
      {activePage === 'deltagere' && (
        <ParticipantsPage participants={participants} onChange={setParticipants} />
      )}
    </Layout>
  );
}

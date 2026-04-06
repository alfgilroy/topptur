import { useState } from 'react';
import { Plus, Mountain, Calendar, Ruler, TrendingUp, Clock, Pencil, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { Trip, Participant } from '../types';
import { formatDuration } from '../utils/stats';
import TripForm from '../components/TripForm';
import './TripsPage.css';

interface Props {
  trips: Trip[];
  participants: Participant[];
  onAdd: (trip: Trip) => void;
  onUpdate: (trip: Trip) => void;
  onDelete: (id: string) => void;
}

type Filter = 'all' | 'planned' | 'completed';

export default function TripsPage({ trips, participants, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | undefined>();
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = [...trips].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filter === 'all' ? sorted : sorted.filter(t => t.status === filter);

  function handleSave(trip: Trip) {
    if (editTrip) { onUpdate(trip); }
    else { onAdd(trip); }
    setShowForm(false);
    setEditTrip(undefined);
  }

  function handleEdit(trip: Trip) {
    setEditTrip(trip);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    onDelete(id);
    setConfirmDeleteId(null);
  }

  function participantName(id: string) {
    return participants.find(p => p.id === id)?.name ?? id;
  }
  function participantColor(id: string) {
    return participants.find(p => p.id === id)?.color ?? '#4a9eff';
  }

  return (
    <div className="trips-page">
      <div className="trips-header">
        <div>
          <h1>Turer</h1>
          <p className="text-secondary">{trips.length} tur{trips.length !== 1 ? 'er' : ''} totalt</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTrip(undefined); setShowForm(true); }}>
          <Plus size={16} /> Ny tur
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {(['all', 'planned', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            <Filter size={13} />
            {f === 'all' ? 'Alle' : f === 'planned' ? 'Planlagte' : 'Fullforte'}
            <span className="filter-count">
              {f === 'all' ? trips.length : trips.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Trip list */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <Mountain size={48} strokeWidth={1} className="text-muted" />
          <p style={{ marginTop: '1rem' }} className="text-muted">
            {filter === 'all' ? 'Ingen turer registrert ennå.' : `Ingen ${filter === 'planned' ? 'planlagte' : 'fullforte'} turer.`}
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Legg til din forste tur
          </button>
        </div>
      ) : (
        <div className="trip-list">
          {filtered.map(trip => {
            const isExpanded = expandedId === trip.id;
            return (
              <div key={trip.id} className={`trip-card card ${isExpanded ? 'trip-card--expanded' : ''}`}>
                {/* Header row */}
                <div className="trip-card-header" onClick={() => setExpandedId(isExpanded ? null : trip.id)}>
                  <div className="trip-card-left">
                    <div className="trip-summit-icon">
                      <Mountain size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="trip-name">{trip.name}</div>
                      <div className="trip-meta">
                        <span><Calendar size={11} /> {trip.date}</span>
                        {trip.altitude && <span><TrendingUp size={11} /> {trip.altitude} moh</span>}
                      </div>
                    </div>
                  </div>
                  <div className="trip-card-right">
                    <span className={`badge badge-${trip.status}`}>
                      {trip.status === 'planned' ? 'Planlagt' : 'Fullfort'}
                    </span>
                    <div className="trip-participant-avatars">
                      {trip.participants.slice(0, 4).map(pid => (
                        <div
                          key={pid}
                          className="mini-avatar"
                          style={{ background: participantColor(pid) }}
                          title={participantName(pid)}
                        >
                          {participantName(pid).charAt(0)}
                        </div>
                      ))}
                      {trip.participants.length > 4 && (
                        <div className="mini-avatar mini-avatar--overflow">+{trip.participants.length - 4}</div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="trip-card-details">
                    <hr className="divider" style={{ margin: '0 0 1rem 0' }} />

                    {/* Metrics */}
                    <div className="trip-metrics">
                      {trip.distanceKm !== undefined && (
                        <div className="metric-item">
                          <Ruler size={14} className="text-accent" />
                          <span>{trip.distanceKm} km</span>
                        </div>
                      )}
                      {trip.elevationGainM !== undefined && (
                        <div className="metric-item">
                          <TrendingUp size={14} className="text-accent" />
                          <span>{trip.elevationGainM} m↑</span>
                        </div>
                      )}
                      {trip.durationMinutes !== undefined && (
                        <div className="metric-item">
                          <Clock size={14} className="text-accent" />
                          <span>{formatDuration(trip.durationMinutes)}</span>
                        </div>
                      )}
                    </div>

                    {/* Weather */}
                    {trip.weather && Object.values(trip.weather).some(Boolean) && (
                      <div className="trip-weather">
                        {trip.weather.temperature !== undefined && <span>🌡 {trip.weather.temperature}°C</span>}
                        {trip.weather.windSpeed !== undefined && <span>💨 {trip.weather.windSpeed} m/s</span>}
                        {trip.weather.snowCondition && <span>❄ {trip.weather.snowCondition}</span>}
                        {trip.weather.visibility && <span>👁 {trip.weather.visibility}</span>}
                        {trip.weather.notes && <span className="text-muted">{trip.weather.notes}</span>}
                      </div>
                    )}

                    {/* Participants */}
                    {trip.participants.length > 0 && (
                      <div className="trip-participants">
                        {trip.participants.map(pid => (
                          <span key={pid} className="participant-chip">
                            <span className="ptoggle-avatar" style={{ background: participantColor(pid), width: 18, height: 18, fontSize: '0.65rem', display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', color:'#fff', fontWeight:700 }}>
                              {participantName(pid).charAt(0)}
                            </span>
                            {participantName(pid)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {trip.notes && <p className="trip-notes text-secondary">{trip.notes}</p>}

                    {/* Images */}
                    {(trip.imageUrls ?? []).length > 0 && (
                      <div className="trip-images">
                        {(trip.imageUrls ?? []).map((url, i) => (
                          <img key={i} src={url} alt={`Bilde ${i + 1}`} className="trip-image-thumb" />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="trip-actions">
                      <button className="btn btn-ghost" onClick={() => handleEdit(trip)}>
                        <Pencil size={14} /> Rediger
                      </button>
                      {confirmDeleteId === trip.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Sikker?</span>
                          <button className="btn btn-danger" onClick={() => handleDelete(trip.id)}>Slett</button>
                          <button className="btn btn-ghost" onClick={() => setConfirmDeleteId(null)}>Avbryt</button>
                        </div>
                      ) : (
                        <button className="btn btn-danger" onClick={() => setConfirmDeleteId(trip.id)}>
                          <Trash2 size={14} /> Slett
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <TripForm
          participants={participants}
          initialTrip={editTrip}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTrip(undefined); }}
        />
      )}
    </div>
  );
}

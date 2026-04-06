import { useState } from 'react';
import { X, Mountain, Calendar, Ruler, TrendingUp, Clock, Thermometer, Wind, Eye, MapPin, FileText, Camera } from 'lucide-react';
import type { Trip, Participant, TripStatus } from '../types';
import { generateId } from '../utils/stats';
import './TripForm.css';

interface Props {
  participants: Participant[];
  initialTrip?: Trip;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
}

const emptyTrip = (): Omit<Trip, 'id'> => ({
  name: '',
  summit: '',
  altitude: undefined,
  date: new Date().toISOString().slice(0, 10),
  status: 'planned',
  distanceKm: undefined,
  elevationGainM: undefined,
  durationMinutes: undefined,
  startLat: undefined,
  startLng: undefined,
  summitLat: undefined,
  summitLng: undefined,
  weather: {},
  participants: [],
  notes: '',
  imageUrls: [],
});

export default function TripForm({ participants, initialTrip, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Trip, 'id'>>(
    initialTrip ? { ...initialTrip } : emptyTrip()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof Omit<Trip, 'id'>>(key: K, value: Omit<Trip, 'id'>[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function toggleParticipant(id: string) {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(id)
        ? f.participants.filter(p => p !== id)
        : [...f.participants, id],
    }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({
          ...f,
          imageUrls: [...(f.imageUrls ?? []), ev.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setForm(f => ({ ...f, imageUrls: (f.imageUrls ?? []).filter((_, i) => i !== index) }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Turens navn er påkrevd';
    if (!form.summit.trim()) e.summit = 'Toppnavn er påkrevd';
    if (!form.date) e.date = 'Dato er påkrevd';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({ ...form, id: initialTrip?.id ?? generateId() } as Trip);
  }

  const numField = (val: number | undefined) => val === undefined ? '' : String(val);
  const parseNum = (s: string) => s === '' ? undefined : Number(s);

  return (
    <div className="trip-form-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="trip-form-modal card">
        <div className="form-modal-header">
          <h2>{initialTrip ? 'Rediger tur' : 'Ny tur'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="trip-form-body">
          {/* Grunninfo */}
          <section className="form-section">
            <div className="section-title"><Mountain size={15} /> Turinfo</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Turens navn *</label>
                <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="f.eks. Galdhøpiggen" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Toppnavn *</label>
                <input value={form.summit} onChange={e => setField('summit', e.target.value)} placeholder="f.eks. Galdhøpiggen" />
                {errors.summit && <span className="field-error">{errors.summit}</span>}
              </div>
              <div className="form-group">
                <label><Calendar size={12} /> Dato *</label>
                <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
                {errors.date && <span className="field-error">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value as TripStatus)}>
                  <option value="planned">Planlagt</option>
                  <option value="completed">Fullfort</option>
                </select>
              </div>
              <div className="form-group">
                <label><TrendingUp size={12} /> Høyde topp (moh)</label>
                <input type="number" value={numField(form.altitude)} onChange={e => setField('altitude', parseNum(e.target.value))} placeholder="2469" />
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Metrikker */}
          <section className="form-section">
            <div className="section-title"><Ruler size={15} /> Metrikker</div>
            <div className="form-grid">
              <div className="form-group">
                <label><Ruler size={12} /> Distanse (km)</label>
                <input type="number" step="0.1" value={numField(form.distanceKm)} onChange={e => setField('distanceKm', parseNum(e.target.value))} placeholder="12.5" />
              </div>
              <div className="form-group">
                <label><TrendingUp size={12} /> Høydemeter opp (m)</label>
                <input type="number" value={numField(form.elevationGainM)} onChange={e => setField('elevationGainM', parseNum(e.target.value))} placeholder="1450" />
              </div>
              <div className="form-group">
                <label><Clock size={12} /> Varighet (minutter)</label>
                <input type="number" value={numField(form.durationMinutes)} onChange={e => setField('durationMinutes', parseNum(e.target.value))} placeholder="360" />
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Kart */}
          <section className="form-section">
            <div className="section-title"><MapPin size={15} /> Koordinater</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Start — breddegrad</label>
                <input type="number" step="0.0001" value={numField(form.startLat)} onChange={e => setField('startLat', parseNum(e.target.value))} placeholder="61.6363" />
              </div>
              <div className="form-group">
                <label>Start — lengdegrad</label>
                <input type="number" step="0.0001" value={numField(form.startLng)} onChange={e => setField('startLng', parseNum(e.target.value))} placeholder="8.3120" />
              </div>
              <div className="form-group">
                <label>Topp — breddegrad</label>
                <input type="number" step="0.0001" value={numField(form.summitLat)} onChange={e => setField('summitLat', parseNum(e.target.value))} placeholder="61.6363" />
              </div>
              <div className="form-group">
                <label>Topp — lengdegrad</label>
                <input type="number" step="0.0001" value={numField(form.summitLng)} onChange={e => setField('summitLng', parseNum(e.target.value))} placeholder="8.3120" />
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Vær */}
          <section className="form-section">
            <div className="section-title"><Thermometer size={15} /> Vær og forhold</div>
            <div className="form-grid">
              <div className="form-group">
                <label><Thermometer size={12} /> Temperatur (°C)</label>
                <input type="number" value={form.weather?.temperature ?? ''} onChange={e => setField('weather', { ...form.weather, temperature: e.target.value ? Number(e.target.value) : undefined })} placeholder="-5" />
              </div>
              <div className="form-group">
                <label><Wind size={12} /> Vind (m/s)</label>
                <input type="number" step="0.5" value={form.weather?.windSpeed ?? ''} onChange={e => setField('weather', { ...form.weather, windSpeed: e.target.value ? Number(e.target.value) : undefined })} placeholder="3" />
              </div>
              <div className="form-group">
                <label>Snøforhold</label>
                <select value={form.weather?.snowCondition ?? ''} onChange={e => setField('weather', { ...form.weather, snowCondition: e.target.value || undefined })}>
                  <option value="">Velg...</option>
                  <option>Pudder</option>
                  <option>Pakket snø</option>
                  <option>Islagt</option>
                  <option>Slaps</option>
                  <option>Bart fjell</option>
                  <option>Vårsnø</option>
                </select>
              </div>
              <div className="form-group">
                <label><Eye size={12} /> Sikt</label>
                <select value={form.weather?.visibility ?? ''} onChange={e => setField('weather', { ...form.weather, visibility: e.target.value || undefined })}>
                  <option value="">Velg...</option>
                  <option>Klar</option>
                  <option>Lett skyet</option>
                  <option>Overskyet</option>
                  <option>Tåke</option>
                  <option>Snøvær</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Kommentar vær</label>
                <input value={form.weather?.notes ?? ''} onChange={e => setField('weather', { ...form.weather, notes: e.target.value || undefined })} placeholder="f.eks. Sterk vind på toppen" />
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Deltagere */}
          <section className="form-section">
            <div className="section-title"><Mountain size={15} /> Deltagere</div>
            {participants.length === 0 ? (
              <p className="text-muted">Ingen faste deltagere lagt til. Gå til Deltagere-siden.</p>
            ) : (
              <div className="participant-toggle-list">
                {participants.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`participant-toggle ${form.participants.includes(p.id) ? 'participant-toggle--selected' : ''}`}
                    style={{ '--p-color': p.color } as React.CSSProperties}
                    onClick={() => toggleParticipant(p.id)}
                  >
                    <span className="ptoggle-avatar" style={{ background: p.color }}>{p.name.charAt(0)}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          <hr className="divider" />

          {/* Notater */}
          <section className="form-section">
            <div className="section-title"><FileText size={15} /> Notater</div>
            <div className="form-group">
              <textarea value={form.notes ?? ''} onChange={e => setField('notes', e.target.value)} placeholder="Skriv dine tanker og opplevelser fra turen..." rows={4} />
            </div>
          </section>

          <hr className="divider" />

          {/* Bilder */}
          <section className="form-section">
            <div className="section-title"><Camera size={15} /> Bilder</div>
            <label className="image-upload-area">
              <Camera size={24} className="text-muted" />
              <span className="text-muted">Klikk for å laste opp bilder</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            {(form.imageUrls ?? []).length > 0 && (
              <div className="image-preview-grid">
                {(form.imageUrls ?? []).map((url, i) => (
                  <div key={i} className="image-preview-item">
                    <img src={url} alt={`Bilde ${i + 1}`} />
                    <button className="image-remove-btn" onClick={() => removeImage(i)}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="form-modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Avbryt</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initialTrip ? 'Lagre endringer' : 'Legg til tur'}
          </button>
        </div>
      </div>
    </div>
  );
}

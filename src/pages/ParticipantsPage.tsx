import { useState } from 'react';
import { UserPlus, Trash2, User } from 'lucide-react';
import type { Participant } from '../types';
import { generateId } from '../utils/stats';
import './ParticipantsPage.css';

const COLORS = [
  '#4a9eff', '#52b788', '#f4a261', '#e76f51', '#9b5de5',
  '#7ec8e3', '#f72585', '#b7e4c7', '#ffd166', '#06d6a0',
];

interface Props {
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
}

export default function ParticipantsPage({ participants, onChange }: Props) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) { setError('Navn kan ikke være tomt'); return; }
    if (participants.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('En deltager med dette navnet finnes allerede');
      return;
    }
    onChange([...participants, { id: generateId(), name: trimmed, color: selectedColor }]);
    setName('');
    setError('');
  }

  function handleDelete(id: string) {
    onChange(participants.filter(p => p.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div className="participants-page">
      <div className="page-header">
        <h1>Deltagere</h1>
        <p className="text-secondary">Administrer faste familiemedlemmer som kan delta på toppturer.</p>
      </div>

      <div className="card add-participant-card">
        <h3>Legg til deltager</h3>
        <div className="add-form">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Navn</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="f.eks. Ina"
            />
            {error && <span className="field-error">{error}</span>}
          </div>

          <div className="form-group color-picker-group">
            <label>Farge</label>
            <div className="color-swatches">
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`color-swatch ${selectedColor === c ? 'color-swatch--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <button className="btn btn-primary add-btn" onClick={handleAdd}>
            <UserPlus size={16} />
            Legg til
          </button>
        </div>
      </div>

      <div className="participants-list">
        {participants.length === 0 ? (
          <div className="empty-state card">
            <User size={40} strokeWidth={1.2} className="text-muted" />
            <p className="text-muted" style={{ marginTop: '0.75rem' }}>Ingen deltagere lagt til ennå.</p>
          </div>
        ) : (
          participants.map(p => (
            <div key={p.id} className="participant-row card">
              <div className="participant-avatar" style={{ background: p.color }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="participant-name">{p.name}</span>
              <button
                className="btn btn-danger btn-icon"
                onClick={() => handleDelete(p.id)}
                title="Slett deltager"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

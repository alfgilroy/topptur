import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { Trip, Participant } from '../types';
import { computeYearlyStats } from '../utils/stats';
import './ReportPage.css';

interface Props {
  trips: Trip[];
  participants: Participant[];
}

type Metric = 'totalDistanceKm' | 'totalElevationGainM' | 'tripCount' | 'highestPeakM' | 'totalDurationMinutes';

const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: 'totalDistanceKm',     label: 'Distanse',        unit: 'km' },
  { key: 'totalElevationGainM', label: 'Høydemeter opp',  unit: 'm' },
  { key: 'tripCount',           label: 'Antall turer',    unit: 'turer' },
  { key: 'highestPeakM',        label: 'Høyeste topp',    unit: 'moh' },
  { key: 'totalDurationMinutes',label: 'Tidsbruk',        unit: 'timer' },
];

function minutesToHours(min: number) {
  return Math.round((min / 60) * 10) / 10;
}

export default function ReportPage({ trips, participants }: Props) {
  const stats = useMemo(() => computeYearlyStats(trips), [trips]);

  const years = useMemo(() => {
    const ys = [...new Set(stats.map(s => s.year))].sort();
    return ys;
  }, [stats]);

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [activeMetric, setActiveMetric] = useState<Metric>('totalDistanceKm');

  const filteredStats = selectedYear === 'all'
    ? stats
    : stats.filter(s => s.year === selectedYear);

  // Build chart data: one entry per year, one bar per participant
  const chartData = useMemo(() => {
    const yearsToShow = selectedYear === 'all' ? years : [selectedYear as number];
    return yearsToShow.map(year => {
      const row: Record<string, string | number> = { year: String(year) };
      participants.forEach(p => {
        const s = filteredStats.find(x => x.year === year && x.participantId === p.id);
        let val = s ? s[activeMetric] : 0;
        if (activeMetric === 'totalDurationMinutes') val = minutesToHours(val as number);
        row[p.name] = Math.round((val as number) * 10) / 10;
      });
      return row;
    });
  }, [filteredStats, participants, years, selectedYear, activeMetric]);

  // Summary cards per participant
  const summaryCards = participants.map(p => {
    const pStats = filteredStats.filter(s => s.participantId === p.id);
    return {
      participant: p,
      totalKm: pStats.reduce((a, s) => a + s.totalDistanceKm, 0),
      totalHm: pStats.reduce((a, s) => a + s.totalElevationGainM, 0),
      tripCount: pStats.reduce((a, s) => a + s.tripCount, 0),
      highestPeak: Math.max(0, ...pStats.map(s => s.highestPeakM)),
      totalHours: minutesToHours(pStats.reduce((a, s) => a + s.totalDurationMinutes, 0)),
    };
  });

  const hasData = stats.length > 0;

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Familierapport</h1>
        <p className="text-secondary">Aggregert statistikk per familiemedlem</p>
      </div>

      {!hasData ? (
        <div className="card empty-state">
          <p className="text-muted">Ingen fullforte turer ennå. Logg turer med status «Fullfort» for å se statistikk.</p>
        </div>
      ) : (
        <>
          {/* Year filter */}
          <div className="year-filter">
            <button
              className={`year-btn ${selectedYear === 'all' ? 'year-btn--active' : ''}`}
              onClick={() => setSelectedYear('all')}
            >Alle år</button>
            {years.map(y => (
              <button
                key={y}
                className={`year-btn ${selectedYear === y ? 'year-btn--active' : ''}`}
                onClick={() => setSelectedYear(y)}
              >{y}</button>
            ))}
          </div>

          {/* Summary cards */}
          <div className="summary-grid">
            {summaryCards.map(({ participant: p, totalKm, totalHm, tripCount, highestPeak, totalHours }) => (
              <div key={p.id} className="summary-card card">
                <div className="summary-card-header">
                  <div className="summary-avatar" style={{ background: p.color }}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="summary-name">{p.name}</div>
                </div>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="summary-stat-value">{Math.round(totalKm * 10) / 10}</span>
                    <span className="summary-stat-label">km</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{totalHm.toLocaleString()}</span>
                    <span className="summary-stat-label">hm opp</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{tripCount}</span>
                    <span className="summary-stat-label">turer</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{highestPeak > 0 ? highestPeak : '—'}</span>
                    <span className="summary-stat-label">moh</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{totalHours}</span>
                    <span className="summary-stat-label">timer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Metric selector */}
          <div className="metric-tabs">
            {METRICS.map(m => (
              <button
                key={m.key}
                className={`metric-tab ${activeMetric === m.key ? 'metric-tab--active' : ''}`}
                onClick={() => setActiveMetric(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Bar chart */}
          <div className="card chart-card">
            <h3>
              {METRICS.find(m => m.key === activeMetric)?.label}
              <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({METRICS.find(m => m.key === activeMetric)?.unit})
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 13 }} />
                {participants.map(p => (
                  <Bar key={p.id} dataKey={p.name} fill={p.color} radius={[4, 4, 0, 0]} maxBarSize={60} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

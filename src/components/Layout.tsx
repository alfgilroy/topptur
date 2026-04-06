import React from 'react';
import { Mountain, Map, BarChart2, Users, Menu, X } from 'lucide-react';
import './Layout.css';

type Page = 'turer' | 'kart' | 'rapport' | 'deltagere';

interface LayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; Icon: React.ElementType }[] = [
  { id: 'turer',     label: 'Turer',       Icon: Mountain },
  { id: 'kart',      label: 'Kart',        Icon: Map },
  { id: 'rapport',   label: 'Rapport',     Icon: BarChart2 },
  { id: 'deltagere', label: 'Deltagere',   Icon: Users },
];

export default function Layout({ activePage, onNavigate, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-brand">
          <Mountain size={22} strokeWidth={1.8} className="brand-icon" />
          <span className="brand-name">Topptur</span>
        </div>

        <nav className="topbar-nav">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${activePage === id ? 'nav-item--active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-nav">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`mobile-nav-item ${activePage === id ? 'mobile-nav-item--active' : ''}`}
              onClick={() => { onNavigate(id); setMenuOpen(false); }}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

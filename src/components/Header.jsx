import React from 'react';
import { Sprout, Bell, LogOut, Settings } from 'lucide-react';
import { getMoonPhaseInfo } from '../utils/lunar';

export default function Header({ 
  setCurrentView, 
  onLogout, 
  onOpenSettings, 
  pendingBagsCount 
}) {
  const today = new Date();
  const moonInfo = getMoonPhaseInfo(today);

  return (
    <header className="top-header">
      <div className="header-content">
        <button
          type="button"
          className="brand-section" 
          onClick={() => setCurrentView('home')}
          title="Ir al Menú Principal"
          aria-label="Ir al inicio de Injertador Canarias"
        >
          <div className="brand-logo-badge">
            <Sprout size={23} />
          </div>
          <div className="brand-info">
            <h1>
              Injertador <span>Canarias</span>
            </h1>
            <span>Agenda de campo</span>
          </div>
        </button>

        <div className="header-actions">
          <button
            type="button"
            className={`lunar-today-pill ${moonInfo.isWaning ? 'waning' : ''}`}
            title={`Fase lunar hoy: ${moonInfo.name} (${moonInfo.illumination}%). ${moonInfo.recommendation}`}
            onClick={() => setCurrentView('calendar')}
            aria-label={`Abrir calendario. Hoy: ${moonInfo.name}, ${moonInfo.illumination}% iluminada`}
          >
            <span className="lunar-pill-mark" aria-hidden="true" />
            <span>Hoy · {moonInfo.name}</span>
            {moonInfo.isWaning && (
              <span className="lunar-pill-status">Favorable para injertar</span>
            )}
          </button>

          <button 
            className="header-icon-btn" 
            onClick={() => setCurrentView('bags')}
            title="Avisos de Retirada de Bolsas (30 Días)"
            aria-label={`Recordatorios de bolsas${pendingBagsCount > 0 ? `: ${pendingBagsCount} pendientes` : ''}`}
          >
            <Bell size={20} />
            {pendingBagsCount > 0 && (
              <span className="badge-notification">{pendingBagsCount}</span>
            )}
          </button>

          <button 
            className="header-icon-btn" 
            onClick={onOpenSettings}
            title="Ajustes de Administrador"
            aria-label="Ajustes"
          >
            <Settings size={20} />
          </button>

          <button 
            className="header-icon-btn" 
            onClick={onLogout}
            title="Bloquear / Salir"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { Sprout, Moon, Bell, LogOut, Settings, Calendar, ShieldCheck } from 'lucide-react';
import { getMoonPhaseInfo } from '../utils/lunar';

export default function Header({ 
  currentView, 
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
        <div 
          className="brand-section" 
          onClick={() => setCurrentView('home')}
          title="Ir al Menú Principal"
        >
          <div className="brand-logo-badge">
            <Sprout size={24} color="#d49a37" />
          </div>
          <div className="brand-info">
            <h1>
              Injertador <span>Canarias</span>
            </h1>
            <span>Gestión Agrícola & Ciclos Lunares</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Pill con fase lunar actual de Canarias */}
          <div 
            className={`lunar-today-pill ${moonInfo.isWaning ? 'waning' : ''}`}
            title={`Fase lunar hoy: ${moonInfo.name} (${moonInfo.illumination}%). ${moonInfo.recommendation}`}
            onClick={() => setCurrentView('calendar')}
            style={{ cursor: 'pointer' }}
          >
            <span>{moonInfo.icon}</span>
            <span>Hoy: {moonInfo.name}</span>
            {moonInfo.isWaning && (
              <span style={{ color: '#ff6b6b', fontWeight: 800 }}>• ¡Menguante (Injertar)!</span>
            )}
          </div>

          {/* Acceso a Avisos de Bolsas */}
          <button 
            className="header-icon-btn" 
            onClick={() => setCurrentView('bags')}
            title="Avisos de Retirada de Bolsas (30 Días)"
          >
            <Bell size={20} />
            {pendingBagsCount > 0 && (
              <span className="badge-notification">{pendingBagsCount}</span>
            )}
          </button>

          {/* Ajustes y Empresa */}
          <button 
            className="header-icon-btn" 
            onClick={onOpenSettings}
            title="Ajustes de Administrador"
          >
            <Settings size={20} />
          </button>

          {/* Cerrar Sesión Administrador */}
          <button 
            className="header-icon-btn" 
            onClick={onLogout}
            title="Bloquear / Salir"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

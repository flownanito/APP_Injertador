import React from 'react';
import { Home, Calendar, PlusCircle, ClipboardList, Receipt, Bell } from 'lucide-react';

export default function BottomNav({
  currentView,
  setCurrentView,
  onOpenNewClient,
  pendingBagsCount = 0
}) {
  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => setCurrentView('home')}
        title="Inicio"
      >
        <Home size={22} />
        <span>Inicio</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'calendar' ? 'active' : ''}`}
        onClick={() => setCurrentView('calendar')}
        title="Calendario"
      >
        <Calendar size={22} />
        <span>Calendario</span>
      </button>

      <button
        type="button"
        className="bottom-nav-item item-create"
        onClick={onOpenNewClient}
        title="Nueva Cita"
      >
        <div className="bottom-nav-plus-circle">
          <PlusCircle size={26} />
        </div>
        <span>Nueva Cita</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'grafts' || currentView === 'grafts-completed' ? 'active' : ''}`}
        onClick={() => setCurrentView('grafts')}
        title="Injertos"
      >
        <ClipboardList size={22} />
        <span>Injertos</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'invoices' ? 'active' : ''}`}
        onClick={() => setCurrentView('invoices')}
        title="Facturas"
      >
        <Receipt size={22} />
        <span>Facturas</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'bags' ? 'active' : ''}`}
        onClick={() => setCurrentView('bags')}
        title="Avisos Bolsas"
        style={{ position: 'relative' }}
      >
        <Bell size={22} />
        {pendingBagsCount > 0 && (
          <span className="bottom-nav-badge">{pendingBagsCount}</span>
        )}
        <span>Bolsas</span>
      </button>
    </nav>
  );
}

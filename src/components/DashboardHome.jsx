import React from 'react';
import { Calendar, Receipt, PlusCircle, ClipboardList, Bell, CheckCircle2, Moon } from 'lucide-react';
import { getMoonPhaseInfo } from '../utils/lunar';

export default function DashboardHome({
  onNavigate,
  clients = [],
  invoices = [],
  bagReminders = [],
  onOpenNewClientModal
}) {
  const today = new Date();
  const moonInfo = getMoonPhaseInfo(today);
  const todayStr = today.toISOString().slice(0, 10);

  const todayGrafts = clients.filter(c => c.status === 'pendiente' && c.serviceDate === todayStr);
  const totalPendingGrafts = clients.filter(c => c.status === 'pendiente');
  const pendingBags = bagReminders.filter(b => !b.isDone);
  const formattedDate = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="dashboard-heading">
          <span className="dashboard-date">{formattedDate}</span>
          <h2 className="dashboard-hero-title">El campo, en orden.</h2>
        </div>
        <p className="dashboard-hero-subtitle">
          Organiza los trabajos, consulta la luna y sigue cada injerto desde un solo lugar.
        </p>

        <div className={`lunar-banner-alert ${moonInfo.isWaning ? 'optimal' : 'waiting'}`}>
          <span className="lunar-banner-icon" aria-hidden="true">
            <Moon size={21} />
          </span>
          <div className="lunar-banner-copy">
            <strong>Hoy: {moonInfo.name} <span>· {moonInfo.illumination}% iluminada</span></strong>
            <div className="lunar-banner-note">
              {moonInfo.isWaning ? (
                <span>Periodo menguante; día tradicionalmente favorable para injertar.</span>
              ) : (
                <span>Consulta el calendario para planificar los próximos días de menguante.</span>
              )}
            </div>
          </div>
          <span className="lunar-status-label">{moonInfo.isWaning ? 'Menguante' : 'Otra fase'}</span>
        </div>
      </div>

      <div className="square-menu-grid">
        <button
          className="square-menu-btn btn-calendario"
          onClick={() => onNavigate('calendar')}
          title="Ver Calendario con Lunas Menguantes"
        >
          {moonInfo.isWaning && (
            <span className="square-btn-badge is-alert">
              Menguante hoy
            </span>
          )}
          <div className="square-btn-icon-wrapper">
            <Calendar size={38} />
          </div>
          <span className="square-btn-title">Calendario</span>
          <span className="square-btn-desc">
            Fases lunares y días de trabajo
          </span>
        </button>

        <button
          className="square-menu-btn btn-facturacion"
          onClick={() => onNavigate('invoices')}
          title="Gestión de Facturación y Cobros"
        >
          <span className="square-btn-badge">
            {invoices.length} {invoices.length === 1 ? 'Factura' : 'Facturas'}
          </span>
          <div className="square-btn-icon-wrapper">
            <Receipt size={38} />
          </div>
          <span className="square-btn-title">Facturación</span>
          <span className="square-btn-desc">
            Crea y consulta tus facturas
          </span>
        </button>

        <button
          className="square-menu-btn btn-nuevacita"
          onClick={onOpenNewClientModal}
          title="Añadir Nuevo Cliente e Injerto"
        >
          <span className="square-btn-badge is-action">
            Nueva labor
          </span>
          <div className="square-btn-icon-wrapper">
            <PlusCircle size={38} />
          </div>
          <span className="square-btn-title">Nueva Cita</span>
          <span className="square-btn-desc">
            Anota un cliente y su próximo injerto
          </span>
        </button>

        <button
          className="square-menu-btn btn-injertoshoy"
          onClick={() => onNavigate('grafts')}
          title="Ver Lista de Injertos y Citas"
        >
          <span className={`square-btn-badge ${todayGrafts.length > 0 ? 'is-alert' : ''}`}>
            {todayGrafts.length} hoy · {totalPendingGrafts.length} pendientes
          </span>
          <div className="square-btn-icon-wrapper">
            <ClipboardList size={38} />
          </div>
          <span className="square-btn-title">Lista de Injertos</span>
          <span className="square-btn-desc">
            Servicios, clientes y trabajos pendientes
          </span>
        </button>
      </div>

      <div className="secondary-menu-bar">
        <button
          type="button"
          className="secondary-menu-btn"
          onClick={() => onNavigate('bags')}
        >
          <span className={`secondary-btn-icon ${pendingBags.length > 0 ? 'has-alert' : ''}`}>
            <Bell size={22} />
          </span>
          <span className="secondary-btn-text">
            <span className="secondary-btn-title">Retirada de bolsas</span>
            <span className="secondary-btn-detail">
              {pendingBags.length > 0 
                ? `${pendingBags.length} recordatorio(s) pendiente(s)`
                : 'No hay recordatorios pendientes'}
            </span>
          </span>
        </button>

        <button
          type="button"
          className="secondary-menu-btn"
          onClick={() => onNavigate('grafts-completed')}
        >
          <span className="secondary-btn-icon">
            <CheckCircle2 size={22} />
          </span>
          <span className="secondary-btn-text">
            <span className="secondary-btn-title">Histórico de Trabajos Completados</span>
            <span className="secondary-btn-detail">
              {clients.filter(c => c.status === 'completado').length} servicios finalizados con éxito
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

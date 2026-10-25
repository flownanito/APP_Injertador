import React from 'react';
import { Calendar, Receipt, PlusCircle, ClipboardList, Bell, Settings, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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

  // Filtros de citas
  const todayGrafts = clients.filter(c => c.status === 'pendiente' && c.serviceDate === todayStr);
  const totalPendingGrafts = clients.filter(c => c.status === 'pendiente');
  const pendingBags = bagReminders.filter(b => !b.isDone);

  return (
    <div className="dashboard-container">
      {/* Banner Superior con Estado Lunar de Canarias */}
      <div className="dashboard-hero">
        <h2 className="dashboard-hero-title">
          <span>Panel Principal del Injertador</span>
        </h2>
        <p className="dashboard-hero-subtitle">
          Sistema especializado para la agricultura de las Islas Canarias. Recuerde que el calendario lunar marca los días propicios de savia baja.
        </p>

        <div className={`lunar-banner-alert ${moonInfo.isWaning ? 'optimal' : 'waiting'}`}>
          <div style={{ fontSize: '1.4rem' }}>{moonInfo.icon}</div>
          <div>
            <strong>Fase Lunar Hoy: {moonInfo.name} ({moonInfo.illumination}% iluminada)</strong>
            <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
              {moonInfo.isWaning ? (
                <span>⭕ <strong>LUNA MENGUANTE ACTIVA:</strong> Momento propicio para injertar hoy. La savia desciende y favorece la cicatrización del injerto.</span>
              ) : (
                <span>⚠️ <strong>NO ES LUNA MENGUANTE:</strong> En la tradición canaria no se recomienda injertar hoy. Consulte el calendario para las próximas fechas en menguante.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ DE INICIO: BOTONES CUADRADOS EN COLUMNAS DE DOS
          Requisito explícito de Guia_Developed.md */}
      <div className="square-menu-grid">
        {/* BOTON 1: CALENDARIO */}
        <button
          className="square-menu-btn btn-calendario"
          onClick={() => onNavigate('calendar')}
          title="Ver Calendario con Lunas Menguantes"
        >
          {moonInfo.isWaning && (
            <span className="square-btn-badge" style={{ background: '#d90429' }}>
              Menguante Activa
            </span>
          )}
          <div className="square-btn-icon-wrapper">
            <Calendar size={38} />
          </div>
          <span className="square-btn-title">Calendario</span>
          <span className="square-btn-desc">
            Ciclos lunares de Canarias y lunas menguantes en rojo
          </span>
        </button>

        {/* BOTON 2: FACTURACIÓN */}
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
            Crear, ver, editar y gestionar facturas fácilmente
          </span>
        </button>

        {/* BOTON 3: NUEVA CITA */}
        <button
          className="square-menu-btn btn-nuevacita"
          onClick={onOpenNewClientModal}
          title="Añadir Nuevo Cliente e Injerto"
        >
          <span className="square-btn-badge" style={{ background: '#e65100' }}>
            + Registrar
          </span>
          <div className="square-btn-icon-wrapper">
            <PlusCircle size={38} />
          </div>
          <span className="square-btn-title">Nueva Cita</span>
          <span className="square-btn-desc">
            Formulario rápido para nuevo cliente e injerto
          </span>
        </button>

        {/* BOTON 4: LISTA DE INJERTOS HOY */}
        <button
          className="square-menu-btn btn-injertoshoy"
          onClick={() => onNavigate('grafts')}
          title="Ver Lista de Injertos y Citas"
        >
          <span className="square-btn-badge" style={{ background: todayGrafts.length > 0 ? '#d90429' : '#1976d2' }}>
            {todayGrafts.length} Hoy ({totalPendingGrafts.length} Pendientes)
          </span>
          <div className="square-btn-icon-wrapper">
            <ClipboardList size={38} />
          </div>
          <span className="square-btn-title">Lista de Injertos</span>
          <span className="square-btn-desc">
            Clientes, ubicaciones, árboles y marcar como completado
          </span>
        </button>
      </div>

      {/* ACCESOS RÁPIDOS SECUNDARIOS */}
      <div className="secondary-menu-bar">
        {/* Acceso a Avisos de Bolsas (30 Días) */}
        <div 
          className="secondary-menu-btn"
          onClick={() => onNavigate('bags')}
        >
          <div className="secondary-btn-icon" style={{ background: pendingBags.length > 0 ? '#ffe5e8' : '#e8f5e9', color: pendingBags.length > 0 ? '#d90429' : '#1b4332' }}>
            <Bell size={22} />
          </div>
          <div className="secondary-btn-text">
            <h4>Avisos Retirada de Bolsas (30 Días)</h4>
            <p>
              {pendingBags.length > 0 
                ? `${pendingBags.length} aviso(s) pendiente(s) de notificar por WhatsApp/llamada`
                : 'Sin avisos urgentes pendientes'}
            </p>
          </div>
        </div>

        {/* Acceso a Resumen / Histórico */}
        <div 
          className="secondary-menu-btn"
          onClick={() => onNavigate('grafts-completed')}
        >
          <div className="secondary-btn-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="secondary-btn-text">
            <h4>Histórico de Trabajos Completados</h4>
            <p>
              {clients.filter(c => c.status === 'completado').length} servicios finalizados con éxito
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

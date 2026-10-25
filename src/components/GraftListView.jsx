import React, { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Plus, Phone, MapPin, Calendar, CheckCircle, Edit3, Trash2, 
  MessageSquare, Receipt, ExternalLink, AlertCircle, Clock, ShieldCheck, Search
} from 'lucide-react';
import { isWaningMoon } from '../utils/lunar';

export default function GraftListView({
  onBack,
  clients = [],
  onAddNewClient,
  onEditClient,
  onCompleteClient,
  onDeleteClient,
  onCreateInvoiceFromClient,
  initialTab = 'pendientes'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'pendientes', 'hoy', 'completados'
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Vercel Best Practice: Memorizar contadores para evitar cálculos en cada render
  const pendingCount = useMemo(() => clients.filter(c => c.status === 'pendiente').length, [clients]);
  const todayCount = useMemo(() => clients.filter(c => c.status === 'pendiente' && c.serviceDate === todayStr).length, [clients, todayStr]);
  const completedCount = useMemo(() => clients.filter(c => c.status === 'completado').length, [clients]);

  // Vercel Best Practice: Memorizar lista filtrada para evitar recalculación al renderizar elementos hijos
  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return clients.filter(c => {
      if (query) {
        const matchesSearch = 
          c.name.toLowerCase().includes(query) ||
          c.phone.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query) ||
          (c.treeTypes && c.treeTypes.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (activeTab === 'pendientes') {
        return c.status === 'pendiente';
      } else if (activeTab === 'hoy') {
        return c.status === 'pendiente' && c.serviceDate === todayStr;
      } else if (activeTab === 'completados') {
        return c.status === 'completado';
      }
      return true;
    });
  }, [clients, searchQuery, activeTab, todayStr]);

  const handleOpenMaps = useCallback((address) => {
    const encoded = encodeURIComponent(address + ', Islas Canarias');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  }, []);

  const handleOpenWhatsApp = useCallback((phone, name) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithPrefix = cleanPhone.startsWith('34') ? cleanPhone : `34${cleanPhone}`;
    const text = encodeURIComponent(`Hola ${name}, le contacto desde Servicios de Injertos Canarias respecto a su servicio programado.`);
    window.open(`https://wa.me/${phoneWithPrefix}?text=${text}`, '_blank');
  }, []);

  return (
    <div className="graft-list-view">
      {/* Cabecera con Navegación y Botón de Nueva Cita */}
      <div className="calendar-page-header">
        <button className="back-nav-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver al Menú
        </button>

        <button className="btn btn-primary" onClick={onAddNewClient}>
          <Plus size={18} />
          Nuevo Cliente / Injerto
        </button>
      </div>

      {/* Selector de Pestañas */}
      <div className="graft-tabs">
        <button
          className={`tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          Pendientes ({pendingCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'hoy' ? 'active' : ''}`}
          onClick={() => setActiveTab('hoy')}
        >
          Citas de Hoy ({todayCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'completados' ? 'active' : ''}`}
          onClick={() => setActiveTab('completados')}
        >
          Histórico Completados ({completedCount})
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div style={{ margin: '14px 0 20px 0' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por cliente, teléfono, dirección o tipo de árbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LISTADO DE TARJETAS DE INJERTO
          Requisito explícito de Guia_Developed.md:
          "en el titulo debe poner el nombre del cliente y el numero de telefono y ya debajo
          pues todos los datos que se recolectaron anteriormente en el formulario" */}
      <div className="graft-list-container">
        {filteredClients.length === 0 ? (
          <div style={{
            background: '#ffffff',
            padding: '40px 20px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid #dbe4dc',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {activeTab === 'hoy' 
                ? 'No hay citas de injerto programadas para hoy' 
                : activeTab === 'pendientes' 
                  ? 'No hay servicios pendientes en la lista' 
                  : 'No hay servicios completados registrados'}
            </p>
            <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
              Utilice el botón "Nuevo Cliente / Injerto" para programar una nueva labor.
            </p>
          </div>
        ) : (
          filteredClients.map(client => {
            const serviceDateObj = client.serviceDate ? new Date(client.serviceDate + 'T12:00:00') : null;
            const hasWaningMoon = serviceDateObj ? isWaningMoon(serviceDateObj) : false;

            return (
              <div 
                key={client.id}
                className={`graft-card ${client.status === 'completado' ? 'is-completed' : 'is-pending'}`}
              >
                {/* CABECERA DE LA TARJETA: NOMBRE DEL CLIENTE Y NUMERO DE TELEFONO
                    Requisito de la guía */}
                <div className="graft-card-header">
                  <div className="graft-client-title">
                    <span>{client.name}</span>
                    <span className="graft-client-phone">
                      <Phone size={15} />
                      {client.phone}
                    </span>
                  </div>

                  <span className={`graft-status-badge ${client.status === 'completado' ? 'completed' : 'pending'}`}>
                    {client.status === 'completado' ? '✓ Completado' : '⏳ Pendiente'}
                  </span>
                </div>

                {/* CUERPO CON TODOS LOS DATOS RECOLECTADOS */}
                <div className="graft-card-body">
                  <div className="graft-info-row">
                    <MapPin size={18} />
                    <div>
                      <div className="label">Lugar de Injerto / Dirección</div>
                      <div className="value">
                        {client.address}
                        <button
                          type="button"
                          onClick={() => handleOpenMaps(client.address)}
                          style={{
                            marginLeft: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#2d6a4f',
                            cursor: 'pointer',
                            verticalAlign: 'middle',
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                          title="Abrir en Google Maps"
                        >
                          <ExternalLink size={13} style={{ marginRight: '2px' }} /> Maps
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="graft-info-row">
                    <Calendar size={18} />
                    <div>
                      <div className="label">Fecha del Servicio</div>
                      <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>
                          {serviceDateObj 
                            ? serviceDateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                            : client.serviceDate}
                        </span>
                        {hasWaningMoon && (
                          <span style={{ 
                            background: '#fee2e2', 
                            color: '#b70928', 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '9999px',
                            fontWeight: 700,
                            border: '1px solid #ef233c'
                          }}>
                            ⭕ Menguante
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="graft-info-row" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '1.2rem', marginRight: '4px' }}>🌳</div>
                    <div>
                      <div className="label">Tipo de Árboles a Injertar</div>
                      <div className="value" style={{ fontSize: '1rem', color: '#1b4332' }}>
                        {client.treeTypes}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas adicionales si existen */}
                {client.notes && (
                  <div className="graft-notes-box">
                    <strong>Observaciones:</strong> {client.notes}
                  </div>
                )}

                {/* Si está completado, mostrar datos de cobro y aviso de retirada de bolsas de 30 días */}
                {client.status === 'completado' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {/* Información de Cobro solicitada por el usuario */}
                    <div style={{
                      background: client.paymentStatus === 'pendiente' ? '#fff1f2' : '#f0fdf4',
                      border: `1px solid ${client.paymentStatus === 'pendiente' ? '#ffa39e' : '#bbf7d0'}`,
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{client.paymentStatus === 'pendiente' ? '⏳' : '💶'}</span>
                        <div>
                          <strong>Estado de Cobro: </strong>
                          <span style={{
                            color: client.paymentStatus === 'pendiente' ? '#d90429' : '#2b9348',
                            fontWeight: 800
                          }}>
                            {client.paymentStatus === 'pendiente' ? 'Pendiente de Pago' : 'Cobrado'}
                          </span>
                          {client.paymentMethod && client.paymentStatus !== 'pendiente' && (
                            <span style={{ color: '#526359', fontSize: '0.8rem', marginLeft: '6px' }}>
                              ({client.paymentMethod})
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: client.paymentStatus === 'pendiente' ? '#d90429' : '#1b4332'
                      }}>
                        {client.paidAmount ? Number(client.paidAmount).toFixed(2) : (client.estimatedPrice ? Number(client.estimatedPrice).toFixed(2) : '0.00')} €
                      </div>
                    </div>

                    {/* Aviso de Retirada de Bolsas (30 Días) */}
                    {client.bagReminderDate && (
                      <div style={{
                        background: '#fff7ed',
                        border: '1.5px solid #ffedd5',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#9a3412'
                      }}>
                        <Clock size={18} />
                        <div>
                          <strong>Aviso de Retirada de Bolsas (30 Días):</strong> Programado para el{' '}
                          <strong>
                            {new Date(client.bagReminderDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </strong>.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="graft-card-actions">
                  <div className="action-btns-group">
                    {/* Botón WhatsApp */}
                    <button
                      className="btn btn-whatsapp"
                      onClick={() => handleOpenWhatsApp(client.phone, client.name)}
                      title="Contactar por WhatsApp"
                    >
                      <MessageSquare size={16} />
                      WhatsApp
                    </button>

                    {/* Botón Llamar */}
                    <a
                      href={`tel:${client.phone}`}
                      className="btn btn-call"
                      title="Llamar al cliente"
                    >
                      <Phone size={16} />
                      Llamar
                    </a>

                    {/* Botón Crear Factura a partir del cliente */}
                    <button
                      className="btn btn-outline"
                      onClick={() => onCreateInvoiceFromClient(client)}
                      title="Facturar este servicio"
                    >
                      <Receipt size={16} />
                      Facturar
                    </button>
                  </div>

                  <div className="action-btns-group">
                    {/* Requisito: Si está pendiente, botón para marcar como completado.
                        Al completarlo abre el modal de cobro y genera el aviso de 30 días */}
                    {client.status === 'pendiente' && (
                      <button
                        className="btn btn-success"
                        onClick={() => onCompleteClient(client)}
                        title="Marcar completado (solicita datos de cobro y crea aviso de 30 días para bolsas)"
                      >
                        <CheckCircle size={16} />
                        Marcar como Completado
                      </button>
                    )}

                    {/* Editar datos del cliente */}
                    <button
                      className="btn btn-secondary"
                      onClick={() => onEditClient(client)}
                      title="Modificar datos del cliente o servicio"
                    >
                      <Edit3 size={16} />
                      Editar
                    </button>

                    {/* Eliminar */}
                    <button
                      className="btn btn-danger"
                      onClick={() => onDeleteClient(client.id, client.name)}
                      title="Eliminar registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

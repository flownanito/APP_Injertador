import React, { useState } from 'react';
import { ArrowLeft, Bell, Phone, MessageSquare, CheckCircle, Clock, Calendar, AlertTriangle } from 'lucide-react';

export default function BagRemindersView({
  onBack,
  bagReminders = [],
  onToggleReminderDone
}) {
  const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'done'

  const filteredReminders = bagReminders.filter(rem => {
    if (filter === 'pending') return !rem.isDone;
    if (filter === 'done') return rem.isDone;
    return true;
  });

  const handleSendWhatsApp = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithPrefix = cleanPhone.startsWith('34') ? cleanPhone : `34${cleanPhone}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneWithPrefix}?text=${encoded}`, '_blank');
  };

  const pendingCount = bagReminders.filter(b => !b.isDone).length;

  return (
    <div className="bag-reminders-view">
      <div className="calendar-page-header">
        <button className="back-nav-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver al Menú
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Avisos Pendientes ({pendingCount})
          </button>
          <button
            className={`btn ${filter === 'done' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('done')}
          >
            Retiradas Realizadas
          </button>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            Todos ({bagReminders.length})
          </button>
        </div>
      </div>

      {/* Banner Informativo sobre los 30 Días */}
      <div className="bag-alert-banner">
        <div style={{
          background: '#d49a37',
          color: '#ffffff',
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Bell size={26} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#78350f', marginBottom: '4px' }}>
            Avisos al Cliente: Retirada con Delicadeza de Bolsas (30 Días)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.4 }}>
            Tras realizar el injerto, a los 30 días la púa ya ha brotado o soldado suficientemente. Es el momento de avisar al cliente para que <strong>retire con delicadeza las bolsas protectoras de sus árboles</strong>, evitando el exceso de calor y permitiendo que los nuevos brotes respiren y crezcan.
          </p>
        </div>
      </div>

      {/* Lista de Recordatorios */}
      {filteredReminders.length === 0 ? (
        <div style={{
          background: '#ffffff',
          padding: '40px 20px',
          borderRadius: '20px',
          textAlign: 'center',
          border: '1px solid #dbe4dc',
          color: '#6b7280'
        }}>
          <CheckCircle size={36} color="#2b9348" style={{ marginBottom: '10px' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {filter === 'pending'
              ? 'No hay avisos de bolsas pendientes por notificar'
              : 'No hay registros en esta sección'}
          </p>
          <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
            Cuando marque un servicio como "Completado" en la lista de injertos, se generará automáticamente aquí el aviso para dentro de 30 días.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReminders.map(item => {
            const dateObj = new Date(item.reminderDate + 'T12:00:00');
            const completedDateObj = item.client.completedAt ? new Date(item.client.completedAt) : null;

            return (
              <div 
                key={item.client.id}
                className={`bag-reminder-card ${item.diffDays <= 0 && !item.isDone ? 'urgent' : ''}`}
                style={item.isDone ? { opacity: 0.75, background: '#f8faf8' } : {}}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.client.name}</span>
                      <span className="graft-client-phone" style={{ fontSize: '0.85rem' }}>
                        <Phone size={14} /> {item.client.phone}
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#526359', marginTop: '2px' }}>
                      🌳 {item.client.treeTypes} • 📍 {item.client.address}
                    </p>
                  </div>

                  {/* Estado del contador de días */}
                  <div style={{ textAlign: 'right' }}>
                    {item.isDone ? (
                      <span className="graft-status-badge completed">
                        ✓ Bolsas Retiradas / Notificado
                      </span>
                    ) : item.diffDays <= 0 ? (
                      <span className="graft-status-badge" style={{ background: '#ffe5e8', color: '#d90429', border: '1px solid #ffa39e' }}>
                        ⚠️ ¡HOY SE CUMPLEN 30 DÍAS!
                      </span>
                    ) : (
                      <span className="graft-status-badge pending">
                        ⏳ Faltan {item.diffDays} días para los 30 días
                      </span>
                    )}
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>
                      Fecha programada: {dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* MENSAJE OBLIGATORIO DE LA GUIA:
                    "Los/El CLientes [NOMBRE] se le recuerda pasar a recoger su(s) bolsa(s) de injertos." */}
                <div className="bag-message-quote">
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#b07d24', marginBottom: '4px', fontWeight: 800 }}>
                    Mensaje Oficial de Recordatorio:
                  </div>
                  "{item.message}"
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Botón WhatsApp directo con el mensaje cargado */}
                    <button
                      className="btn btn-whatsapp"
                      onClick={() => handleSendWhatsApp(item.client.phone, item.message)}
                      title="Enviar mensaje exacto al cliente por WhatsApp"
                    >
                      <MessageSquare size={16} />
                      Enviar Aviso WhatsApp
                    </button>

                    {/* Botón Llamar */}
                    <a
                      href={`tel:${item.client.phone}`}
                      className="btn btn-call"
                      title="Llamar al cliente"
                    >
                      <Phone size={16} />
                      Llamar
                    </a>
                  </div>

                  <div>
                    <button
                      className={`btn ${item.isDone ? 'btn-secondary' : 'btn-outline'}`}
                      onClick={() => onToggleReminderDone(item.client.id, !item.isDone)}
                    >
                      <CheckCircle size={16} color={item.isDone ? '#2b9348' : 'currentColor'} />
                      {item.isDone ? 'Desmarcar como hecho' : 'Marcar como Avisado / Retirado'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

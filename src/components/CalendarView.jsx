import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Plus, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { getMonthCalendarData, getMoonPhaseInfo } from '../utils/lunar';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarView({
  onBack,
  clients = [],
  onScheduleForDate
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [currentBaseDate, setCurrentBaseDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDayData, setSelectedDayData] = useState(() => {
    const todayInfo = getMoonPhaseInfo(today);
    return {
      date: today,
      dateString: todayStr,
      moonInfo: todayInfo,
      isWaning: todayInfo.isWaning
    };
  });

  // Vercel Best Practice: Memorizar cálculos de calendarios para evitar re-cálculos en cada interacción
  const currentMonthData = useMemo(() => {
    return getMonthCalendarData(currentBaseDate.getFullYear(), currentBaseDate.getMonth());
  }, [currentBaseDate]);

  const nextMonthData = useMemo(() => {
    const nextDate = new Date(currentBaseDate.getFullYear(), currentBaseDate.getMonth() + 1, 1);
    return getMonthCalendarData(nextDate.getFullYear(), nextDate.getMonth());
  }, [currentBaseDate]);

  // Vercel Best Practice: useCallback para handlers estables
  const handlePrevMonths = useCallback(() => {
    setCurrentBaseDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonths = useCallback(() => {
    setCurrentBaseDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleResetToday = useCallback(() => {
    setCurrentBaseDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  // Citas del día seleccionado memorizadas
  const selectedDayAppointments = useMemo(() => {
    if (!selectedDayData) return [];
    return clients.filter(c => c.serviceDate === selectedDayData.dateString);
  }, [clients, selectedDayData]);

  const renderMonthGrid = (monthData) => {
    return (
      <div className="month-card">
        <h3 className="month-title-bar">
          {monthData.monthName} {monthData.year}
        </h3>

        <div className="calendar-weekdays-row" aria-hidden="true">
          {WEEKDAYS.map(w => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div className="calendar-days-grid" role="grid" aria-label={`Calendario de ${monthData.monthName} ${monthData.year}`}>
          {monthData.days.map((item) => {
            if (item.empty) {
              return <div key={item.key} className="cal-day-cell empty" role="gridcell" aria-hidden="true" />;
            }

            const isToday = item.dateString === todayStr;
            const isSelected = selectedDayData && selectedDayData.dateString === item.dateString;
            const dayAppointments = clients.filter(c => c.serviceDate === item.dateString);

            const cellLabel = `${item.dayNum} de ${monthData.monthName}. ${item.moonInfo.name}. ${item.isWaning ? 'Luna menguante apta para injertar' : 'No menguante'}. ${dayAppointments.length > 0 ? `${dayAppointments.length} citas programadas` : ''}`;

            return (
              <button
                type="button"
                key={item.key}
                onClick={() => setSelectedDayData(item)}
                className={`cal-day-cell ${item.isWaning ? 'is-waning' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                style={isSelected ? { outline: '2.5px solid #1b4332', zIndex: 3 } : {}}
                aria-label={cellLabel}
                aria-selected={isSelected}
                role="gridcell"
                title={cellLabel}
              >
                <span className="cal-day-num">{item.dayNum}</span>
                <span className="cal-moon-emoji">{item.moonInfo.icon}</span>
                {dayAppointments.length > 0 && (
                  <span 
                    className="cal-appointments-dot" 
                    title={`${dayAppointments.length} cita(s)`} 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-view-container">
      {/* Barra Superior con Navegación */}
      <div className="calendar-page-header">
        <button 
          className="back-nav-btn" 
          onClick={onBack}
          aria-label="Volver al Menú Principal"
        >
          <ArrowLeft size={18} />
          Volver al Menú
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleResetToday}
            aria-label="Ir al mes actual"
          >
            Mes Actual
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handlePrevMonths} 
            title="Mes anterior"
            aria-label="Ver mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleNextMonths} 
            title="Mes siguiente"
            aria-label="Ver mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Tarjeta de Leyenda Explicativa de las Islas Canarias */}
      <div className="calendar-legend-card">
        <div className="legend-items">
          <div className="legend-item">
            <span className="circle-legend-red" aria-hidden="true" />
            <div>
              <span style={{ color: '#d90429', fontWeight: 800 }}>Círculo Rojo = LUNA MENGUANTE</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#526359' }}>
                Días propicios para realizar injertos en Canarias (savia baja)
              </span>
            </div>
          </div>
          <div className="legend-item">
            <span className="circle-legend-normal" aria-hidden="true" />
            <div>
              <span>Días restantes</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#526359' }}>
                No recomendados para injerto según tradición agrícola
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#2d6a4f', fontWeight: 600 }}>
          📍 Cálculo astronómico en tiempo real adaptado a Canarias (UTC/WET)
        </div>
      </div>

      {/* VISTA DUAL: MES ACTUAL Y MES SIGUIENTE
          Requisito explícito de Guia_Developed.md */}
      <div className="months-dual-container">
        {renderMonthGrid(currentMonthData)}
        {renderMonthGrid(nextMonthData)}
      </div>

      {/* DETALLES DEL DÍA SELECCIONADO */}
      {selectedDayData && (
        <div className="day-detail-banner" role="region" aria-label="Detalles del día seleccionado">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true">{selectedDayData.moonInfo.icon}</span>
                <span>
                  {selectedDayData.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </h3>
              <p style={{ color: '#526359', fontSize: '0.9rem', marginTop: '4px' }}>
                Fase: <strong>{selectedDayData.moonInfo.name}</strong> • Iluminación: <strong>{selectedDayData.moonInfo.illumination}%</strong> • Edad lunar: <strong>{selectedDayData.moonInfo.age} días</strong>
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onScheduleForDate(selectedDayData.dateString)}
              aria-label={`Programar injerto para el día ${selectedDayData.dateString}`}
            >
              <Plus size={18} />
              Programar Injerto este Día
            </button>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: selectedDayData.isWaning ? '#fff1f2' : '#f0fdf4',
            border: `1.5px solid ${selectedDayData.isWaning ? '#ef233c' : '#22c55e'}`,
            color: selectedDayData.isWaning ? '#9f1239' : '#14532d',
            fontWeight: 600,
            fontSize: '0.92rem',
            marginBottom: '16px'
          }}>
            {selectedDayData.isWaning ? (
              <span>⭕ <strong>DÍA SEÑALADO CON CÍRCULO ROJO:</strong> Luna Menguante activa. En estos días la savia de los árboles desciende, disminuye la pérdida de savia al hacer el corte y asegura un agarre firme del injerto.</span>
            ) : (
              <span>ℹ️ <strong>NO ES DÍA MENGUANTE:</strong> En la agricultura canaria se aconseja esperar al periodo menguante para injertar.</span>
            )}
          </div>

          {/* Listado de citas agendadas en este día */}
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: '#1b4332' }}>
              Citas e Injertos programados para este día ({selectedDayAppointments.length})
            </h4>

            {selectedDayAppointments.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: '#6b7280', fontStyle: 'italic' }}>
                No hay ningún servicio programado para esta fecha.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '10px' }}>
                {selectedDayAppointments.map(client => (
                  <div 
                    key={client.id}
                    style={{
                      background: '#f8faf8',
                      border: '1px solid #dbe4dc',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{client.name}</strong>
                      <span className={`graft-status-badge ${client.status === 'pendiente' ? 'pending' : 'completed'}`} style={{ fontSize: '0.7rem' }}>
                        {client.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#2d6a4f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} /> {client.phone}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#526359', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {client.address}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#1b4332', fontWeight: 600, marginTop: '2px' }}>
                      🌳 {client.treeTypes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

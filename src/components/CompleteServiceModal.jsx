import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Euro, Clock, Receipt, AlertCircle, Calendar, Sparkles } from 'lucide-react';

export default function CompleteServiceModal({
  isOpen,
  onClose,
  client,
  onConfirm
}) {
  const [paymentStatus, setPaymentStatus] = useState('pagado'); // 'pagado' | 'pendiente'
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [createInvoice, setCreateInvoice] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setAmount(client.estimatedPrice ? String(client.estimatedPrice) : '150');
      setPaymentStatus('pagado');
      setPaymentMethod('Efectivo');
      setCreateInvoice(true);
      setNotes('');
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount) || 0;

    onConfirm(client.id, {
      paidAmount: numericAmount,
      paymentStatus: paymentStatus, // 'pagado' o 'pendiente'
      paymentMethod: paymentStatus === 'pagado' ? paymentMethod : 'Pendiente',
      createInvoice: createInvoice,
      notes: notes,
      completedDate: new Date().toISOString().slice(0, 10)
    });
    onClose();
  };

  // Calcular la fecha exacta de retirada de bolsas (+30 días)
  const reminderDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const reminderDateStr = reminderDate.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: '#e8f5e9',
              color: '#2b9348',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Finalizar y Completar Injerto</h3>
              <span style={{ fontSize: '0.8rem', color: '#526359' }}>
                Registro de cobro y aviso de 30 días
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Resumen del Cliente */}
            <div style={{
              background: '#f8faf8',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #dbe4dc',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '1.1rem', color: '#1b4332' }}>{client.name}</strong>
                <span style={{ color: '#2d6a4f', fontWeight: 700, fontSize: '0.9rem' }}>📞 {client.phone}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#526359', marginTop: '4px' }}>
                📍 {client.address}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1b4332', fontWeight: 600, marginTop: '4px' }}>
                🌳 {client.treeTypes}
              </div>
            </div>

            {/* SELECCIÓN DE COBRO: ¿Cobrado o Pendiente? */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.92rem' }}>
                ¿Ha cobrado este servicio o queda pendiente de pago? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('pagado')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: paymentStatus === 'pagado' ? '2px solid #2b9348' : '1.5px solid #dbe4dc',
                    background: paymentStatus === 'pagado' ? '#e8f5e9' : '#ffffff',
                    color: paymentStatus === 'pagado' ? '#1b4332' : '#526359',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition)'
                  }}
                >
                  <CheckCircle size={18} color={paymentStatus === 'pagado' ? '#2b9348' : '#82948a'} />
                  Cobrado Ahora Mismo
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatus('pendiente')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: paymentStatus === 'pendiente' ? '2px solid #d90429' : '1.5px solid #dbe4dc',
                    background: paymentStatus === 'pendiente' ? '#ffe5e8' : '#ffffff',
                    color: paymentStatus === 'pendiente' ? '#b70928' : '#526359',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition)'
                  }}
                >
                  <Clock size={18} color={paymentStatus === 'pendiente' ? '#d90429' : '#82948a'} />
                  Queda Pendiente de Pago
                </button>
              </div>
            </div>

            {/* IMPORTE (€) Y MÉTODO DE PAGO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="pay-amount">
                  <Euro size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {paymentStatus === 'pagado' ? 'Importe Cobrado (€) *' : 'Importe a Cobrar / Pendiente (€) *'}
                </label>
                <input
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              {paymentStatus === 'pagado' ? (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="pay-method">
                    Método de Cobro
                  </label>
                  <select
                    id="pay-method"
                    className="form-select"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="Efectivo">Efectivo en mano</option>
                    <option value="Bizum">Bizum</option>
                    <option value="Transferencia">Transferencia bancaria</option>
                    <option value="Tarjeta">Tarjeta / TPV</option>
                  </select>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fff1f2',
                  border: '1px solid #ffa39e',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  color: '#b70928',
                  fontWeight: 600
                }}>
                  ⚠️ Quedará registrado en Facturación como deuda pendiente del cliente.
                </div>
              )}
            </div>

            {/* Checkbox: Generar Factura Oficial Automática */}
            <div style={{
              background: '#f8faf8',
              border: '1px solid #dbe4dc',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <input
                id="create-inv-check"
                type="checkbox"
                checked={createInvoice}
                onChange={e => setCreateInvoice(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1b4332' }}
              />
              <label htmlFor="create-inv-check" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                <strong>Crear factura oficial automáticamente</strong> en el módulo de facturación con estos datos ({paymentStatus === 'pagado' ? 'Pagada' : 'Pendiente'}).
              </label>
            </div>

            {/* AVISO AUTOMÁTICO DE RETIRADA DE BOLSAS (30 DÍAS) */}
            <div style={{
              background: '#fff7ed',
              border: '1.5px solid #fed7aa',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.86rem',
              color: '#9a3412',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Calendar size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Aviso de 30 días para retirar bolsas programado:</strong>
                <div style={{ marginTop: '2px' }}>
                  Fecha límite recomendada: <strong>{reminderDateStr}</strong>
                </div>
                <div style={{ fontStyle: 'italic', marginTop: '4px', color: '#c2410c' }}>
                  "Hola {client.name}, le informamos de que ya han transcurrido los 30 días recomendados y ya puede retirar con delicadeza las bolsas protectoras de sus injertos para que los nuevos brotes respiren y se desarrollen correctamente. Hágalo con mucho cuidado para no dañar las yemas tiernas."
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <CheckCircle size={18} />
              Confirmar y Marcar Completado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

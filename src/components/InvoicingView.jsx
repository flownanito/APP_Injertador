import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Receipt, Eye, Edit3, Trash2, Printer, 
  CheckCircle, Clock, X, Save, Calendar, Moon, BookOpen, 
  HelpCircle, ChevronDown, ChevronUp, Sparkles, TrendingUp, AlertTriangle
} from 'lucide-react';
import { generateNextInvoiceNumber } from '../utils/storage';
import { isWaningMoon, getMoonPhaseInfo } from '../utils/lunar';

export default function InvoicingView({
  onBack,
  invoices = [],
  clients = [],
  settings = {},
  onSaveInvoice,
  onDeleteInvoice,
  prefilledClient = null,
  clearPrefilledClient
}) {
  // Estados para los 4 modales requeridos por la guía
  const [modalMode, setModalMode] = useState(prefilledClient ? 'create' : null); // 'create', 'view', 'edit', 'delete'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pagada', 'pendiente', 'menguante'
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(true);

  // Fecha actual y cálculos estables
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);
  const currentMonthStr = useMemo(() => todayStr.slice(0, 7), [todayStr]);
  const todayMoonInfo = useMemo(() => getMoonPhaseInfo(today), [today]);

  // Estado del formulario de factura (para crear y editar)
  const [invoiceForm, setInvoiceForm] = useState({
    id: null,
    invoiceNumber: generateNextInvoiceNumber(),
    date: todayStr,
    clientId: prefilledClient ? prefilledClient.id : '',
    clientName: prefilledClient ? prefilledClient.name : '',
    clientPhone: prefilledClient ? prefilledClient.phone : '',
    clientAddress: prefilledClient ? prefilledClient.address : '',
    items: [
      {
        id: 'item-1',
        description: prefilledClient ? `Servicio de injerto: ${prefilledClient.treeTypes}` : 'Servicio de injerto de árboles frutales',
        quantity: 1,
        unitPrice: prefilledClient?.estimatedPrice || 150,
        total: prefilledClient?.estimatedPrice || 150
      }
    ],
    subtotal: prefilledClient?.estimatedPrice || 150,
    igicRate: settings.igicRate || 7,
    igicAmount: Math.round(((prefilledClient?.estimatedPrice || 150) * (settings.igicRate || 7) / 100) * 100) / 100,
    total: Math.round(((prefilledClient?.estimatedPrice || 150) * (1 + (settings.igicRate || 7) / 100)) * 100) / 100,
    notes: 'Trabajo garantizado. Retirada de bolsas recomendada a los 30 días.',
    paymentMethod: 'Bizum / Transferencia',
    status: 'pendiente'
  });

  // Recalcula subtotales e IGIC (Memoizado para evitar recreación)
  const recalcTotals = useCallback((items, igicRate) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const igicAmount = Math.round((subtotal * (Number(igicRate) || 0) / 100) * 100) / 100;
    const total = Math.round((subtotal + igicAmount) * 100) / 100;
    setInvoiceForm(prev => ({
      ...prev,
      subtotal,
      igicRate,
      igicAmount,
      total
    }));
  }, []);

  // Abre el formulario de Crear Factura
  const handleOpenCreateModal = useCallback(() => {
    setInvoiceForm({
      id: null,
      invoiceNumber: generateNextInvoiceNumber(),
      date: todayStr,
      clientId: '',
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      items: [
        {
          id: 'item-' + Date.now(),
          description: 'Servicio de injerto de árboles frutales (Canarias)',
          quantity: 1,
          unitPrice: 120,
          total: 120
        }
      ],
      subtotal: 120,
      igicRate: settings.igicRate || 7,
      igicAmount: 8.4,
      total: 128.4,
      notes: 'Garantía de prendimiento según condiciones agronómicas.',
      paymentMethod: 'Bizum / Transferencia',
      status: 'pendiente'
    });
    setModalMode('create');
  }, [todayStr, settings.igicRate]);

  // Abre el formulario de Ver Factura
  const handleOpenViewModal = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setModalMode('view');
  }, []);

  // Abre el formulario de Editar Factura
  const handleOpenEditModal = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceForm({
      ...invoice,
      items: invoice.items.map(it => ({ ...it }))
    });
    setModalMode('edit');
  }, []);

  // Abre el formulario/modal de Eliminar Factura
  const handleOpenDeleteModal = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setModalMode('delete');
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setSelectedInvoice(null);
    if (clearPrefilledClient) clearPrefilledClient();
  }, [clearPrefilledClient]);

  // Manejo de tecla Escape para cerrar modales según ui-ux-pro-max
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalMode) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalMode, handleCloseModal]);

  // Selección automática de cliente existente en el selector
  const handleClientSelectChange = useCallback((clientId) => {
    if (!clientId) {
      setInvoiceForm(prev => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientPhone: '',
        clientAddress: ''
      }));
      return;
    }
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setInvoiceForm(prev => {
        const nextItems = prev.items.length === 1 && prev.items[0].description.includes('Servicio de injerto')
          ? [{
              ...prev.items[0],
              description: `Servicio de injerto: ${found.treeTypes}`,
              unitPrice: found.paidAmount || found.estimatedPrice || prev.items[0].unitPrice,
              total: (found.paidAmount || found.estimatedPrice || prev.items[0].unitPrice) * prev.items[0].quantity
            }]
          : prev.items;

        const subtotal = nextItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const igicAmount = Math.round((subtotal * (Number(prev.igicRate || 7) / 100)) * 100) / 100;
        const total = Math.round((subtotal + igicAmount) * 100) / 100;

        return {
          ...prev,
          clientId: found.id,
          clientName: found.name,
          clientPhone: found.phone,
          clientAddress: found.address,
          items: nextItems,
          subtotal,
          igicAmount,
          total
        };
      });
    }
  }, [clients]);

  const handleItemChange = useCallback((index, field, value) => {
    setInvoiceForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = Number(updated[index].quantity) || 0;
        const p = Number(updated[index].unitPrice) || 0;
        updated[index].total = Math.round((q * p) * 100) / 100;
      }
      const subtotal = updated.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
      const igicAmount = Math.round((subtotal * (Number(prev.igicRate || 7) / 100)) * 100) / 100;
      const total = Math.round((subtotal + igicAmount) * 100) / 100;
      return {
        ...prev,
        items: updated,
        subtotal,
        igicAmount,
        total
      };
    });
  }, []);

  const handleAddItem = useCallback(() => {
    const newItem = {
      id: 'item-' + Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setInvoiceForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
  }, []);

  const handleRemoveItem = useCallback((index) => {
    setInvoiceForm(prev => {
      if (prev.items.length <= 1) return prev;
      const updated = prev.items.filter((_, i) => i !== index);
      const subtotal = updated.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
      const igicAmount = Math.round((subtotal * (Number(prev.igicRate || 7) / 100)) * 100) / 100;
      const total = Math.round((subtotal + igicAmount) * 100) / 100;
      return {
        ...prev,
        items: updated,
        subtotal,
        igicAmount,
        total
      };
    });
  }, []);

  const handleSaveSubmit = useCallback((e) => {
    e.preventDefault();
    onSaveInvoice(invoiceForm);
    handleCloseModal();
  }, [invoiceForm, onSaveInvoice, handleCloseModal]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedInvoice) {
      onDeleteInvoice(selectedInvoice.id);
      handleCloseModal();
    }
  }, [selectedInvoice, onDeleteInvoice, handleCloseModal]);

  // =========================================================================
  // MÉTRICAS Y GLOSARIO OPTIMIZADOS CON useMemo (vercel-react-best-practices):
  // 1. Facturado en ese día (Hoy)
  // 2. Facturado en período de Luna Menguante (cuando únicamente se injerta)
  // 3. Facturado en el mes actual
  // 4. Pendiente de cobro
  // =========================================================================
  const { totalBilled, totalPaid, totalPendingInvoices } = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let pending = 0;
    for (let i = 0; i < invoices.length; i++) {
      const t = Number(invoices[i].total) || 0;
      billed += t;
      if (invoices[i].status === 'pagada') paid += t;
      else if (invoices[i].status === 'pendiente') pending += t;
    }
    return { totalBilled: billed, totalPaid: paid, totalPendingInvoices: pending };
  }, [invoices]);

  // 1. Facturado en ese día (Hoy)
  const { todayInvoices, billedToday, paidToday } = useMemo(() => {
    const list = invoices.filter(inv => inv.date === todayStr);
    let billed = 0;
    let paid = 0;
    for (let i = 0; i < list.length; i++) {
      const t = Number(list[i].total) || 0;
      billed += t;
      if (list[i].status === 'pagada') paid += t;
    }
    return { todayInvoices: list, billedToday: billed, paidToday: paid };
  }, [invoices, todayStr]);

  // 2. Facturado en Período de Luna Menguante (Caché de fechas)
  const { waningInvoices, billedInWaningMoon, waningPercent } = useMemo(() => {
    const list = invoices.filter(inv => {
      const dateObj = new Date(inv.date + 'T12:00:00');
      return isWaningMoon(dateObj);
    });
    const billed = list.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const percent = totalBilled > 0 ? Math.round((billed / totalBilled) * 100) : 0;
    return { waningInvoices: list, billedInWaningMoon: billed, waningPercent: percent };
  }, [invoices, totalBilled]);

  // 3. Facturado en el Mes Actual
  const { monthInvoices, billedThisMonth } = useMemo(() => {
    const list = invoices.filter(inv => inv.date && inv.date.startsWith(currentMonthStr));
    const billed = list.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    return { monthInvoices: list, billedThisMonth: billed };
  }, [invoices, currentMonthStr]);

  // 4. Clientes completados con pago pendiente en finca y Total Pendiente
  const { clientsPendingPayment, totalPendingGlobal } = useMemo(() => {
    const pendingClients = clients.filter(c => c.status === 'completado' && c.paymentStatus === 'pendiente');
    const pendingAmount = pendingClients.reduce((sum, c) => sum + (Number(c.paidAmount) || Number(c.estimatedPrice) || 0), 0);
    return {
      clientsPendingPayment: pendingClients,
      totalPendingGlobal: totalPendingInvoices + pendingAmount
    };
  }, [clients, totalPendingInvoices]);

  // Filtrar facturas para la tabla memoizado
  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return invoices.filter(inv => {
      if (q) {
        const matchesQ = 
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          (inv.clientPhone && inv.clientPhone.includes(q));
        if (!matchesQ) return false;
      }
      if (statusFilter === 'pagada') return inv.status === 'pagada';
      if (statusFilter === 'pendiente') return inv.status === 'pendiente';
      if (statusFilter === 'menguante') {
        const dateObj = new Date(inv.date + 'T12:00:00');
        return isWaningMoon(dateObj);
      }
      return true;
    });
  }, [invoices, searchQuery, statusFilter]);

  return (
    <div className="invoicing-view">
      {/* Cabecera con Navegación y Botón de Crear Factura */}
      <div className="calendar-page-header">
        <button className="back-nav-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver al Menú
        </button>

        {/* Requisito: Formulario para crear facturas */}
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          Crear Nueva Factura
        </button>
      </div>

      {/* =========================================================================
          PANEL DE MÉTRICAS ECONÓMICAS Y LUNARES (SOLICITADO POR EL USUARIO)
         ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* TARJETA 1: FACTURADO HOY (EN ESE DÍA) */}
        <div style={{
          background: '#ffffff',
          padding: '18px 20px',
          borderRadius: '16px',
          border: '1.5px solid #dbe4dc',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#1b4332', textTransform: 'uppercase', fontWeight: 800 }}>
              📅 Facturado Hoy ({new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})
            </span>
            {todayMoonInfo.isWaning && (
              <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#d90429', padding: '2px 6px', borderRadius: '9999px', fontWeight: 700 }}>
                ⭕ Menguante
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
            {billedToday.toFixed(2)} €
          </div>
          <div style={{ fontSize: '0.8rem', color: '#526359', marginTop: '2px' }}>
            {todayInvoices.length} servicio(s) hoy • <strong>{paidToday.toFixed(2)} €</strong> cobrados
          </div>
        </div>

        {/* TARJETA 2: FACTURADO EN PERÍODO DE LUNA MENGUANTE */}
        <div style={{
          background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)',
          padding: '18px 20px',
          borderRadius: '16px',
          border: '2px solid #ef233c',
          boxShadow: '0 4px 14px rgba(239, 35, 60, 0.15)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#b70928', textTransform: 'uppercase', fontWeight: 800 }}>
              🌘 En Luna Menguante
            </span>
            <span style={{ fontSize: '0.72rem', background: '#d90429', color: '#ffffff', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
              {waningPercent}% del total
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b70928', marginTop: '4px' }}>
            {billedInWaningMoon.toFixed(2)} €
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '2px' }}>
            {waningInvoices.length} facturas emitidas en días con savia baja idónea
          </div>
        </div>

        {/* TARJETA 3: FACTURADO EN EL MES */}
        <div style={{
          background: '#ffffff',
          padding: '18px 20px',
          borderRadius: '16px',
          border: '1.5px solid #dbe4dc',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#2d6a4f', textTransform: 'uppercase', fontWeight: 800 }}>
            🗓️ Mes en Curso ({new Date().toLocaleString('es-ES', { month: 'long' })})
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2d6a4f', marginTop: '4px' }}>
            {billedThisMonth.toFixed(2)} €
          </div>
          <div style={{ fontSize: '0.8rem', color: '#526359', marginTop: '2px' }}>
            Total acumulado este mes ({monthInvoices.length} facturas)
          </div>
        </div>

        {/* TARJETA 4: PENDIENTE DE PAGO / COBRO */}
        <div style={{
          background: '#ffffff',
          padding: '18px 20px',
          borderRadius: '16px',
          border: '1.5px solid #fecaca',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#d90429', textTransform: 'uppercase', fontWeight: 800 }}>
            ⏳ Pendiente de Pago
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d90429', marginTop: '4px' }}>
            {totalPendingGlobal.toFixed(2)} €
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
            {invoices.filter(i => i.status === 'pendiente').length} facturas + {clientsPendingPayment.length} clientes en finca
          </div>
        </div>
      </div>

      {/* =========================================================================
          GLOSARIO EXPLICATIVO DE FACTURACIÓN Y LUNA MENGUANTE
          Requisito explícito solicitado por el usuario
         ========================================================================= */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #dbe4dc',
        borderRadius: '18px',
        marginBottom: '22px',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <button 
          type="button"
          aria-expanded={isGlossaryOpen}
          aria-controls="agricultural-glossary"
          onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #f0f7f3 0%, #e3ede6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: 'none',
            borderBottom: isGlossaryOpen ? '1px solid #dbe4dc' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="#1b4332" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1b4332' }}>
              Glosario Agronómico de Facturación & Calendario de Injertos
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#2d6a4f', fontWeight: 700 }}>
            <span>{isGlossaryOpen ? 'Ocultar Glosario' : 'Mostrar Glosario'}</span>
            {isGlossaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {isGlossaryOpen && (
          <div id="agricultural-glossary" role="region" aria-label="Glosario agronómico de facturación" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Término 1: Luna Menguante */}
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fed7aa',
              borderLeft: '4px solid #ef233c',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 800, color: '#b70928', fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🌘</span> Período de Luna Menguante (Savia Baja)
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.45 }}>
                En la tradición agrícola de las <strong>Islas Canarias</strong>, el injerto se ejecuta <em>únicamente en luna menguante</em>. En esta fase la savia de los árboles desciende a las raíces, evitando que el corte "llore" savia en exceso y garantizando que el patrón y la púa se suelden con éxito (prendimiento superior al 95%). Por eso, la máxima facturación debe concentrarse en estos días marcados con círculo rojo en el calendario.
              </p>
            </div>

            {/* Término 2: Facturado en el Día */}
            <div style={{
              background: '#f8faf8',
              border: '1px solid #dbe4dc',
              borderLeft: '4px solid #1b4332',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 800, color: '#1b4332', fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📅</span> Facturación Diaria (Cobro en el Día)
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.45 }}>
                Refleja los ingresos liquidados o facturas fechadas en la jornada de hoy. Permite al injertador llevar el arqueo exacto de efectivo o transferencias/Bizum recibidos al finalizar el trabajo en la finca de cada cliente.
              </p>
            </div>

            {/* Término 3: Retirada con Delicadeza de Bolsas 30 Días */}
            <div style={{
              background: '#fffbf0',
              border: '1px solid #fed7aa',
              borderLeft: '4px solid #d49a37',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎒</span> Retirada con Delicadeza de Bolsas (30 Días)
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.45 }}>
                Al cumplirse los <strong>30 días</strong> del injerto, el sistema genera el aviso para informar al cliente de que <strong>ya puede retirar con delicadeza las bolsas protectoras de sus árboles</strong>. Es fundamental advertirle de que lo haga con sumo cuidado para no quebrar ni dañar las yemas y brotes tiernos recién prendidos.
              </p>
            </div>

            {/* Término 4: Pendiente de Cobro */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderLeft: '4px solid #d90429',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⏳</span> Servicios con Cobro Pendiente
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.45 }}>
                Servicios de injerto ya realizados pero que quedan pendientes de cobro (por ejemplo, clientes que abonan tras revisar el prendimiento a los 30 días o mediante transferencia bancaria aplazada).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, minWidth: '240px' }}
          placeholder="Buscar por nº de factura, cliente o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            Todas ({invoices.length})
          </button>
          <button
            className={`btn ${statusFilter === 'menguante' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('menguante')}
            style={statusFilter === 'menguante' ? { background: '#d90429' } : {}}
          >
            🌘 En Menguante ({waningInvoices.length})
          </button>
          <button
            className={`btn ${statusFilter === 'pendiente' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('pendiente')}
          >
            Pendientes
          </button>
          <button
            className={`btn ${statusFilter === 'pagada' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('pagada')}
          >
            Pagadas
          </button>
        </div>
      </div>

      {/* TABLA / LISTA DE FACTURAS */}
      <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #dbe4dc', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {filteredInvoices.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
            <Receipt size={40} color="#a3c4b0" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No hay facturas registradas en este filtro</p>
            <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Haga clic en "Crear Nueva Factura" para emitir una.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: '#f8faf8', borderBottom: '2px solid #dbe4dc', color: '#1b4332', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Nº Factura</th>
                  <th style={{ padding: '14px 18px' }}>Fecha & Luna</th>
                  <th style={{ padding: '14px 18px' }}>Cliente</th>
                  <th style={{ padding: '14px 18px' }}>Importe Total</th>
                  <th style={{ padding: '14px 18px' }}>Estado</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const dateObj = new Date(inv.date + 'T12:00:00');
                  const isWaning = isWaningMoon(dateObj);

                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #edf2ee' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1b4332' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#526359' }}>
                        <div>
                          {dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        {isWaning ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#fee2e2',
                            color: '#b70928',
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            marginTop: '2px',
                            border: '1px solid #ef233c'
                          }}>
                            ⭕ Menguante
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#82948a' }}>
                            Fuera de menguante
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700 }}>{inv.clientName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{inv.clientPhone}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#1b4332', fontSize: '1rem' }}>
                        {Number(inv.total).toFixed(2)} €
                        <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 400 }}>
                          (Subt: {Number(inv.subtotal).toFixed(2)} € + IGIC)
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`graft-status-badge ${inv.status === 'pagada' ? 'completed' : 'pending'}`} style={{ fontSize: '0.78rem' }}>
                          {inv.status === 'pagada' ? '✓ Pagada' : '⏳ Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* 1. Botón Ver Factura */}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleOpenViewModal(inv)}
                            aria-label={`Ver e imprimir factura ${inv.invoiceNumber} de ${inv.clientName}`}
                            title="Formulario para Ver / Imprimir Factura"
                          >
                            <Eye size={15} /> Ver
                          </button>

                          {/* 2. Botón Editar Factura */}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleOpenEditModal(inv)}
                            aria-label={`Editar factura ${inv.invoiceNumber} de ${inv.clientName}`}
                            title="Formulario para Editar Factura"
                          >
                            <Edit3 size={15} /> Editar
                          </button>

                          {/* 3. Botón Eliminar Factura */}
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleOpenDeleteModal(inv)}
                            aria-label={`Eliminar factura ${inv.invoiceNumber} de ${inv.clientName}`}
                            title="Formulario para Eliminar Factura"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1 & 3: FORMULARIO PARA CREAR FACTURA Y EDITAR FACTURA
          Requisito explícito de Guia_Developed.md
         ========================================================================= */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div 
            className="modal-window" 
            style={{ maxWidth: '750px' }} 
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-invoice-title"
          >
            <div className="modal-header">
              <h3 id="modal-invoice-title">{modalMode === 'create' ? 'Crear Nueva Factura' : 'Editar Factura Existente'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar modal de factura">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit}>
              <div className="modal-body">
                {/* Datos Principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Número de Factura *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={invoiceForm.invoiceNumber}
                      onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Emisión *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={invoiceForm.date}
                      onChange={e => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado de Cobro</label>
                    <select
                      className="form-select"
                      value={invoiceForm.status}
                      onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                    >
                      <option value="pendiente">Pendiente de Cobro</option>
                      <option value="pagada">Pagada</option>
                    </select>
                  </div>
                </div>

                {/* Selección o datos del cliente */}
                <div style={{ background: '#f8faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dbe4dc', marginBottom: '18px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1b4332', marginBottom: '10px' }}>
                    Datos del Cliente / Destinatario
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seleccionar de la lista de clientes (Opcional)</label>
                    <select
                      className="form-select"
                      value={invoiceForm.clientId}
                      onChange={e => handleClientSelectChange(e.target.value)}
                    >
                      <option value="">-- Cliente libre / Introducir manualmente --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.phone} ({c.treeTypes})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Nombre del Cliente *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nombre completo o razón social"
                        value={invoiceForm.clientName}
                        onChange={e => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Ej. 611 234 567"
                        value={invoiceForm.clientPhone}
                        onChange={e => setInvoiceForm({ ...invoiceForm, clientPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Dirección / Finca</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dirección completa del servicio"
                      value={invoiceForm.clientAddress}
                      onChange={e => setInvoiceForm({ ...invoiceForm, clientAddress: e.target.value })}
                    />
                  </div>
                </div>

                {/* Conceptos / Líneas de Factura */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Líneas de Detalle / Conceptos *</label>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={handleAddItem}
                    >
                      + Añadir Concepto
                    </button>
                  </div>

                  {invoiceForm.items.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 40px',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Descripción del trabajo..."
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        step="0.01"
                        placeholder="Precio €"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                        required
                      />
                      <div style={{ fontWeight: 700, paddingLeft: '8px', fontSize: '0.92rem' }}>
                        {(Number(item.total) || 0).toFixed(2)} €
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d90429',
                          cursor: 'pointer',
                          padding: '6px'
                        }}
                        title="Eliminar línea"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desglose de Totales e Impuesto IGIC de Canarias */}
                <div style={{
                  background: '#f8faf8',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #dbe4dc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Tipo de IGIC Canarias (%)</label>
                      <select
                        className="form-select"
                        style={{ padding: '8px 12px', width: '130px' }}
                        value={invoiceForm.igicRate}
                        onChange={e => recalcTotals(invoiceForm.items, Number(e.target.value))}
                      >
                        <option value="0">0% (Exento)</option>
                        <option value="3">3% (Reducido)</option>
                        <option value="7">7% (General)</option>
                        <option value="15">15% (Incrementado)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Método de Pago</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '8px 12px' }}
                        value={invoiceForm.paymentMethod}
                        onChange={e => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', color: '#526359' }}>
                      Subtotal: <strong>{Number(invoiceForm.subtotal).toFixed(2)} €</strong>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#526359' }}>
                      IGIC ({invoiceForm.igicRate}%): <strong>{Number(invoiceForm.igicAmount).toFixed(2)} €</strong>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                      TOTAL: {Number(invoiceForm.total).toFixed(2)} €
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '14px', marginBottom: 0 }}>
                  <label className="form-label">Notas al pie de factura / Garantías</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceForm.notes}
                    onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  {modalMode === 'create' ? 'Emitir Factura' : 'Guardar Cambios de Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: FORMULARIO PARA VER FACTURA (VISTA PREVIA E IMPRESIÓN PDF)
          Requisito explícito de Guia_Developed.md
         ========================================================================= */}
      {modalMode === 'view' && selectedInvoice && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div 
            className="modal-window" 
            style={{ maxWidth: '800px' }} 
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-view-title"
          >
            <div className="modal-header">
              <h3 id="modal-view-title">Factura {selectedInvoice.invoiceNumber}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  onClick={() => window.print()}
                  aria-label="Imprimir factura o guardar como PDF"
                >
                  <Printer size={16} /> Imprimir / PDF
                </button>
                <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar vista de factura">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* Hoja de factura oficial lista para el cliente */}
              <div className="invoice-preview-sheet">
                <div className="inv-sheet-header">
                  <div>
                    <h2 style={{ fontSize: '1.6rem', color: '#1b4332', marginBottom: '4px' }}>
                      {settings.businessName || 'Servicios Agrícolas & Injertos Canarias'}
                    </h2>
                    <div style={{ fontSize: '0.88rem', color: '#526359', lineHeight: 1.4 }}>
                      <div>{settings.businessOwner || 'Injertador Especialista'} • CIF/NIF: {settings.cif || 'B-38992144'}</div>
                      <div>{settings.address || 'Islas Canarias'}</div>
                      <div>Tel: {settings.phone || '+34 622 34 56 78'}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b4332' }}>
                      FACTURA
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d90429' }}>
                      {selectedInvoice.invoiceNumber}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#526359', marginTop: '4px' }}>
                      Fecha: {new Date(selectedInvoice.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span className={`graft-status-badge ${selectedInvoice.status === 'pagada' ? 'completed' : 'pending'}`}>
                        {selectedInvoice.status === 'pagada' ? 'PAGADA' : 'PENDIENTE DE PAGO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Datos del Cliente */}
                <div style={{
                  background: '#f8faf8',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #dbe4dc',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#526359', fontWeight: 700 }}>
                    Facturado a:
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1b4332', marginTop: '2px' }}>
                    {selectedInvoice.clientName}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#2d6a4f' }}>
                    📞 {selectedInvoice.clientPhone}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#526359' }}>
                    📍 {selectedInvoice.clientAddress}
                  </div>
                </div>

                {/* Tabla de Conceptos */}
                <table className="inv-sheet-table">
                  <thead>
                    <tr>
                      <th style={{ width: '55%' }}>Descripción del Trabajo / Servicio</th>
                      <th style={{ textAlign: 'center' }}>Cant.</th>
                      <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.description}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{Number(item.unitPrice).toFixed(2)} €</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{Number(item.total).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cuadro de Totales */}
                <div className="inv-totals-box">
                  <div className="inv-total-row">
                    <span>Base Imponible / Subtotal:</span>
                    <strong>{Number(selectedInvoice.subtotal).toFixed(2)} €</strong>
                  </div>
                  <div className="inv-total-row">
                    <span>IGIC ({selectedInvoice.igicRate}%):</span>
                    <strong>{Number(selectedInvoice.igicAmount).toFixed(2)} €</strong>
                  </div>
                  <div className="inv-total-row grand-total">
                    <span>TOTAL FACTURA:</span>
                    <span>{Number(selectedInvoice.total).toFixed(2)} €</span>
                  </div>
                </div>

                {/* Notas y Método de Pago */}
                <div style={{
                  marginTop: '28px',
                  paddingTop: '16px',
                  borderTop: '1px solid #dbe4dc',
                  fontSize: '0.85rem',
                  color: '#526359',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <strong>Método de pago:</strong> {selectedInvoice.paymentMethod}
                    <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                      {selectedInvoice.notes}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#1b4332' }}>Firma / Sello Injertador</div>
                    <div style={{ marginTop: '20px', borderBottom: '1px solid #1b4332', width: '150px' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={18} /> Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: FORMULARIO PARA ELIMINAR FACTURA
          Requisito explícito de Guia_Developed.md
         ========================================================================= */}
      {modalMode === 'delete' && selectedInvoice && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div 
            className="modal-window" 
            style={{ maxWidth: '480px' }} 
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-del-title"
          >
            <div className="modal-header">
              <h3 id="modal-del-title" style={{ color: '#d90429' }}>Eliminar Factura</h3>
              <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar modal de eliminación">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.98rem', marginBottom: '14px' }}>
                ¿Está completamente seguro de que desea eliminar permanentemente la siguiente factura?
              </p>

              <div style={{
                background: '#fff1f2',
                border: '1.5px solid #ffa39e',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.9rem'
              }}>
                <div><strong>Nº Factura:</strong> {selectedInvoice.invoiceNumber}</div>
                <div><strong>Cliente:</strong> {selectedInvoice.clientName}</div>
                <div><strong>Fecha:</strong> {selectedInvoice.date}</div>
                <div><strong>Importe:</strong> {Number(selectedInvoice.total).toFixed(2)} €</div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '14px' }}>
                Esta acción borrará la factura de la base de datos de la aplicación.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={18} /> Sí, Eliminar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

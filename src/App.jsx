import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import DashboardHome from './components/DashboardHome';
import CalendarView from './components/CalendarView';
import GraftListView from './components/GraftListView';
import GraftFormModal from './components/GraftFormModal';
import CompleteServiceModal from './components/CompleteServiceModal';
import BagRemindersView from './components/BagRemindersView';
import InvoicingView from './components/InvoicingView';
import SettingsModal from './components/SettingsModal';
import BottomNav from './components/BottomNav';
import { 
  getDatabase, 
  checkAuthSession, 
  logoutUser, 
  saveClient, 
  completeClientService, 
  deleteClient, 
  saveInvoice, 
  deleteInvoice, 
  toggleBagReminderDone, 
  updateSettings,
  getBagReminders
} from './utils/storage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuthSession());
  const [currentView, setCurrentView] = useState('home'); // 'home', 'calendar', 'grafts', 'grafts-completed', 'bags', 'invoices'

  // Datos de la base de datos persistente
  const [database, setDatabase] = useState(() => getDatabase());

  // Estados de modales y asistentes
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientToComplete, setClientToComplete] = useState(null);
  const [presetDateForNewClient, setPresetDateForNewClient] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [prefilledClientForInvoice, setPrefilledClientForInvoice] = useState(null);

  // Mensaje de notificación flotante (Toast)
  const [notification, setNotification] = useState(null);

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const reloadDatabase = () => {
    setDatabase(getDatabase());
  };

  // Recordatorios calculados
  const bagReminders = getBagReminders();
  const pendingBagsCount = bagReminders.filter(b => !b.isDone && b.diffDays <= 0).length || bagReminders.filter(b => !b.isDone).length;

  // Handlers para Clientes e Injertos
  const handleSaveClient = (clientData) => {
    const isEdit = Boolean(clientData.id);
    saveClient(clientData);
    reloadDatabase();
    showNotification(isEdit ? 'Datos del cliente actualizados con éxito' : 'Nuevo cliente registrado correctamente');
    setClientToEdit(null);
    setPresetDateForNewClient(null);
  };

  /**
   * Abre el modal interactivo de cobro al completar servicio
   */
  const handleOpenCompleteClientModal = (client) => {
    setClientToComplete(client);
  };

  /**
   * Confirma la finalización del servicio registrando cobro y aviso de bolsas a 30 días
   */
  const handleConfirmCompleteClient = (clientId, completionData) => {
    completeClientService(clientId, completionData);
    reloadDatabase();
    const isPaid = completionData.paymentStatus === 'pagado';
    showNotification(
      `¡Servicio completado! ${isPaid ? `Cobrado: ${completionData.paidAmount.toFixed(2)} €` : 'Queda pendiente de cobro'}. Aviso de 30 días para bolsas activado.`,
      'success'
    );
    setClientToComplete(null);
  };

  const handleDeleteClient = (clientId, clientName) => {
    if (window.confirm(`¿Está seguro de eliminar el registro de "${clientName}"?`)) {
      deleteClient(clientId);
      reloadDatabase();
      showNotification('Registro de cliente eliminado');
    }
  };

  const handleEditClient = (client) => {
    setClientToEdit(client);
    setIsNewClientModalOpen(true);
  };

  // Programar cita desde un día del calendario
  const handleScheduleForDate = (dateString) => {
    setClientToEdit(null);
    setPresetDateForNewClient(dateString);
    setIsNewClientModalOpen(true);
  };

  // Crear factura a partir de cliente
  const handleCreateInvoiceFromClient = (client) => {
    setPrefilledClientForInvoice(client);
    setCurrentView('invoices');
  };

  // Handlers para Facturas
  const handleSaveInvoice = (invoiceData) => {
    saveInvoice(invoiceData);
    reloadDatabase();
    showNotification(`Factura ${invoiceData.invoiceNumber} guardada correctamente`);
  };

  const handleDeleteInvoice = (invoiceId) => {
    deleteInvoice(invoiceId);
    reloadDatabase();
    showNotification('Factura eliminada de la base de datos');
  };

  // Handlers para Avisos de Bolsas
  const handleToggleReminderDone = (clientId, isDone) => {
    toggleBagReminderDone(clientId, isDone);
    reloadDatabase();
    showNotification(isDone ? 'Aviso marcado como realizado' : 'Aviso reactivado');
  };

  // Handlers para Ajustes
  const handleSaveSettings = (newSettings) => {
    updateSettings(newSettings);
    reloadDatabase();
  };

  // Autenticación
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  // Si no está autenticado, renderizar la pantalla de login securizada
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-wrapper">
      {/* Notificación Toast flotante */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: notification.type === 'success' ? '#1b4332' : '#d90429',
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.92rem',
          fontWeight: 600,
          animation: 'fadeIn 0.25s ease'
        }}>
          <span>{notification.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        pendingBagsCount={pendingBagsCount}
      />

      {/* Contenido Principal según la vista seleccionada */}
      <main className="main-content">
        {/* VISTA 1: MENÚ DE INICIO (BOTONES CUADRADOS EN COLUMNAS DE DOS) */}
        {currentView === 'home' && (
          <DashboardHome
            onNavigate={setCurrentView}
            clients={database.clients}
            invoices={database.invoices}
            bagReminders={bagReminders}
            onOpenNewClientModal={() => {
              setClientToEdit(null);
              setPresetDateForNewClient(null);
              setIsNewClientModalOpen(true);
            }}
          />
        )}

        {/* VISTA 2: CALENDARIO LUNAR (MES ACTUAL Y SIGUIENTE CON CÍRCULO ROJO) */}
        {currentView === 'calendar' && (
          <CalendarView
            onBack={() => setCurrentView('home')}
            clients={database.clients}
            onScheduleForDate={handleScheduleForDate}
          />
        )}

        {/* VISTA 3: LISTA DE INJERTOS (TÍTULO CON NOMBRE Y TELÉFONO) */}
        {(currentView === 'grafts' || currentView === 'grafts-completed') && (
          <GraftListView
            onBack={() => setCurrentView('home')}
            clients={database.clients}
            onAddNewClient={() => {
              setClientToEdit(null);
              setPresetDateForNewClient(null);
              setIsNewClientModalOpen(true);
            }}
            onEditClient={handleEditClient}
            onCompleteClient={handleOpenCompleteClientModal}
            onDeleteClient={handleDeleteClient}
            onCreateInvoiceFromClient={handleCreateInvoiceFromClient}
            initialTab={currentView === 'grafts-completed' ? 'completados' : 'pendientes'}
          />
        )}

        {/* VISTA 4: AVISOS DE RETIRADA DE BOLSAS (30 DÍAS) */}
        {currentView === 'bags' && (
          <BagRemindersView
            onBack={() => setCurrentView('home')}
            bagReminders={bagReminders}
            onToggleReminderDone={handleToggleReminderDone}
          />
        )}

        {/* VISTA 5: SISTEMA DE FACTURACIÓN (4 MODALES: CREAR, VER, EDITAR, ELIMINAR + GLOSARIO Y MÉTRICAS) */}
        {currentView === 'invoices' && (
          <InvoicingView
            onBack={() => setCurrentView('home')}
            invoices={database.invoices}
            clients={database.clients}
            settings={database.settings}
            onSaveInvoice={handleSaveInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            prefilledClient={prefilledClientForInvoice}
            clearPrefilledClient={() => setPrefilledClientForInvoice(null)}
          />
        )}
      </main>

      {/* Modal para Crear y Editar Cliente e Injerto */}
      <GraftFormModal
        isOpen={isNewClientModalOpen}
        onClose={() => {
          setIsNewClientModalOpen(false);
          setClientToEdit(null);
          setPresetDateForNewClient(null);
        }}
        onSave={handleSaveClient}
        initialData={clientToEdit}
        presetDate={presetDateForNewClient}
      />

      {/* Modal interactivo de Finalización y Cobro de Servicio */}
      <CompleteServiceModal
        isOpen={Boolean(clientToComplete)}
        onClose={() => setClientToComplete(null)}
        client={clientToComplete}
        onConfirm={handleConfirmCompleteClient}
      />

      {/* Modal para Ajustes de Administrador y Empresa */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={database.settings}
        onSaveSettings={handleSaveSettings}
        onReloadDatabase={reloadDatabase}
      />

      {/* Barra de Navegación Inferior para Móviles */}
      <BottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewClient={() => {
          setClientToEdit(null);
          setPresetDateForNewClient(null);
          setIsNewClientModalOpen(true);
        }}
        pendingBagsCount={pendingBagsCount}
      />
    </div>
  );
}

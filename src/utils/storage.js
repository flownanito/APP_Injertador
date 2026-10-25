/**
 * Almacenamiento persistente en localStorage para la aplicación Injertador
 * Gestiona clientes, citas de injerto, facturas, avisos de retirada de bolsas y seguridad
 */

const STORAGE_KEY = 'injertador_db_v1';
const AUTH_KEY = 'injertador_auth_session';

// Datos iniciales de demostración contextualizados en las Islas Canarias
const INITIAL_DATA = {
  settings: {
    businessName: 'Servicios Agrícolas & Injertos Canarias',
    businessOwner: 'Administrador / Injertador Oficial',
    cif: 'B-38992144',
    phone: '+34 622 34 56 78',
    email: 'contacto@injertadorcanarias.com',
    address: 'Camino Real de la Cumbre, s/n, Tenerife / Gran Canaria',
    igicRate: 7, // 7% IGIC general o 0% exento agrícola
    passwordHash: 'antonio1971', // Contraseña por defecto securizable
  },
  clients: [
    {
      id: 'cli-001',
      name: 'Manuel González Rivero',
      phone: '611 234 567',
      address: 'Finca Las Breñas, Barranco Hondo, Candelaria',
      treeTypes: 'Aguacates Hass (Púa sobre patrón Antillano)',
      serviceDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), // en 2 días
      status: 'pendiente',
      notes: 'Traer púas seleccionadas. Finca con acceso para furgoneta. Aproximadamente 45 árboles.',
      estimatedPrice: 350,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'cli-002',
      name: 'Carmen Rosa Santana',
      phone: '622 890 123',
      address: 'Camino del Palmar 14, Telde',
      treeTypes: 'Cítricos (Limonero Eureka y Naranjo Washington Navel)',
      serviceDate: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10), // Completado hace 10 días
      status: 'completado',
      notes: 'Injerto de escudete en 20 patrones de naranjo amargo.',
      estimatedPrice: 180,
      completedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      // Aviso generado para 30 días después de la fecha de completado
      bagReminderDate: new Date(Date.now() - 86400000 * 10 + 86400000 * 30).toISOString().slice(0, 10),
      bagReminderDone: false,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: 'cli-003',
      name: 'Domingo Hernández Mesa',
      phone: '633 456 789',
      address: 'Finca El Rincón, La Orotava',
      treeTypes: 'Mangos (Variedades Gomera 1 y Osteen)',
      serviceDate: new Date().toISOString().slice(0, 10), // Hoy
      status: 'pendiente',
      notes: 'Revisar estado vegetativo de las plantas antes de iniciar el corte.',
      estimatedPrice: 240,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'cli-004',
      name: 'Yeray Morales Dávila',
      phone: '644 112 334',
      address: 'Valle de Guerra, San Cristóbal de La Laguna',
      treeTypes: 'Frutales de Hueso (Ciruelos y Melocotoneros)',
      serviceDate: new Date(Date.now() - 86400000 * 29).toISOString().slice(0, 10), // Hace 29 días (aviso casi inmediato)
      status: 'completado',
      notes: 'Colocadas bolsas plásticas y papel de estraza para proteger del sol.',
      estimatedPrice: 150,
      completedAt: new Date(Date.now() - 86400000 * 29).toISOString(),
      bagReminderDate: new Date(Date.now() - 86400000 * 29 + 86400000 * 30).toISOString().slice(0, 10), // Mañana
      bagReminderDone: false,
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    }
  ],
  invoices: [
    {
      id: 'inv-001',
      invoiceNumber: 'FAC-2026-001',
      date: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
      clientId: 'cli-002',
      clientName: 'Carmen Rosa Santana',
      clientPhone: '622 890 123',
      clientAddress: 'Camino del Palmar 14, Telde',
      items: [
        {
          id: 'item-1',
          description: 'Injerto de cítricos (Limonero Eureka / Naranjo) x 20 uds',
          quantity: 20,
          unitPrice: 8.50,
          total: 170.00
        },
        {
          id: 'item-2',
          description: 'Material de atado, mástic sellador y bolsas protectoras',
          quantity: 1,
          unitPrice: 10.00,
          total: 10.00
        }
      ],
      subtotal: 180.00,
      igicRate: 7,
      igicAmount: 12.60,
      total: 192.60,
      notes: 'Trabajo realizado con garantía de prendimiento.',
      paymentMethod: 'Bizum / Transferencia',
      status: 'pagada',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ]
};

/**
 * Contraseña actual por defecto del sistema
 */
const CURRENT_DEFAULT_PASSWORD = 'antonio1971';

// Contraseñas antiguas que se migran automáticamente a la actual
const LEGACY_PASSWORDS = ['admin123', 'antonio1977'];

/**
 * Obtiene toda la base de datos o la inicializa si no existe
 */
export function getDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);

    // Migración automática: si la contraseña guardada es una de las antiguas
    // por defecto, la actualiza a la contraseña actual sin borrar ningún dato
    if (parsed.settings && LEGACY_PASSWORDS.includes(parsed.settings.passwordHash)) {
      parsed.settings.passwordHash = CURRENT_DEFAULT_PASSWORD;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return {
      settings: { ...INITIAL_DATA.settings, ...(parsed.settings || {}) },
      clients: Array.isArray(parsed.clients) ? parsed.clients : INITIAL_DATA.clients,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : INITIAL_DATA.invoices,
    };
  } catch (e) {
    console.error('Error al cargar base de datos:', e);
    return INITIAL_DATA;
  }
}


/**
 * Guarda el estado completo de la base de datos
 */
export function saveDatabase(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error('Error al guardar en base de datos:', e);
    return false;
  }
}

// ==========================================
// CLIENTES E INJERTOS
// ==========================================

export function getClients() {
  const db = getDatabase();
  return db.clients;
}

export function saveClient(clientData) {
  const db = getDatabase();
  const isEditing = Boolean(clientData.id);

  if (isEditing) {
    const index = db.clients.findIndex(c => c.id === clientData.id);
    if (index !== -1) {
      db.clients[index] = {
        ...db.clients[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    const newClient = {
      ...clientData,
      id: 'cli-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
      status: clientData.status || 'pendiente'
    };
    db.clients.unshift(newClient);
  }

  saveDatabase(db);
  return db.clients;
}

/**
 * Completa un servicio de injerto.
 * Requisito Guia_Developed.md + Solicitud de Cobro:
 * Pide cuánto ha cobrado o si queda pendiente de pago.
 * Añade aviso para dentro de 30 días para retirar las bolsas.
 * Si se solicita, genera la factura automáticamente.
 */
export function completeClientService(clientId, completionDetails = {}) {
  const db = getDatabase();
  const index = db.clients.findIndex(c => c.id === clientId);

  if (index !== -1) {
    const client = db.clients[index];
    const now = new Date();
    // 30 días exactos en el futuro
    const reminderDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const reminderDateString = reminderDate.toISOString().slice(0, 10);

    const paidAmount = Number(completionDetails.paidAmount) || Number(client.estimatedPrice) || 0;
    const paymentStatus = completionDetails.paymentStatus || 'pagado'; // 'pagado' o 'pendiente'
    const paymentMethod = completionDetails.paymentMethod || 'Efectivo';

    db.clients[index] = {
      ...client,
      status: 'completado',
      completedAt: now.toISOString(),
      paidAmount: paidAmount,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      bagReminderDate: reminderDateString,
      bagReminderDone: false
    };

    // Si se activó la generación automática de factura
    if (completionDetails.createInvoice) {
      const igicRate = db.settings.igicRate || 7;
      const subtotal = paidAmount;
      const igicAmount = Math.round((subtotal * (igicRate / 100)) * 100) / 100;
      const total = Math.round((subtotal + igicAmount) * 100) / 100;

      const newInvoice = {
        id: 'inv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        invoiceNumber: generateNextInvoiceNumber(),
        date: now.toISOString().slice(0, 10),
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        clientAddress: client.address,
        items: [
          {
            id: 'item-comp-' + Date.now(),
            description: `Servicio de injerto completado: ${client.treeTypes}`,
            quantity: 1,
            unitPrice: paidAmount,
            total: paidAmount
          }
        ],
        subtotal: subtotal,
        igicRate: igicRate,
        igicAmount: igicAmount,
        total: total,
        notes: `Injerto completado el ${now.toLocaleDateString('es-ES')}. Recordatorio de retirada de bolsas: 30 días.`,
        paymentMethod: paymentMethod,
        status: paymentStatus === 'pagado' ? 'pagada' : 'pendiente',
        createdAt: now.toISOString()
      };

      db.invoices.unshift(newInvoice);
    }

    saveDatabase(db);
  }

  return db.clients;
}

export function deleteClient(clientId) {
  const db = getDatabase();
  db.clients = db.clients.filter(c => c.id !== clientId);
  saveDatabase(db);
  return db.clients;
}

/**
 * Obtiene los avisos de retirada de bolsas generados por servicios completados
 */
export function getBagReminders() {
  const db = getDatabase();
  const todayStr = new Date().toISOString().slice(0, 10);

  return db.clients
    .filter(c => c.status === 'completado' && c.bagReminderDate)
    .map(c => {
      const reminderDate = new Date(c.bagReminderDate);
      const today = new Date(todayStr);
      const diffTime = reminderDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        client: c,
        reminderDate: c.bagReminderDate,
        diffDays, // Si <= 0, ya está en plazo o vencido
        isDue: diffDays <= 0,
        isDone: Boolean(c.bagReminderDone),
        message: `Hola ${c.name}, le informamos de que ya han transcurrido los 30 días recomendados y ya puede retirar con delicadeza las bolsas protectoras de sus injertos para que los nuevos brotes respiren y se desarrollen correctamente. Hágalo con mucho cuidado para no dañar las yemas tiernas.`
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays);
}

export function toggleBagReminderDone(clientId, isDone) {
  const db = getDatabase();
  const index = db.clients.findIndex(c => c.id === clientId);
  if (index !== -1) {
    db.clients[index].bagReminderDone = isDone;
    saveDatabase(db);
  }
  return db.clients;
}

// ==========================================
// FACTURAS
// ==========================================

export function getInvoices() {
  const db = getDatabase();
  return db.invoices;
}

export function generateNextInvoiceNumber() {
  const db = getDatabase();
  const currentYear = new Date().getFullYear();
  const prefix = `FAC-${currentYear}-`;
  const yearInvoices = db.invoices.filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix));
  const maxNum = yearInvoices.reduce((max, inv) => {
    const numPart = parseInt(inv.invoiceNumber.replace(prefix, ''), 10);
    return !isNaN(numPart) && numPart > max ? numPart : max;
  }, 0);
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function saveInvoice(invoiceData) {
  const db = getDatabase();
  const isEditing = Boolean(invoiceData.id);

  if (isEditing) {
    const index = db.invoices.findIndex(i => i.id === invoiceData.id);
    if (index !== -1) {
      db.invoices[index] = {
        ...db.invoices[index],
        ...invoiceData,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    const newInvoice = {
      ...invoiceData,
      id: 'inv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      invoiceNumber: invoiceData.invoiceNumber || generateNextInvoiceNumber(),
      createdAt: new Date().toISOString()
    };
    db.invoices.unshift(newInvoice);
  }

  saveDatabase(db);
  return db.invoices;
}

export function deleteInvoice(invoiceId) {
  const db = getDatabase();
  db.invoices = db.invoices.filter(i => i.id !== invoiceId);
  saveDatabase(db);
  return db.invoices;
}

// ==========================================
// AJUSTES Y SEGURIDAD (LOGIN)
// ==========================================

export function getSettings() {
  const db = getDatabase();
  return db.settings;
}

export function updateSettings(newSettings) {
  const db = getDatabase();
  db.settings = { ...db.settings, ...newSettings };
  saveDatabase(db);
  return db.settings;
}

export function checkAuthSession() {
  return sessionStorage.getItem(AUTH_KEY) === 'authenticated';
}

export function loginUser(password) {
  const db = getDatabase();
  const validPassword = db.settings.passwordHash || 'antonio1971';
  if (password === validPassword) {
    sessionStorage.setItem(AUTH_KEY, 'authenticated');
    return { success: true };
  }
  return { success: false, error: 'Contraseña incorrecta. Por favor verifique.' };
}

export function logoutUser() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
}

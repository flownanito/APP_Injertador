import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, MapPin, Trees, Save, Info } from 'lucide-react';
import { isWaningMoon, getMoonPhaseInfo } from '../utils/lunar';
import SpeechDictationButton from './SpeechDictationButton';
import { isSpeechDictationSupported } from '../utils/speechRecognition';

const CANARY_TREE_PRESETS = [
  'Aguacates Hass (Púa)',
  'Aguacates Fuerte',
  'Mangos (Osteen / Gomera)',
  'Cítricos (Limonero Eureka / Cuatro Estaciones)',
  'Cítricos (Naranjo Navelina / Washington)',
  'Olivos (Arbequina / Manzanilla)',
  'Frutales de Hueso (Ciruelos / Albaricoques)',
  'Nísperos / Higueras'
];

const MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12
};

function parseSpokenDate(transcript) {
  const normalized = transcript
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  let year;
  let month;
  let day;
  let match = normalized.match(/\b(\d{1,2})\s+de\s+([a-z]+)\s+(?:de|del)\s+(\d{4})\b/);

  if (match) {
    day = Number(match[1]);
    month = MONTHS[match[2]];
    year = Number(match[3]);
  } else {
    match = normalized.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
    if (match) {
      day = Number(match[1]);
      month = Number(match[2]);
      year = Number(match[3]);
    } else {
      match = normalized.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
      if (!match) return null;
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    }
  }

  if (!month || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function GraftFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  presetDate = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    treeTypes: '',
    serviceDate: new Date().toISOString().slice(0, 10),
    status: 'pendiente',
    notes: '',
    estimatedPrice: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        treeTypes: initialData.treeTypes || '',
        serviceDate: initialData.serviceDate || new Date().toISOString().slice(0, 10),
        status: initialData.status || 'pendiente',
        notes: initialData.notes || '',
        estimatedPrice: initialData.estimatedPrice || ''
      });
    } else if (presetDate) {
      setFormData({
        name: '',
        phone: '',
        address: '',
        treeTypes: '',
        serviceDate: presetDate,
        status: 'pendiente',
        notes: '',
        estimatedPrice: ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        treeTypes: '',
        serviceDate: new Date().toISOString().slice(0, 10),
        status: 'pendiente',
        notes: '',
        estimatedPrice: ''
      });
    }
  }, [initialData, presetDate, isOpen]);

  if (!isOpen) return null;

  // Comprobar la luna para la fecha seleccionada
  const selectedDateObj = formData.serviceDate ? new Date(formData.serviceDate + 'T12:00:00') : new Date();
  const moonInfo = getMoonPhaseInfo(selectedDateObj);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddTreePreset = (tree) => {
    if (!formData.treeTypes) {
      setFormData({ ...formData, treeTypes: tree });
    } else if (!formData.treeTypes.includes(tree)) {
      setFormData({ ...formData, treeTypes: `${formData.treeTypes}, ${tree}` });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {initialData ? 'Modificar Datos del Cliente / Injerto' : 'Nuevo Cliente para Injertar'}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!initialData && (
              <p className="dictation-intro">
                {isSpeechDictationSupported ? (
                  <>
                    <span>¿Te resulta más cómodo hablar?</span> Pulsa el micrófono junto a cada campo.
                    El navegador procesa la voz para transcribirla; revisa los datos antes de guardar.
                  </>
                ) : (
                  <>
                    <span>El dictado no está disponible en este navegador.</span> Puedes escribir los datos
                    directamente o probar con un navegador compatible.
                  </>
                )}
              </p>
            )}

            {/* 1. Nombre del cliente */}
            <div className="form-group">
              <label className="form-label" htmlFor="client-name">
                <User size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Nombre del Cliente *
              </label>
              <div className="input-with-dictation">
                <input
                  id="client-name"
                  type="text"
                  className="form-input"
                  placeholder="Ej. Manuel González Rivero"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
                <SpeechDictationButton
                  fieldLabel="el nombre del cliente"
                  onTranscript={(name) => setFormData((previous) => ({ ...previous, name }))}
                />
              </div>
            </div>

            {/* 2. Número de teléfono del cliente */}
            <div className="form-group">
              <label className="form-label" htmlFor="client-phone">
                <Phone size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Número de Teléfono del Cliente *
              </label>
              <div className="input-with-dictation">
                <input
                  id="client-phone"
                  type="tel"
                  className="form-input"
                  placeholder="Ej. 611 234 567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <SpeechDictationButton
                  fieldLabel="el teléfono"
                  onTranscript={(phone) => setFormData((previous) => ({ ...previous, phone }))}
                />
              </div>
            </div>

            {/* 3. Dirección del lugar donde se va a injertar */}
            <div className="form-group">
              <label className="form-label" htmlFor="client-address">
                <MapPin size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Dirección / Finca donde se va a injertar *
              </label>
              <div className="input-with-dictation">
                <input
                  id="client-address"
                  type="text"
                  className="form-input"
                  placeholder="Ej. Finca Las Breñas, Barranco Hondo, Candelaria"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <SpeechDictationButton
                  fieldLabel="la dirección"
                  onTranscript={(address) => setFormData((previous) => ({ ...previous, address }))}
                />
              </div>
            </div>

            {/* 4. Tipo de Árboles a injertar */}
            <div className="form-group">
              <label className="form-label" htmlFor="client-trees">
                <Trees size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Tipo de Árboles a Injertar *
              </label>
              <div className="input-with-dictation">
                <input
                  id="client-trees"
                  type="text"
                  className="form-input"
                  placeholder="Ej. Aguacates Hass, Naranjos Navelina, Mangos..."
                  value={formData.treeTypes}
                  onChange={(e) => setFormData({ ...formData, treeTypes: e.target.value })}
                  required
                />
                <SpeechDictationButton
                  fieldLabel="el tipo de árboles"
                  onTranscript={(treeTypes) => setFormData((previous) => ({ ...previous, treeTypes }))}
                />
              </div>

              {/* Botones de sugerencias rápidas comunes en Canarias */}
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span className="tree-presets-hint">
                  Sugerencias rápidas para Canarias (clic para añadir):
                </span>
                {CANARY_TREE_PRESETS.map(tree => (
                  <button
                    key={tree}
                    type="button"
                    onClick={() => handleAddTreePreset(tree)}
                    className="tree-preset-button"
                  >
                    + {tree}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila con Fecha y Estado */}
            <div className="graft-form-date-row">
              {/* 5. Fecha del servicio */}
              <div className="form-group">
                <label className="form-label" htmlFor="client-date">
                  <Calendar size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Fecha del Servicio *
                </label>
                <div className="input-with-dictation">
                  <input
                    id="client-date"
                    type="date"
                    className="form-input"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    required
                  />
                  <SpeechDictationButton
                    fieldLabel="la fecha del servicio"
                    onTranscript={(spokenDate) => {
                      const serviceDate = parseSpokenDate(spokenDate);
                      if (!serviceDate) {
                        return 'Di día, mes y año; por ejemplo: 15 de noviembre de 2026.';
                      }
                      setFormData((previous) => ({ ...previous, serviceDate }));
                      return undefined;
                    }}
                  />
                </div>
                <span className="dictation-field-hint">Para dictarla, indica el día, el mes y el año.</span>
              </div>

              {/* 6. Estado del servicio */}
              <div className="form-group">
                <label className="form-label" htmlFor="client-status">
                  Estado del Servicio
                </label>
                <select
                  id="client-status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pendiente">Pendiente (Por realizar)</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>

            {/* Aviso Lunar dinámico para la fecha seleccionada */}
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: moonInfo.isWaning ? '#fff1f2' : '#f0f7f3',
              border: `1px solid ${moonInfo.isWaning ? '#ef233c' : '#52b788'}`,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              <span style={{ fontSize: '1.4rem' }}>{moonInfo.icon}</span>
              <div>
                <strong>{moonInfo.name} ({moonInfo.illumination}% iluminada): </strong>
                {moonInfo.isWaning ? (
                  <span style={{ color: '#b70928', fontWeight: 700 }}>
                    ¡Fecha en Luna Menguante! Día idóneo para programar injerto.
                  </span>
                ) : (
                  <span style={{ color: '#1b4332' }}>
                    Esta fecha no coincide con luna menguante. Si es posible, se recomienda en menguante.
                  </span>
                )}
              </div>
            </div>

            {/* Notas / Observaciones adicionales */}
            <div className="form-group">
              <label className="form-label" htmlFor="client-notes">
                Notas y Detalles de los Injertos (Opcional)
              </label>
              <div className="input-with-dictation is-textarea">
                <textarea
                  id="client-notes"
                  className="form-textarea"
                  placeholder="Número aproximado de plantas, tipo de púas, herramientas necesarias, indicaciones para llegar..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                <SpeechDictationButton
                  fieldLabel="las notas"
                  onTranscript={(notes) => setFormData((previous) => ({ ...previous, notes }))}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              {initialData ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

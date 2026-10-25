import React, { useState } from 'react';
import { X, Save, KeyRound, Download, Upload, RotateCcw, ShieldCheck, Building } from 'lucide-react';
import { getDatabase, saveDatabase, resetToDemoData } from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  settings = {},
  onSaveSettings,
  onReloadDatabase
}) {
  const [formData, setFormData] = useState({
    businessName: settings.businessName || '',
    businessOwner: settings.businessOwner || '',
    cif: settings.cif || '',
    phone: settings.phone || '',
    email: settings.email || '',
    address: settings.address || '',
    igicRate: settings.igicRate || 7,
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (formData.newPassword.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
    }

    const updated = {
      businessName: formData.businessName,
      businessOwner: formData.businessOwner,
      cif: formData.cif,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      igicRate: Number(formData.igicRate) || 7,
    };

    if (formData.newPassword) {
      updated.passwordHash = formData.newPassword;
    }

    onSaveSettings(updated);
    setMessage('¡Ajustes guardados con éxito!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Exportar base de datos a JSON
  const handleExportBackup = () => {
    const db = getDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `injertador_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar base de datos desde JSON
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.clients && parsed.settings) {
          saveDatabase(parsed);
          onReloadDatabase();
          setMessage('¡Copia de seguridad restaurada correctamente!');
        } else {
          setError('El archivo seleccionado no tiene el formato válido de Injertador.');
        }
      } catch (err) {
        setError('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('¿Restablecer los datos a la demostración inicial de Canarias? Se mantendrán ejemplos realistas.')) {
      resetToDemoData();
      onReloadDatabase();
      setMessage('Datos restaurados a la versión de demostración.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ajustes de Administrador & Empresa</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {message && (
              <div style={{ background: '#e8f5e9', color: '#2b9348', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ background: '#ffe5e8', color: '#d90429', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* SEGURIDAD DE ADMINISTRADOR */}
            <div style={{ background: '#f8faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dbe4dc', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1b4332', marginBottom: '10px' }}>
                <KeyRound size={18} />
                Seguridad: Contraseña de Acceso
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nueva Contraseña</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Dejar en blanco para no cambiar"
                    value={formData.newPassword}
                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repetir nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* DATOS DE LA EMPRESA / INJERTADOR */}
            <div style={{ background: '#f8faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dbe4dc', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1b4332', marginBottom: '10px' }}>
                <Building size={18} />
                Datos para la Facturación (Islas Canarias)
              </div>

              <div className="form-group">
                <label className="form-label">Nombre Comercial / Empresa</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Titular / Injertador</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.businessOwner}
                    onChange={e => setFormData({ ...formData, businessOwner: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CIF / NIF</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cif}
                    onChange={e => setFormData({ ...formData, cif: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo IGIC Canarias (%)</label>
                  <select
                    className="form-select"
                    value={formData.igicRate}
                    onChange={e => setFormData({ ...formData, igicRate: e.target.value })}
                  >
                    <option value="0">0% (Exento / Agrícola)</option>
                    <option value="3">3% (Reducido)</option>
                    <option value="7">7% (General)</option>
                    <option value="15">15% (Incrementado)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dirección Fiscal / Ubicación</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* COPIAS DE SEGURIDAD / BASE DE DATOS */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1b4332', marginBottom: '10px' }}>
                Copias de Seguridad de la Base de Datos
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleExportBackup}
                >
                  <Download size={16} /> Descargar Backup JSON
                </button>

                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> Restaurar Backup JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    style={{ display: 'none' }}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleResetDemo}
                  title="Volver a los datos de ejemplo iniciales"
                >
                  <RotateCcw size={16} /> Restablecer Demo
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Guardar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

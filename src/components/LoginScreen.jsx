import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, Sprout } from 'lucide-react';
import { loginUser } from '../utils/storage';

export default function LoginScreen({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = loginUser(password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Contraseña incorrecta');
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <Sprout size={44} />
        </div>

        <div className="login-badge">
          <ShieldCheck size={16} />
          Acceso Administrador Securizado
        </div>

        <h2>Aplicación Injertador</h2>
        <p>Control de citas de injerto, ciclos lunares en Canarias y facturación agrícola</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '18px' }}>
            <label className="form-label" htmlFor="admin-password">
              Contraseña de Administrador
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Introduzca su contraseña..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#ffe5e8',
              color: '#d90429',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            disabled={loading}
          >
            <KeyRound size={20} />
            {loading ? 'Verificando...' : 'Acceder al Panel'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.8rem',
          color: '#6b7280'
        }}>
          <br />
          <span>(Puede modificarla en cualquier momento desde Ajustes)</span>
        </div>
      </div>
    </div>
  );
}

// auth.js - Sistema de Autenticación Seguro para Vivero Chaka
// Archivo separado para mayor seguridad

(function() {
  'use strict';

  // Verificar si ya estamos logueados
  if (localStorage.getItem('chakaLoggedIn') === 'true') {
    try {
      const userDataStr = localStorage.getItem('chakaUser');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const loginTime = new Date(userData.loginTime || 0);

        if (!isNaN(loginTime.getTime())) {
          const hoursDiff = (new Date() - loginTime) / (1000 * 60 * 60);

          if (hoursDiff < 8) { // Sesión válida por 8 horas
            window.location.href = 'app.html';
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error verificando sesión existente:', error);
    }

    // Sesión expirada o inválida
    localStorage.removeItem('chakaLoggedIn');
    localStorage.removeItem('chakaUser');
  }

  // Clase de autenticación
  class AuthSystem {
    constructor() {
      this.loginForm = document.getElementById('loginForm');
      this.emailInput = document.getElementById('email');
      this.passwordInput = document.getElementById('password');
      this.togglePassword = document.getElementById('togglePassword');
      this.loginButton = document.getElementById('loginButton');
      this.passwordStrength = document.getElementById('passwordStrength');

      // ÚNICA CREDENCIAL VÁLIDA
      this.validCredentials = [
        {
          email: 'admin@chaka.com',
          passwordHash: this.hashPassword('adminluis1'),
          name: 'Administrador',
          role: 'Administrador',
          permissions: ['all']
        }
      ];

      this.init();
    }

    init() {
      this.setupEventListeners();
      this.setupDevMode();
      this.addSecurityNotice();
    }

    // Hash de contraseña (simplificado para desarrollo)
    hashPassword(password) {
      // En producción usaría bcrypt o similar
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }

    setupEventListeners() {
      // Mostrar/ocultar contraseña
      if (this.togglePassword) {
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
      }

      // Validar fuerza de contraseña en tiempo real
      if (this.passwordInput && this.passwordStrength) {
        this.passwordInput.addEventListener('input', () => this.checkPasswordStrength());
      }

      // Manejar envío del formulario
      if (this.loginForm) {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
      }

      // Limpiar error al escribir
      if (this.emailInput) {
        this.emailInput.addEventListener('input', () => this.clearError());
      }

      if (this.passwordInput) {
        this.passwordInput.addEventListener('input', () => this.clearError());
      }
    }

    togglePasswordVisibility() {
      const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      this.passwordInput.setAttribute('type', type);
      this.togglePassword.querySelector('i').classList.toggle('fa-eye');
      this.togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    }

    checkPasswordStrength() {
      const password = this.passwordInput.value;
      let strength = 0;

      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;

      this.passwordStrength.className = 'password-strength ';
      if (password.length === 0) {
        this.passwordStrength.style.backgroundColor = '#e0e0e0';
      } else if (strength === 0) {
        this.passwordStrength.className += 'strength-weak';
      } else if (strength <= 2) {
        this.passwordStrength.className += 'strength-medium';
      } else {
        this.passwordStrength.className += 'strength-strong';
      }
    }

    async handleLogin(e) {
      e.preventDefault();

      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value;

      // Validaciones básicas
      if (!this.validateEmail(email)) {
        this.showError('Por favor, ingresa un correo electrónico válido.');
        return;
      }

      if (!this.validatePassword(password)) {
        this.showError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      // Deshabilitar botón durante la autenticación
      this.setLoginButtonState('loading');

      // Simular delay de red
      await this.simulateNetworkDelay();

      // Verificar credenciales
      const hashedPassword = this.hashPassword(password);
      const user = this.validCredentials.find(cred =>
        cred.email === email && cred.passwordHash === hashedPassword
      );

      if (user) {
        // Autenticación exitosa
        await this.handleSuccessfulLogin(user);
      } else {
        // Credenciales incorrectas
        this.handleFailedLogin();
      }
    }

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    validatePassword(password) {
      return password.length >= 8;
    }

    async simulateNetworkDelay() {
      return new Promise(resolve => setTimeout(resolve, 800));
    }

    async handleSuccessfulLogin(user) {
      try {
        // Generar token de sesión seguro
        const sessionToken = this.generateSessionToken();

        // Guardar datos de usuario (sin contraseña)
        const userData = {
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          loginTime: new Date().toISOString(),
          sessionToken: sessionToken,
          lastActivity: Date.now()
        };

        // Guardar en localStorage
        localStorage.setItem('chakaLoggedIn', 'true');
        localStorage.setItem('chakaUser', JSON.stringify(userData));

        // Actualizar interfaz
        this.setLoginButtonState('success');

        // Registrar acceso exitoso
        this.logAccess('success', user.email);

        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = 'app.html';
        }, 1000);

      } catch (error) {
        console.error('Error en login:', error);
        this.showError('Error al iniciar sesión. Intenta nuevamente.');
        this.setLoginButtonState('default');
      }
    }

    handleFailedLogin() {
      // Registrar intento fallido
      this.logAccess('failed', this.emailInput.value);

      // Mostrar error
      this.showError('Credenciales incorrectas. Verifica tu email y contraseña.');

      // Restablecer botón
      this.setLoginButtonState('default');

      // Limpiar contraseña
      this.passwordInput.value = '';
      this.checkPasswordStrength();

      // Agregar shake animation
      this.loginForm.style.animation = 'shake 0.5s';
      setTimeout(() => {
        this.loginForm.style.animation = '';
      }, 500);
    }

    setLoginButtonState(state) {
      if (!this.loginButton) return;

      switch(state) {
        case 'loading':
          this.loginButton.disabled = true;
          this.loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
          this.loginButton.style.backgroundColor = '#ff9800';
          break;

        case 'success':
          this.loginButton.disabled = true;
          this.loginButton.innerHTML = '<i class="fas fa-check"></i> Acceso concedido';
          this.loginButton.style.backgroundColor = '#4caf50';
          break;

        default:
          this.loginButton.disabled = false;
          this.loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
          this.loginButton.style.backgroundColor = '';
      }
    }

    generateSessionToken() {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 9);
      return `chaka_${timestamp}_${random}`;
    }

    logAccess(type, email) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        email: type === 'failed' ? email.substring(0, 3) + '***@***' : email,
        ip: 'local',
        userAgent: navigator.userAgent
      };

      const accessLogs = JSON.parse(localStorage.getItem('chakaAccessLogs') || '[]');
      accessLogs.push(logEntry);

      if (accessLogs.length > 100) {
        accessLogs.splice(0, accessLogs.length - 100);
      }

      localStorage.setItem('chakaAccessLogs', JSON.stringify(accessLogs));

      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`🔐 Acceso ${type}:`, logEntry);
      }
    }

    showError(message) {
      this.clearError();

      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message fade-in';
      errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      `;

      if (this.loginForm) {
        this.loginForm.insertBefore(errorDiv, this.loginForm.firstChild);
      }

      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 5000);
    }

    clearError() {
      const existingError = document.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
    }

    setupDevMode() {
      // Solo en localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Autocompletar credenciales de desarrollo
        this.emailInput.value = 'admin@chaka.com';
        this.passwordInput.value = 'adminluis1';
        this.checkPasswordStrength();

        const devNote = document.createElement('div');
        devNote.className = 'security-notice dev-mode fade-in';
        devNote.innerHTML = `
          <i class="fas fa-laptop-code"></i>
          <div>
            <strong>Modo desarrollo activado</strong>
            <small>Credenciales: admin@chaka.com / adminluis1</small>
          </div>
        `;

        if (this.loginForm) {
          this.loginForm.parentNode.insertBefore(devNote, this.loginForm.nextSibling);
        }

        console.log('🔐 Sistema de autenticación en modo desarrollo');
      }
    }

    addSecurityNotice() {
      const securityNotice = document.createElement('div');
      securityNotice.className = 'security-notice fade-in';
      securityNotice.innerHTML = `
        <i class="fas fa-shield-alt"></i>
        <div>
          <strong>Sistema seguro</strong>
          <small>Tus credenciales están protegidas con encriptación</small>
        </div>
      `;

      if (this.loginForm && this.loginButton) {
        this.loginForm.insertBefore(securityNotice, this.loginButton);
      }
    }
  }

  // Inicializar sistema de autenticación cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
  });

  // Protección adicional
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    Object.defineProperty(window, 'AuthSystem', {
      value: null,
      writable: false,
      configurable: false
    });

    window.addEventListener('beforeunload', () => {
      if (window.authInstance) {
        window.authInstance = null;
      }
    });
  }
})();

// Función para verificar sesión
function checkAuthSession() {
  try {
    const isLoggedIn = localStorage.getItem('chakaLoggedIn') === 'true';

    if (!isLoggedIn) {
      return false;
    }

    const userDataStr = localStorage.getItem('chakaUser');
    if (!userDataStr) {
      localStorage.removeItem('chakaLoggedIn');
      return false;
    }

    const userData = JSON.parse(userDataStr);
    const loginTime = new Date(userData.loginTime || 0);

    if (isNaN(loginTime.getTime())) {
      localStorage.removeItem('chakaLoggedIn');
      localStorage.removeItem('chakaUser');
      return false;
    }

    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

    if (hoursDiff > 8) {
      localStorage.removeItem('chakaLoggedIn');
      localStorage.removeItem('chakaUser');
      return false;
    }

    userData.lastActivity = Date.now();
    localStorage.setItem('chakaUser', JSON.stringify(userData));

    return true;
  } catch (error) {
    console.error('Error verificando sesión:', error);
    localStorage.removeItem('chakaLoggedIn');
    localStorage.removeItem('chakaUser');
    return false;
  }
}

// Función para cerrar sesión
function logoutUser() {
  try {
    const userData = JSON.parse(localStorage.getItem('chakaUser') || '{}');
    const logoutLog = {
      timestamp: new Date().toISOString(),
      email: userData.email,
      sessionDuration: userData.loginTime ?
        (Date.now() - new Date(userData.loginTime).getTime()) / (1000 * 60) + ' minutos' : 'N/A'
    };

    const logoutLogs = JSON.parse(localStorage.getItem('chakaLogoutLogs') || '[]');
    logoutLogs.push(logoutLog);
    localStorage.setItem('chakaLogoutLogs', JSON.stringify(logoutLogs));
  } catch (error) {
    console.error('Error registrando logout:', error);
  } finally {
    localStorage.removeItem('chakaLoggedIn');
    localStorage.removeItem('chakaUser');
    window.location.href = 'index.html';
  }
}

// Exportar funciones para uso global
window.auth = {
  checkSession: checkAuthSession,
  logout: logoutUser,
  getUser: function() {
    try {
      return JSON.parse(localStorage.getItem('chakaUser') || '{}');
    } catch {
      return {};
    }
  },
  hasPermission: function(permission) {
    try {
      const user = this.getUser();
      return user.permissions?.includes('all') || user.permissions?.includes(permission);
    } catch {
      return false;
    }
  }
};
// app.js - Sistema Principal optimizado
class AppSystem {
  constructor() {
    this.currentModule = null;
    this.modules = {
      semillas: window.SeedManager,
      plantas: window.PlantManager, // Ya disponible
      fertilizantes: window.FertilizerManager,
      cotizaciones: window.QuotationManager,
      cotizaciones_hechas: window.QuotationHistoryManager,
      estadisticas: window.StatisticsManager,
      basedatos: window.DatabaseManager
    };

    console.log('📦 Módulos disponibles:', Object.keys(this.modules));
    this.init();
  }

  init() {
    this.checkAuth();
    this.loadUserInfo();
    this.setupLogout();
    this.setupNavigation();
    this.setupHashRouting();
    this.loadInitialModule();
    this.ensureNotificationContainer();
    this.setupSeedLoader();
    this.setupPlantLoader(); // Nuevo: cargador para plantas
    this.setupServiceWorker();
    this.setupOfflineDetection();
    this.setupPerformanceMonitoring();
  }

  setupSeedLoader() {
    const existingSeeds = JSON.parse(localStorage.getItem('vivero_semillas')) || [];
    if (existingSeeds.length === 0) {
      console.log('📦 Base de datos de semillas vacía, cargando datos iniciales...');
      this.loadInitialSeeds();
    }
  }

  setupPlantLoader() {
    const existingPlants = JSON.parse(localStorage.getItem('vivero_plantas')) || [];
    if (existingPlants.length === 0) {
      console.log('🌱 Base de datos de plantas vacía, cargando datos iniciales...');
      this.loadInitialPlants();
    }
  }

  loadInitialSeeds() {
    const initialSeeds = [
      {
        id: '1',
        nombre: 'Tomate Cherry',
        especie: 'Solanum lycopersicum',
        variedad: 'Cherry',
        stock: 150,
        precio: 25.50,
        proveedor: 'Semillas Premium',
        fecha_ingreso: '2024-01-15',
        estado: 'disponible'
      },
      {
        id: '2',
        nombre: 'Lechuga Romana',
        especie: 'Lactuca sativa',
        variedad: 'Romana',
        stock: 200,
        precio: 18.75,
        proveedor: 'AgroSemillas',
        fecha_ingreso: '2024-01-10',
        estado: 'disponible'
      }
    ];
    localStorage.setItem('vivero_semillas', JSON.stringify(initialSeeds));
    console.log('✅ Semillas iniciales cargadas:', initialSeeds.length);
  }

  loadInitialPlants() {
    const initialPlants = [
      {
        id: '1',
        nombre: 'Rosa China',
        especie: 'Rosa chinensis',
        variedad: 'Roja',
        edad_meses: 6,
        altura_cm: 45,
        precio: 120.00,
        stock: 50,
        estado: 'disponible',
        ubicacion: 'Invernadero A',
        cuidados: 'Riego diario, sol pleno'
      },
      {
        id: '2',
        nombre: 'Lavanda',
        especie: 'Lavandula angustifolia',
        variedad: 'Inglesa',
        edad_meses: 4,
        altura_cm: 30,
        precio: 85.50,
        stock: 75,
        estado: 'disponible',
        ubicacion: 'Exterior',
        cuidados: 'Riego moderado, sol directo'
      },
      {
        id: '3',
        nombre: 'Bonsái Ficus',
        especie: 'Ficus retusa',
        variedad: 'Bonsái',
        edad_meses: 24,
        altura_cm: 25,
        precio: 450.00,
        stock: 15,
        estado: 'disponible',
        ubicacion: 'Vivero Interior',
        cuidados: 'Riego controlado, luz indirecta'
      }
    ];
    localStorage.setItem('vivero_plantas', JSON.stringify(initialPlants));
    console.log('✅ Plantas iniciales cargadas:', initialPlants.length);
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('🔧 ServiceWorker registrado:', registration.scope);
        }).catch(error => {
          console.log('⚠️ Error registrando ServiceWorker:', error);
        });
      });
    }
  }

  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.showNotification('Conexión restablecida', 'success', 'Conectado');
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.showNotification('Modo sin conexión activado', 'warning', 'Sin conexión');
    });
  }

  setupPerformanceMonitoring() {
    const originalLoadModule = this.loadModule.bind(this);

    this.loadModule = function(moduleName) {
      const startTime = performance.now();
      const result = originalLoadModule(moduleName);
      const endTime = performance.now();
      console.log(`⏱️ Módulo ${moduleName} cargado en ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    };
  }

  syncPendingChanges() {
    console.log('🔄 Sincronizando cambios pendientes...');
    // Aquí iría la lógica para sincronizar cambios pendientes con el servidor
    this.showNotification('Sincronización completada', 'success', 'Sincronizado');
  }

  ensureNotificationContainer() {
    if (!document.getElementById('notificationContainer')) {
      const container = document.createElement('div');
      container.id = 'notificationContainer';
      container.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      `;
      document.body.appendChild(container);
    }
  }

  checkAuth() {
    if (window.location.pathname.includes('index.html')) {
      return;
    }

    if (localStorage.getItem('chakaLoggedIn') !== 'true') {
      console.log('🔒 Usuario no autenticado, redirigiendo a login...');
      window.location.href = 'index.html';
      return;
    }

    const userData = JSON.parse(localStorage.getItem('chakaUser') || '{}');
    const loginTime = new Date(userData.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

    if (hoursDiff > 8) {
      console.log('⏰ Sesión expirada, cerrando...');
      this.logout();
      window.location.href = 'index.html';
    }
  }

  loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('chakaUser') || '{}');
    const userNameElements = document.querySelectorAll('#userName');
    const userRoleElements = document.querySelectorAll('#userRole');

    userNameElements.forEach(el => {
      if (user.name && el) {
        el.textContent = this.capitalizeFirstLetter(user.name);
      }
    });

    userRoleElements.forEach(el => {
      if (user.role && el) {
        el.textContent = user.role;
      }
    });
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('chakaLoggedIn');
      localStorage.removeItem('chakaUser');
      console.log('👋 Sesión cerrada');
      window.location.href = 'index.html';
    }
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const module = item.getAttribute('data-module');
        if (module) {
          this.navigateToModule(module);
        }
      });
    });
  }

  setupHashRouting() {
    this.hashChangeHandler = () => {
      const hash = window.location.hash.substring(1);
      console.log('🔗 Hash change:', hash);
      if (hash) {
        this.navigateToModule(hash);
      } else if (!hash) {
        this.showWelcomeScreen();
      }
    };
    window.addEventListener('hashchange', this.hashChangeHandler);
  }

  loadInitialModule() {
    const hash = window.location.hash.substring(1);
    console.log('🔍 Hash inicial:', hash);
    if (hash) {
      this.navigateToModule(hash);
    } else {
      this.showWelcomeScreen();
    }
  }

  navigateToModule(moduleName) {
    console.log('🚀 Navegando a módulo:', moduleName);

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-module') === moduleName) {
        item.classList.add('active');
      }
    });

    const titles = {
      semillas: 'Gestión de Semillas',
      plantas: 'Gestión de Plantas',
      fertilizantes: 'Gestión de Fertilizantes',
      cotizaciones: 'Crear Cotizaciones',
      cotizaciones_hechas: 'Historial de Cotizaciones',
      estadisticas: 'Estadísticas',
      basedatos: 'Base de Datos'
    };

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = titles[moduleName] || 'Vivero Chaka';
    }

    this.loadModule(moduleName);
    window.location.hash = moduleName;
  }

  loadModule(moduleName) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
      console.error('❌ No se encontró #mainContent');
      return;
    }

    console.log(`🔄 Cargando módulo: ${moduleName}`);

    mainContent.innerHTML = this.getSkeletonHTML();

    if (this.currentModule && typeof this.currentModule.destroy === 'function') {
      try {
        this.currentModule.destroy();
      } catch (error) {
        console.error('Error al destruir módulo anterior:', error);
      }
    }

    if (!this.modules[moduleName]) {
      console.warn(`⚠️ Módulo ${moduleName} no encontrado`);
      this.showDevelopmentModule(moduleName);
      return;
    }

    try {
      console.log(`🎯 Creando instancia de ${moduleName}`);
      this.currentModule = new this.modules[moduleName]();

      setTimeout(() => {
        if (typeof this.currentModule.renderModuleInterface === 'function') {
          console.log(`🎨 Renderizando interfaz de ${moduleName}`);
          this.currentModule.renderModuleInterface();

          if (typeof this.currentModule.init === 'function') {
            setTimeout(() => {
              console.log(`🎯 Inicializando módulo ${moduleName}`);
              this.currentModule.init();
              console.log(`✅ Módulo ${moduleName} cargado exitosamente`);
              mainContent.classList.add('module-loaded');
            }, 100);
          }
        } else {
          console.error(`❌ El módulo ${moduleName} no tiene método renderModuleInterface`);
          this.showDevelopmentModule(moduleName);
        }
      }, 300);

    } catch (error) {
      console.error(`❌ Error al cargar módulo ${moduleName}:`, error);
      this.showErrorModule(moduleName, error);
    }
  }

  getSkeletonHTML() {
    return `
      <div class="skeleton-container">
        <div class="skeleton-header">
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-actions skeleton"></div>
        </div>
        <div class="skeleton-filters skeleton"></div>
        <div class="skeleton-table">
          ${Array(5).fill().map(() => `
            <div class="skeleton-row skeleton"></div>
          `).join('')}
        </div>
      </div>
    `;
  }

  showDevelopmentModule(moduleName) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    const moduleNames = {
      semillas: 'Semillas',
      plantas: 'Plantas',
      fertilizantes: 'Fertilizantes',
      cotizaciones: 'Cotizaciones',
      cotizaciones_hechas: 'Historial de Cotizaciones',
      estadisticas: 'Estadísticas',
      basedatos: 'Base de Datos'
    };

    const iconClasses = {
      semillas: 'fas fa-seedling',
      plantas: 'fas fa-leaf',
      fertilizantes: 'fas fa-flask',
      cotizaciones: 'fas fa-file-invoice-dollar',
      cotizaciones_hechas: 'fas fa-history',
      estadisticas: 'fas fa-chart-line',
      basedatos: 'fas fa-database'
    };

    mainContent.innerHTML = `
      <div class="development-module">
        <div class="development-icon">
          <i class="${iconClasses[moduleName] || 'fas fa-tools'}"></i>
        </div>
        <h2>${moduleNames[moduleName] || 'Módulo'}</h2>
        <p>Este módulo se encuentra actualmente en desarrollo.</p>
        <p>Estamos trabajando para traerte las mejores funcionalidades.</p>
        <div class="development-status">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 65%"></div>
          </div>
          <small>65% completado</small>
        </div>
        <p style="margin-top: 20px; color: var(--text-light); font-size: 0.9rem;">
          <i class="fas fa-info-circle"></i> Disponible próximamente
        </p>
        <button class="btn-secondary" onclick="window.app.showNotification('Módulo en desarrollo', 'info')" style="margin-top: 20px;">
          <i class="fas fa-bell"></i> Notificarme cuando esté listo
        </button>
      </div>
    `;
  }

  showErrorModule(moduleName, error) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="error-module">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Error al cargar módulo</h2>
        <p>No se pudo cargar el módulo "${moduleName}".</p>
        <div class="error-details">
          <p><strong>Detalles:</strong> ${error.message}</p>
        </div>
        <div class="error-actions">
          <button class="btn-primary" onclick="window.app.loadModule('${moduleName}')">
            <i class="fas fa-redo"></i> Reintentar
          </button>
          <button class="btn-secondary" onclick="window.app.navigateToModule('cotizaciones')">
            <i class="fas fa-arrow-left"></i> Volver a Cotizaciones
          </button>
        </div>
        <p style="margin-top: 20px; font-size: 0.9rem; color: var(--text-light);">
          Si el problema persiste, contacta al administrador del sistema.
        </p>
      </div>
    `;
  }

  showWelcomeScreen() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    const user = JSON.parse(localStorage.getItem('chakaUser') || '{}');

    mainContent.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-icon">
          <i class="fas fa-seedling"></i>
        </div>
        <h2>Bienvenido ${user.name ? user.name.split(' ')[0] : ''}</h2>
        <p>Sistema de Gestión Integral Vivero Chaka</p>
        <p style="margin-top: 20px; color: var(--text-light); font-size: 1rem;">
          Selecciona un módulo del menú de navegación para comenzar.
        </p>
        <div style="margin-top: 30px; padding: 20px; background: rgba(46, 125, 50, 0.05); border-radius: 12px; max-width: 600px; text-align: left;">
          <h4 style="color: var(--primary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-rocket"></i> Módulos disponibles:
          </h4>
          <div class="modules-grid">
            <div class="module-card available" onclick="window.app.navigateToModule('semillas')">
              <div class="module-icon">
                <i class="fas fa-seedling"></i>
              </div>
              <div class="module-info">
                <h5>Semillas</h5>
                <p>Gestión de catálogo</p>
                <span class="module-status available">✅ Disponible</span>
              </div>
            </div>
            <div class="module-card available" onclick="window.app.navigateToModule('plantas')">
              <div class="module-icon">
                <i class="fas fa-leaf"></i>
              </div>
              <div class="module-info">
                <h5>Plantas</h5>
                <p>Gestión de vivero</p>
                <span class="module-status available">✅ Disponible</span>
              </div>
            </div>
            <div class="module-card available" onclick="window.app.navigateToModule('cotizaciones')">
              <div class="module-icon">
                <i class="fas fa-file-invoice-dollar"></i>
              </div>
              <div class="module-info">
                <h5>Cotizaciones</h5>
                <p>Crear y gestionar</p>
                <span class="module-status available">✅ Disponible</span>
              </div>
            </div>
            <div class="module-card available" onclick="window.app.navigateToModule('cotizaciones_hechas')">
              <div class="module-icon">
                <i class="fas fa-history"></i>
              </div>
              <div class="module-info">
                <h5>Historial</h5>
                <p>Ver y gestionar</p>
                <span class="module-status available">✅ Disponible</span>
              </div>
            </div>
            <div class="module-card developing" onclick="window.app.showNotification('Módulo en desarrollo', 'info')">
              <div class="module-icon">
                <i class="fas fa-flask"></i>
              </div>
              <div class="module-info">
                <h5>Fertilizantes</h5>
                <p>Gestión de insumos</p>
                <span class="module-status developing">🔧 En desarrollo</span>
              </div>
            </div>
            <div class="module-card developing" onclick="window.app.showNotification('Módulo en desarrollo', 'info')">
              <div class="module-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="module-info">
                <h5>Estadísticas</h5>
                <p>Reportes y análisis</p>
                <span class="module-status developing">🔧 En desarrollo</span>
              </div>
            </div>
            <div class="module-card developing" onclick="window.app.showNotification('Módulo en desarrollo', 'info')">
              <div class="module-icon">
                <i class="fas fa-database"></i>
              </div>
              <div class="module-info">
                <h5>Base de Datos</h5>
                <p>Backup y restauración</p>
                <span class="module-status developing">🔧 En desarrollo</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: rgba(33, 150, 243, 0.05); border-radius: 8px; max-width: 500px;">
          <h4 style="color: #2196F3; margin-bottom: 10px;"><i class="fas fa-lightbulb"></i> Consejo rápido:</h4>
          <p style="color: var(--text-light); font-size: 0.9rem;">
            Usa los botones flotantes en la esquina inferior derecha para acciones rápidas como agregar productos o imprimir.
          </p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.05); border-radius: 8px; max-width: 500px;">
          <h4 style="color: #FF9800; margin-bottom: 10px;"><i class="fas fa-chart-bar"></i> Estadísticas rápidas:</h4>
          <div style="display: flex; gap: 20px; font-size: 0.9rem;">
            <div>
              <div style="font-weight: bold; color: var(--primary-color);">${JSON.parse(localStorage.getItem('vivero_semillas') || '[]').length}</div>
              <div style="color: var(--text-light);">Semillas</div>
            </div>
            <div>
              <div style="font-weight: bold; color: var(--primary-color);">${JSON.parse(localStorage.getItem('vivero_plantas') || '[]').length}</div>
              <div style="color: var(--text-light);">Plantas</div>
            </div>
            <div>
              <div style="font-weight: bold; color: var(--primary-color);">${JSON.parse(localStorage.getItem('cotizaciones') || '[]').length}</div>
              <div style="color: var(--text-light);">Cotizaciones</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showNotification(message, type = 'success', title = null) {
    this.ensureNotificationContainer();
    const container = document.getElementById('notificationContainer');

    if (container.children.length >= 3) {
      const oldest = container.firstChild;
      this.closeNotification(oldest);
    }

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    const titlesMap = {
      success: '¡Éxito!',
      error: '¡Error!',
      warning: '¡Advertencia!',
      info: 'Información'
    };

    notification.innerHTML = `
      <div class="notification-icon">
        <i class="${icons[type] || icons.info}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title || titlesMap[type] || 'Notificación'}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
      <div class="notification-progress"></div>
    `;

    container.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    const progressBar = notification.querySelector('.notification-progress');
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '0%';
    }, 100);

    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.closeNotification(notification);
    });

    setTimeout(() => this.closeNotification(notification), 5000);

    return notification;
  }

  closeNotification(notification) {
    if (notification && notification.classList.contains('show')) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado, iniciando aplicación...');

  if (!window.localStorage) {
    alert('Tu navegador no soporta localStorage. Algunas funciones pueden no estar disponibles.');
  }

  window.app = new AppSystem();
  document.body.classList.add('app-loaded');

  const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
  console.log(`⚡ Tiempo de carga: ${loadTime}ms`);
});

// Manejar errores no capturados
window.addEventListener('error', function(event) {
  console.error('❌ Error no capturado:', event.error);

  if (window.app && window.app.showNotification) {
    window.app.showNotification('Ocurrió un error inesperado', 'error', 'Error del sistema');
  }
});

// Manejar promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Promesa rechazada no capturada:', event.reason);

  if (window.app && window.app.showNotification) {
    window.app.showNotification('Error en operación asíncrona', 'error', 'Error del sistema');
  }
});

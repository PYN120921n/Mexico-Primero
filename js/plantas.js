// Módulo de Gestión de Plantas (En desarrollo)

class PlantManager {
  constructor() {
    this.init();
  }

  init() {
    console.log('Módulo de Plantas - En desarrollo');
    // Este módulo mostrará automáticamente la pantalla de desarrollo
    // a través del sistema principal
  }

  destroy() {
    // Limpiar recursos si es necesario
  }
}

// Exportar para el sistema principal
window.PlantManager = PlantManager;
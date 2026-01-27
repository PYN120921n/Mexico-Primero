// Módulo de Gestión de Plantas
class PlantManager {
  constructor() {
    this.plants = JSON.parse(localStorage.getItem('vivero_plantas')) || [];
    this.currentPlantId = null;
    this.filteredPlants = [...this.plants];
    this.currentView = localStorage.getItem('plantas_view') || 'table'; // Vista guardada
    this.notificationShown = false;
  }

  renderModuleInterface() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
      console.error('❌ No se encontró #mainContent');
      return;
    }

    mainContent.innerHTML = `
      <div class="content-header">
        <div class="header-title">
          <h2><i class="fas fa-leaf"></i> Gestión de Plantas</h2>
          <p class="subtitle">Administra el catálogo de plantas del vivero</p>
        </div>
        <div class="header-actions">
          <div class="action-buttons-group">
            <button class="btn btn-primary" id="addPlantBtn">
              <i class="fas fa-plus-circle"></i> Nueva Planta
            </button>
            <button class="btn btn-outline" id="importPlantsBtn">
              <i class="fas fa-file-import"></i> Importar
            </button>
            <button class="btn btn-outline" id="exportPlantsBtn">
              <i class="fas fa-file-export"></i> Exportar
            </button>
            <button class="btn btn-outline" id="printPlantsBtn">
              <i class="fas fa-print"></i> Imprimir
            </button>
            <button class="btn btn-danger" id="deleteAllPlantsBtn">
              <i class="fas fa-trash-alt"></i> Eliminar Todo
            </button>
          </div>
        </div>
      </div>

      <div class="content-body">
        <!-- Panel de estadísticas -->
        <div class="stats-panel">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #2ecc71, #1e8449);">
                <i class="fas fa-leaf"></i>
              </div>
              <div class="stat-info">
                <h3 id="totalPlantsCount">0</h3>
                <p>Total Plantas</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #27ae60, #196f3d);">
                <i class="fas fa-tree"></i>
              </div>
              <div class="stat-info">
                <h3 id="uniqueSpecies">0</h3>
                <p>Especies Únicas</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #229954, #145a32);">
                <i class="fas fa-seedling"></i>
              </div>
              <div class="stat-info">
                <h3 id="recentPlants">0</h3>
                <p>Último Mes</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #52be80, #239b56);">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h3 id="updatedToday">0</h3>
                <p>Hoy</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de filtros mejorado -->
        <div class="filter-panel">
          <div class="filter-header">
            <h3><i class="fas fa-filter"></i> Filtros y Búsqueda</h3>
            <button class="btn btn-sm btn-outline" id="clearFiltersBtn">
              <i class="fas fa-eraser"></i> Limpiar Filtros
            </button>
          </div>
          
          <div class="filter-body">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input type="text" 
                     id="searchPlants" 
                     placeholder="Buscar por nombre común, científico o ID..."
                     class="search-input">
              <div class="search-tools">
                <span id="searchResultsCount">0 resultados</span>
              </div>
            </div>

            <div class="filter-grid">
              <div class="filter-group">
                <label for="sortBy" class="filter-label">
                  <i class="fas fa-sort-amount-down"></i> Ordenar por
                </label>
                <div class="filter-select-wrapper">
                  <select id="sortBy" class="filter-select">
                    <option value="id_asc">ID (Ascendente)</option>
                    <option value="id_desc">ID (Descendente)</option>
                    <option value="name_asc">Nombre (A-Z)</option>
                    <option value="name_desc">Nombre (Z-A)</option>
                    <option value="scientific_asc">Científico (A-Z)</option>
                    <option value="scientific_desc">Científico (Z-A)</option>
                    <option value="date_asc">Fecha (Antiguas)</option>
                    <option value="date_desc">Fecha (Recientes)</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">
                  <i class="fas fa-eye"></i> Vista
                </label>
                <div class="view-toggle">
                  <button class="view-btn ${this.currentView === 'table' ? 'active' : ''}" id="viewTableBtn" title="Vista de tabla">
                    <i class="fas fa-table"></i> Tabla
                  </button>
                  <button class="view-btn ${this.currentView === 'cards' ? 'active' : ''}" id="viewCardsBtn" title="Vista de tarjetas">
                    <i class="fas fa-th-large"></i> Tarjetas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de resultados -->
        <div class="results-panel">
          <div class="results-header">
            <div class="results-summary">
              <h4>Resultados</h4>
              <div class="summary-info">
                <span class="badge bg-light text-dark">
                  <i class="fas fa-list"></i> <span id="visiblePlantsCount">0</span> registros
                </span>
                <span class="badge bg-light text-dark">
                  <i class="fas fa-leaf"></i> Especies: <span id="visibleSpeciesCount">0</span>
                </span>
                <span class="badge bg-light text-dark">
                  <i class="fas fa-calendar"></i> Última: <span id="lastUpdateDate">-</span>
                </span>
              </div>
            </div>
            <div class="results-actions">
              <button class="btn btn-sm btn-outline" id="refreshDataBtn">
                <i class="fas fa-sync-alt"></i> Actualizar
              </button>
            </div>
          </div>

          <!-- Vista de tabla -->
          <div class="view-container">
            <div class="table-view" id="tableView" style="display: ${this.currentView === 'table' ? 'block' : 'none'};">
              <div class="table-responsive">
                <table id="plantsTable" class="data-table">
                  <thead>
                    <tr>
                      <th data-sort="id" class="sortable">
                        <div class="th-content">
                          <span>ID</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="commonName" class="sortable">
                        <div class="th-content">
                          <span>Nombre Común</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="scientificName" class="sortable">
                        <div class="th-content">
                          <span>Nombre Científico</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="createdAt" class="sortable">
                        <div class="th-content">
                          <span>Fecha Registro</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="updatedAt" class="sortable">
                        <div class="th-content">
                          <span>Última Actualización</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th class="actions-header">
                        <div class="th-content">
                          <span>Acciones</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="plantsTableBody">
                    <!-- Las plantas se cargarán aquí -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Vista de tarjetas -->
            <div class="cards-view" id="cardsView" style="display: ${this.currentView === 'cards' ? 'block' : 'none'};">
              <div class="cards-grid" id="plantsCardsGrid">
                <!-- Las tarjetas se cargarán aquí -->
              </div>
            </div>

            <!-- Estado vacío -->
            <div class="empty-state" id="emptyState">
              <div class="empty-icon">
                <i class="fas fa-leaf"></i>
              </div>
              <h3>No se encontraron plantas</h3>
              <p>No hay plantas que coincidan con los filtros aplicados.</p>
              <button class="btn btn-primary" id="addFirstPlantBtn">
                <i class="fas fa-plus"></i> Agregar primera planta
              </button>
              <button class="btn btn-outline" id="resetFiltersEmptyBtn">
                <i class="fas fa-undo"></i> Restablecer filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Agregar estilos CSS con más colores verdes
    this.injectStyles();
  }

  injectStyles() {
    const styleId = 'plant-manager-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      <style id="${styleId}">
        /* Estilos mejorados para el módulo de plantas - Tema verde vivero */
        
        /* Colores de vivero - Paleta verde */
        :root {
          --vivero-green-light: #2ecc71;
          --vivero-green: #27ae60;
          --vivero-green-dark: #219a52;
          --vivero-green-darker: #1e8449;
          --vivero-forest-light: #52be80;
          --vivero-forest: #229954;
          --vivero-forest-dark: #196f3d;
          --vivero-moss-light: #7dcea0;
          --vivero-moss: #58d68d;
          --vivero-moss-dark: #239b56;
          --vivero-earth: #8b4513;
          --vivero-earth-light: #a0522d;
          --vivero-sky: #3498db;
          --vivero-sun: #f39c12;
        }
        
        /* Botones generales mejorados */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .btn:active {
          transform: translateY(0);
        }

        .btn i {
          font-size: 16px;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--vivero-green), var(--vivero-green-darker));
          color: white;
          border-color: var(--vivero-green);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--vivero-green-darker), var(--vivero-green));
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
        }

        .btn-outline {
          background: transparent;
          color: var(--vivero-green);
          border-color: var(--vivero-green);
        }

        .btn-outline:hover {
          background: rgba(39, 174, 96, 0.1);
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.2);
        }

        .btn-danger {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border-color: #e74c3c;
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #c0392b, #e74c3c);
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn.loading {
          pointer-events: none;
          opacity: 0.8;
        }

        .btn.loading::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Panel de estadísticas - Tema verde */
        .stats-panel {
          background: linear-gradient(135deg, var(--vivero-forest-dark), var(--vivero-green-darker));
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .stat-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.3s ease, background 0.3s ease;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.25);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .stat-info h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .stat-info p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        /* Panel de filtros */
        .filter-panel {
          background: linear-gradient(to bottom, #f8fff8, #f0f8f0);
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(39, 174, 96, 0.1);
          border: 2px solid #d4efdf;
        }
        
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 2px solid #d4efdf;
          background: #e8f8ef;
          border-radius: 12px 12px 0 0;
        }
        
        .filter-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--vivero-forest-dark);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .filter-body {
          padding: 24px;
        }
        
        /* Búsqueda mejorada */
        .search-box {
          position: relative;
          margin-bottom: 24px;
        }
        
        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--vivero-green);
          font-size: 16px;
        }
        
        .search-input {
          width: 100%;
          padding: 16px 20px 16px 50px;
          border: 2px solid #d4efdf;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #f8fff8;
          color: #2c3e50;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--vivero-green);
          background: white;
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2);
        }
        
        .search-tools {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--vivero-green);
          font-weight: 500;
        }
        
        /* Grid de filtros */
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-label {
          font-weight: 600;
          color: var(--vivero-forest-dark);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .filter-select-wrapper {
          position: relative;
        }
        
        .filter-select {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #d4efdf;
          border-radius: 8px;
          font-size: 14px;
          background: #f8fff8;
          appearance: none;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #2c3e50;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: var(--vivero-green);
          background: white;
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2);
        }
        
        .select-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--vivero-green);
        }
        
        /* Toggle de vista mejorado */
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #e8f8ef;
          padding: 4px;
          border-radius: 8px;
          border: 2px solid #d4efdf;
          width: 100%;
        }
        
        .view-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: none;
          border-radius: 6px;
          cursor: pointer;
          color: #27ae60;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .view-btn:hover {
          background: rgba(39, 174, 96, 0.15);
          color: var(--vivero-green-darker);
        }
        
        .view-btn.active {
          background: linear-gradient(135deg, var(--vivero-green), var(--vivero-green-darker));
          color: white;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
        }
        
        .view-btn.active:hover {
          background: linear-gradient(135deg, var(--vivero-green-darker), var(--vivero-green));
          color: white;
        }
        
        /* Panel de resultados */
        .results-panel {
          background: linear-gradient(to bottom, #f8fff8, #f0f8f0);
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(39, 174, 96, 0.1);
          border: 2px solid #d4efdf;
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 2px solid #d4efdf;
          background: #e8f8ef;
          border-radius: 12px 12px 0 0;
        }
        
        .results-summary h4 {
          margin: 0 0 12px 0;
          color: var(--vivero-forest-dark);
        }
        
        .summary-info {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .summary-info .badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          background: rgba(255,255,255,0.9);
          border: 1px solid #d4efdf;
          color: var(--vivero-forest-dark);
        }
        
        /* Contenedor de vistas */
        .view-container {
          position: relative;
          min-height: 300px;
        }
        
        /* Tabla responsiva mejorada */
        .table-responsive {
          overflow-x: auto;
          padding: 0 4px;
        }
        
        .data-table {
          width: 100%;
          min-width: 800px;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .data-table th {
          background: linear-gradient(to bottom, #e8f8ef, #d4efdf);
          padding: 16px;
          font-weight: 600;
          color: var(--vivero-forest-dark);
          text-align: left;
          border-bottom: 2px solid #c8e6c9;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .data-table td {
          padding: 16px;
          border-bottom: 1px solid #d4efdf;
          vertical-align: middle;
          transition: background 0.2s ease;
          background: #f8fff8;
        }
        
        .data-table tbody tr:hover {
          background: #e8f8ef;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f0f8f0;
        }
        
        .data-table tbody tr:nth-child(even):hover {
          background: #e0f0e0;
        }
        
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        
        .th-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        
        .sortable {
          cursor: pointer;
          user-select: none;
        }
        
        .sortable:hover {
          background: rgba(39, 174, 96, 0.1);
        }
        
        .numeric {
          text-align: right;
        }
        
        /* Badges mejorados */
        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        
        .badge.bg-primary { background: linear-gradient(135deg, var(--vivero-green), var(--vivero-green-darker)); color: white; }
        .badge.bg-secondary { background: linear-gradient(135deg, var(--vivero-forest-light), var(--vivero-forest)); color: white; }
        .badge.bg-success { background: linear-gradient(135deg, var(--vivero-moss), var(--vivero-moss-dark)); color: white; }
        .badge.bg-info { background: linear-gradient(135deg, var(--vivero-sky), #2980b9); color: white; }
        .badge.bg-warning { background: linear-gradient(135deg, #f39c12, #d35400); color: white; }
        .badge.bg-danger { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; }
        .badge.bg-light { background: #f8fff8; color: var(--vivero-forest-dark); border: 1px solid #d4efdf; }
        
        /* Botones de acción mejorados */
        .actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 14px;
          position: relative;
          overflow: hidden;
        }
        
        .action-btn::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.1);
          top: 0;
          left: -100%;
          transition: left 0.3s ease;
        }
        
        .action-btn:hover::after {
          left: 0;
        }
        
        .action-btn.edit {
          background: linear-gradient(135deg, var(--vivero-sky), #2980b9);
          color: white;
          box-shadow: 0 2px 5px rgba(52, 152, 219, 0.2);
        }
        
        .action-btn.edit:hover {
          background: linear-gradient(135deg, #2980b9, var(--vivero-sky));
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
        }
        
        .action-btn.delete {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 2px 5px rgba(231, 76, 60, 0.2);
        }
        
        .action-btn.delete:hover {
          background: linear-gradient(135deg, #c0392b, #e74c3c);
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
        }
        
        /* Vista de tarjetas */
        .cards-view {
          display: none;
          padding: 24px;
        }
        
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .plant-card {
          background: linear-gradient(145deg, #f8fff8, #e8f8ef);
          border-radius: 12px;
          padding: 24px;
          border: 2px solid #d4efdf;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .plant-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--vivero-green), var(--vivero-moss));
        }
        
        .plant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(39, 174, 96, 0.2);
          border-color: var(--vivero-green);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .card-id {
          font-weight: 700;
          color: var(--vivero-sky);
          font-size: 14px;
          background: #e3f2fd;
          padding: 4px 12px;
          border-radius: 20px;
        }
        
        .card-body {
          margin-bottom: 20px;
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--vivero-forest-dark);
          margin: 0 0 8px 0;
          line-height: 1.3;
        }
        
        .card-scientific {
          font-style: italic;
          color: var(--vivero-green-darker);
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.4;
        }
        
        .card-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .detail-label {
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        .detail-value {
          font-weight: 600;
          color: var(--vivero-forest-dark);
          font-size: 14px;
        }
        
        /* Estado vacío */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          display: none;
        }
        
        .empty-icon {
          font-size: 64px;
          color: #d4efdf;
          margin-bottom: 24px;
        }
        
        .empty-state h3 {
          color: var(--vivero-forest);
          margin-bottom: 12px;
          font-size: 24px;
        }
        
        .empty-state p {
          color: #7f8c8d;
          margin-bottom: 32px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          font-size: 16px;
          line-height: 1.5;
        }
        
        /* Modal styles */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .modal.show {
          opacity: 1;
        }
        
        .modal-content {
          background: linear-gradient(145deg, #f8fff8, #e8f8ef);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          transform: translateY(-20px);
          transition: transform 0.3s ease;
          border: 2px solid #d4efdf;
        }
        
        .modal.show .modal-content {
          transform: translateY(0);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 2px solid #d4efdf;
          background: #e8f8ef;
          border-radius: 12px 12px 0 0;
        }
        
        .modal-header h3 {
          margin: 0;
          color: var(--vivero-forest-dark);
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--vivero-green);
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .modal-close:hover {
          background: rgba(39, 174, 96, 0.1);
          color: #e74c3c;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .modal-footer {
          padding: 20px 24px;
          border-top: 2px solid #d4efdf;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #e8f8ef;
          border-radius: 0 0 12px 12px;
        }
        
        /* Form styles */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-group label {
          font-weight: 600;
          color: var(--vivero-forest-dark);
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border: 2px solid #d4efdf;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f8fff8;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--vivero-green);
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2);
          background: white;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-grid {
            grid-template-columns: 1fr;
          }
          
          .results-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .summary-info {
            justify-content: center;
          }
          
          .cards-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .data-table {
            min-width: 600px;
          }
          
          .view-btn {
            padding: 8px 12px;
            font-size: 13px;
          }
          
          .view-btn i {
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          .stat-card {
            flex-direction: column;
            text-align: center;
            padding: 16px;
          }
          
          .stat-icon {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          
          .btn {
            width: 100%;
            justify-content: center;
          }
          
          .action-buttons-group .btn {
            width: auto;
            flex: 1;
            min-width: 120px;
          }
          
          .modal-content {
            width: 95%;
            margin: 10px;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  init() {
    console.log('🌱 Inicializando módulo de Plantas');
    this.bindEvents();
    this.loadPlants(false);
    this.updateStats();

    // Cargar la vista guardada del usuario
    this.switchView(this.currentView, true);
  }

  destroy() {
    console.log('🧹 Limpiando módulo de Plantas');
    const styleElement = document.getElementById('plant-manager-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  bindEvents() {
    console.log('🔗 Enlazando eventos del módulo de Plantas');

    // Botones principales
    document.getElementById('addPlantBtn')?.addEventListener('click', () => this.openPlantModal());
    document.getElementById('addFirstPlantBtn')?.addEventListener('click', () => this.openPlantModal());
    document.getElementById('importPlantsBtn')?.addEventListener('click', () => this.importPlants());
    document.getElementById('exportPlantsBtn')?.addEventListener('click', () => this.exportPlants());
    document.getElementById('printPlantsBtn')?.addEventListener('click', () => this.printPlants());
    document.getElementById('deleteAllPlantsBtn')?.addEventListener('click', () => this.deleteAllPlants());
    document.getElementById('refreshDataBtn')?.addEventListener('click', () => this.loadPlants());

    // Filtros y búsqueda
    document.getElementById('searchPlants')?.addEventListener('input', (e) => {
      this.filterPlants();
      this.updateSearchResultsCount();
    });

    document.getElementById('sortBy')?.addEventListener('change', () => this.sortPlants());

    // Limpiar filtros
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());
    document.getElementById('resetFiltersEmptyBtn')?.addEventListener('click', () => this.clearFilters());

    // Alternar vista - GUARDAR PREFERENCIA
    document.getElementById('viewTableBtn')?.addEventListener('click', () => {
      this.switchView('table');
      this.saveViewPreference('table');
    });

    document.getElementById('viewCardsBtn')?.addEventListener('click', () => {
      this.switchView('cards');
      this.saveViewPreference('cards');
    });

    // Ordenar por clic en cabecera
    document.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', (e) => {
        const sortField = th.dataset.sort;
        this.sortByField(sortField);
      });
    });
  }

  saveViewPreference(view) {
    localStorage.setItem('plantas_view', view);
  }

  switchView(viewType, initialLoad = false) {
    const tableView = document.getElementById('tableView');
    const cardsView = document.getElementById('cardsView');
    const tableBtn = document.getElementById('viewTableBtn');
    const cardsBtn = document.getElementById('viewCardsBtn');
    const emptyState = document.getElementById('emptyState');

    // Actualizar vista actual
    this.currentView = viewType;

    // Mostrar solo la vista seleccionada
    if (viewType === 'table') {
      tableView.style.display = 'block';
      cardsView.style.display = 'none';
      if (emptyState) emptyState.style.display = 'none';

      // Actualizar botones
      tableBtn?.classList.add('active');
      cardsBtn?.classList.remove('active');

      // Renderizar tabla si hay datos (solo si no es carga inicial)
      if (!initialLoad && this.filteredPlants.length > 0) {
        this.renderPlantsTable(this.filteredPlants);
      }
    } else {
      tableView.style.display = 'none';
      cardsView.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';

      // Actualizar botones
      tableBtn?.classList.remove('active');
      cardsBtn?.classList.add('active');

      // Renderizar tarjetas si hay datos (solo si no es carga inicial)
      if (!initialLoad && this.filteredPlants.length > 0) {
        this.renderPlantCards(this.filteredPlants);
      }
    }

    // Mostrar estado vacío si no hay datos
    if (this.filteredPlants.length === 0 && emptyState) {
      emptyState.style.display = 'block';
    }
  }

  updateSearchResultsCount() {
    const count = this.filteredPlants.length;
    const total = this.plants.length;
    const resultsElement = document.getElementById('searchResultsCount');

    if (resultsElement) {
      resultsElement.textContent = `${count} de ${total} resultados`;

      // Cambiar color según resultados
      if (count === 0) {
        resultsElement.style.color = '#e74c3c';
      } else if (count === total) {
        resultsElement.style.color = '#27ae60';
      } else {
        resultsElement.style.color = '#3498db';
      }
    }
  }

  clearFilters() {
    document.getElementById('searchPlants').value = '';
    document.getElementById('sortBy').value = 'id_asc';

    this.filterPlants();
    this.updateSearchResultsCount();

    if (!this.notificationShown) {
      window.app.showNotification('Filtros restablecidos', 'success');
      this.notificationShown = true;
      setTimeout(() => { this.notificationShown = false; }, 1000);
    }
  }

  sortPlants() {
    const sortValue = document.getElementById('sortBy').value;
    let sortedPlants = [...this.filteredPlants];

    switch (sortValue) {
      case 'id_asc':
        sortedPlants.sort((a, b) => this.extractIdNumber(a.id) - this.extractIdNumber(b.id));
        break;
      case 'id_desc':
        sortedPlants.sort((a, b) => this.extractIdNumber(b.id) - this.extractIdNumber(a.id));
        break;
      case 'name_asc':
        sortedPlants.sort((a, b) => (a.commonName || '').localeCompare(b.commonName || ''));
        break;
      case 'name_desc':
        sortedPlants.sort((a, b) => (b.commonName || '').localeCompare(a.commonName || ''));
        break;
      case 'scientific_asc':
        sortedPlants.sort((a, b) => (a.scientificName || '').localeCompare(b.scientificName || ''));
        break;
      case 'scientific_desc':
        sortedPlants.sort((a, b) => (b.scientificName || '').localeCompare(a.scientificName || ''));
        break;
      case 'date_asc':
        sortedPlants.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'date_desc':
        sortedPlants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    this.filteredPlants = sortedPlants;

    // Renderizar según la vista actual
    if (this.currentView === 'table') {
      this.renderPlantsTable(this.filteredPlants);
    } else {
      this.renderPlantCards(this.filteredPlants);
    }
  }

  sortByField(field) {
    const sortSelect = document.getElementById('sortBy');
    if (!sortSelect) return;

    // Encontrar la opción que corresponda al campo
    const options = {
      'id': 'id_asc',
      'commonName': 'name_asc',
      'scientificName': 'scientific_asc',
      'createdAt': 'date_desc',
      'updatedAt': 'date_desc'
    };

    if (options[field]) {
      sortSelect.value = options[field];
      this.sortPlants();
    }
  }

  extractIdNumber(id) {
    if (!id || !id.startsWith('PLA-')) return 0;
    const num = parseInt(id.replace('PLA-', ''));
    return isNaN(num) ? 0 : num;
  }

  openPlantModal(plantId = null) {
    this.currentPlantId = plantId;

    if (!document.getElementById('plantModal')) {
      this.createPlantModal();
    }

    const modal = document.getElementById('plantModal');
    const form = document.getElementById('plantForm');

    if (plantId) {
      document.getElementById('modalTitle').textContent = 'Editar Planta';
      const plant = this.plants.find(p => p.id == plantId);
      if (plant) {
        document.getElementById('plantId').value = plant.id;
        document.getElementById('commonName').value = plant.commonName || '';
        document.getElementById('scientificName').value = plant.scientificName || '';
      }
    } else {
      document.getElementById('modalTitle').textContent = 'Nueva Planta';
      if (form) form.reset();
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  renderPlantCards(plantsToShow = this.filteredPlants) {
    const cardsGrid = document.getElementById('plantsCardsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!cardsGrid) return;

    cardsGrid.innerHTML = '';

    if (plantsToShow.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    plantsToShow.forEach(plant => {
      const createdAt = new Date(plant.createdAt);
      const updatedAt = new Date(plant.updatedAt);

      const card = document.createElement('div');
      card.className = 'plant-card';
      card.innerHTML = `
        <div class="card-header">
          <span class="card-id">${plant.id}</span>
          <span class="badge bg-success">Registrada</span>
        </div>
        <div class="card-body">
          <h4 class="card-title">${plant.commonName || ''}</h4>
          <p class="card-scientific">${plant.scientificName || ''}</p>
          <div class="card-details">
            <div class="detail-item">
              <span class="detail-label">Registrada</span>
              <span class="detail-value">${createdAt.toLocaleDateString('es-MX')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Actualizada</span>
              <span class="detail-value">${updatedAt.toLocaleDateString('es-MX')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Hora</span>
              <span class="detail-value">${updatedAt.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Estado</span>
              <span class="detail-value">
                <span class="badge bg-light">
                  ${this.getTimeAgo(updatedAt)}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <div class="actions">
            <button class="action-btn edit" data-id="${plant.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${plant.id}" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      cardsGrid.appendChild(card);
    });

    // Agregar event listeners a los botones de las tarjetas
    cardsGrid.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const plantId = target.getAttribute('data-id');
      if (target.classList.contains('edit')) {
        this.openPlantModal(plantId);
      } else if (target.classList.contains('delete')) {
        this.openConfirmModal(plantId);
      }
    });
  }

  filterPlants() {
    const searchTerm = document.getElementById('searchPlants')?.value.toLowerCase() || '';

    this.filteredPlants = this.plants.filter(plant => {
      const matchesSearch = !searchTerm ||
        (plant.commonName && plant.commonName.toLowerCase().includes(searchTerm)) ||
        (plant.scientificName && plant.scientificName.toLowerCase().includes(searchTerm)) ||
        (plant.id && plant.id.toLowerCase().includes(searchTerm));

      return matchesSearch;
    });

    // Aplicar ordenamiento actual
    this.sortPlants();

    this.updateVisibleStats();
  }

  renderPlantsTable(plantsToShow = this.filteredPlants) {
    const tbody = document.getElementById('plantsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (plantsToShow.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    plantsToShow.forEach(plant => {
      const createdAt = new Date(plant.createdAt);
      const updatedAt = new Date(plant.updatedAt);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong class="text-primary">${plant.id}</strong></td>
        <td>${plant.commonName || ''}</td>
        <td><em class="text-success">${plant.scientificName || ''}</em></td>
        <td>${createdAt.toLocaleDateString('es-MX')}</td>
        <td>${updatedAt.toLocaleDateString('es-MX')} ${updatedAt.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" data-id="${plant.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${plant.id}" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Actualizar contadores
    this.updateVisibleStats();

    // Agregar event listeners a los botones de la tabla
    tbody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const plantId = target.getAttribute('data-id');
      if (target.classList.contains('edit')) {
        this.openPlantModal(plantId);
      } else if (target.classList.contains('delete')) {
        this.openConfirmModal(plantId);
      }
    });
  }

  updateStats() {
    const totalPlants = this.plants.length;
    const uniqueSpecies = new Set(this.plants.map(p => p.scientificName?.toLowerCase()).filter(Boolean)).size;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const updatedToday = this.plants.filter(p => {
      const updated = new Date(p.updatedAt);
      updated.setHours(0, 0, 0, 0);
      return updated.getTime() === today.getTime();
    }).length;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentPlants = this.plants.filter(p => new Date(p.createdAt) >= lastMonth).length;

    document.getElementById('totalPlantsCount').textContent = totalPlants.toLocaleString();
    document.getElementById('uniqueSpecies').textContent = uniqueSpecies.toLocaleString();
    document.getElementById('recentPlants').textContent = recentPlants.toLocaleString();
    document.getElementById('updatedToday').textContent = updatedToday.toLocaleString();
  }

  updateVisibleStats() {
    const visiblePlants = this.filteredPlants.length;
    const visibleSpecies = new Set(this.filteredPlants.map(p => p.scientificName?.toLowerCase()).filter(Boolean)).size;

    let lastUpdate = '-';
    if (this.filteredPlants.length > 0) {
      const latest = this.filteredPlants.reduce((latest, plant) => {
        return new Date(plant.updatedAt) > new Date(latest.updatedAt) ? plant : latest;
      });
      lastUpdate = new Date(latest.updatedAt).toLocaleDateString('es-MX');
    }

    document.getElementById('visiblePlantsCount').textContent = visiblePlants.toLocaleString();
    document.getElementById('visibleSpeciesCount').textContent = visibleSpecies.toLocaleString();
    document.getElementById('lastUpdateDate').textContent = lastUpdate;
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} horas`;
    if (diffDays < 7) return `${diffDays} días`;
    return `${Math.floor(diffDays / 7)} semanas`;
  }

  loadPlants(showNotification = true) {
    try {
      this.plants = JSON.parse(localStorage.getItem('vivero_plantas')) || [];
      this.filteredPlants = [...this.plants];

      // Renderizar según la vista actual
      if (this.currentView === 'cards') {
        this.renderPlantCards(this.filteredPlants);
      } else {
        this.renderPlantsTable(this.filteredPlants);
      }

      this.updateStats();
      this.updateSearchResultsCount();

      if (showNotification) {
        window.app.showNotification('Datos de plantas cargados', 'success');
      }
    } catch (error) {
      console.error('Error cargando plantas:', error);
      this.plants = [];
      this.filteredPlants = [];
      this.renderPlantsTable(this.filteredPlants);
      window.app.showNotification('Error cargando plantas', 'error');
    }
  }

  generatePlantId() {
    let maxNumber = 0;

    this.plants.forEach(plant => {
      if (plant.id && plant.id.startsWith('PLA-')) {
        const numPart = plant.id.replace('PLA-', '');
        const num = parseInt(numPart);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    return `PLA-${maxNumber + 1}`;
  }

  createPlantModal() {
    const modalHTML = `
      <div class="modal" id="plantModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Nueva Planta</h3>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>
          <div class="modal-body">
            <form id="plantForm">
              <input type="hidden" id="plantId">
              <div class="form-row">
                <div class="form-group">
                  <label for="commonName">Nombre Común *</label>
                  <input type="text" id="commonName" required>
                </div>
                <div class="form-group">
                  <label for="scientificName">Nombre Científico *</label>
                  <input type="text" id="scientificName" required>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="modalCancel">Cancelar</button>
            <button class="btn btn-primary" id="modalSave">Guardar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('modalClose').addEventListener('click', () => this.closeModal('plantModal'));
    document.getElementById('modalCancel').addEventListener('click', () => this.closeModal('plantModal'));
    document.getElementById('modalSave').addEventListener('click', () => this.savePlant());

    document.getElementById('plantModal').addEventListener('click', (e) => {
      if (e.target.id === 'plantModal') this.closeModal('plantModal');
    });
  }

  createConfirmModal() {
    const modalHTML = `
      <div class="modal" id="confirmModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
            <button class="modal-close" id="confirmClose">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar esta planta?</p>
            <p class="text-warning">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="confirmCancel">Cancelar</button>
            <button class="btn btn-danger" id="confirmDelete">Eliminar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('confirmClose').addEventListener('click', () => this.closeModal('confirmModal'));
    document.getElementById('confirmCancel').addEventListener('click', () => this.closeModal('confirmModal'));
    document.getElementById('confirmDelete').addEventListener('click', () => this.deletePlant());

    document.getElementById('confirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'confirmModal') this.closeModal('confirmModal');
    });
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
      if (modalId === 'plantModal') {
        document.getElementById('plantForm')?.reset();
        this.currentPlantId = null;
      }
    }, 300);
  }

  openConfirmModal(plantId) {
    this.currentPlantId = plantId;

    if (!document.getElementById('confirmModal')) {
      this.createConfirmModal();
    }

    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  savePlant() {
    const form = document.getElementById('plantForm');
    const saveButton = document.getElementById('modalSave');

    if (!form || !saveButton) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const commonName = document.getElementById('commonName').value.trim();
    const scientificName = document.getElementById('scientificName').value.trim();

    if (!commonName || !scientificName) {
      window.app.showNotification('Nombre común y científico son obligatorios', 'error');
      return;
    }

    saveButton.classList.add('loading');
    saveButton.disabled = true;

    setTimeout(() => {
      const plantIdValue = document.getElementById('plantId').value;
      const now = new Date().toISOString();

      let plantData = {
        commonName: commonName,
        scientificName: scientificName,
        updatedAt: now
      };

      if (plantIdValue) {
        // Actualizar planta existente
        const index = this.plants.findIndex(p => p.id == plantIdValue);
        if (index !== -1) {
          plantData.id = plantIdValue;
          plantData.createdAt = this.plants[index].createdAt || now;
          this.plants[index] = plantData;
          window.app.showNotification('Planta actualizada correctamente', 'success');
        }
      } else {
        // Crear nueva planta con ID PLA-N
        plantData.id = this.generatePlantId();
        plantData.createdAt = now;
        this.plants.push(plantData);
        window.app.showNotification('Planta creada correctamente', 'success');
      }

      localStorage.setItem('vivero_plantas', JSON.stringify(this.plants));

      // Recargar y actualizar vistas
      this.loadPlants(false);
      this.filterPlants();
      this.closeModal('plantModal');

      saveButton.classList.remove('loading');
      saveButton.disabled = false;
    }, 500);
  }

  deletePlant() {
    if (this.currentPlantId) {
      this.plants = this.plants.filter(plant => plant.id != this.currentPlantId);
      localStorage.setItem('vivero_plantas', JSON.stringify(this.plants));
      this.loadPlants(false);
      window.app.showNotification('Planta eliminada correctamente', 'success');
    }
    this.closeModal('confirmModal');
  }

  deleteAllPlants() {
    if (this.plants.length === 0) {
      window.app.showNotification('No hay plantas para eliminar', 'warning');
      return;
    }

    if (confirm(`⚠️ ¿Estás seguro de eliminar TODAS las plantas (${this.plants.length})?\n\nEsta acción no se puede deshacer.`)) {
      this.plants = [];
      localStorage.setItem('vivero_plantas', JSON.stringify(this.plants));
      this.loadPlants(false);
      window.app.showNotification('Todas las plantas han sido eliminadas', 'success');
    }
  }

  importPlants() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedPlants = JSON.parse(event.target.result);

          if (!Array.isArray(importedPlants)) {
            throw new Error('El archivo no contiene un array válido');
          }

          // Verificar nombres científicos duplicados
          const existingScientificNames = new Set(
            this.plants.map(p => p.scientificName?.toLowerCase()).filter(Boolean)
          );

          const newPlants = importedPlants.filter(plant =>
            plant.scientificName && !existingScientificNames.has(plant.scientificName.toLowerCase())
          );

          if (newPlants.length > 0) {
            let maxNumber = 0;

            // Verificar IDs existentes
            this.plants.forEach(plant => {
              if (plant.id && plant.id.startsWith('PLA-')) {
                const numPart = plant.id.replace('PLA-', '');
                const num = parseInt(numPart);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              }
            });

            // Verificar IDs en las nuevas plantas
            newPlants.forEach(plant => {
              if (plant.id && plant.id.startsWith('PLA-')) {
                const numPart = plant.id.replace('PLA-', '');
                const num = parseInt(numPart);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              }
            });

            // Asignar nuevos IDs secuenciales
            newPlants.forEach((plant) => {
              if (!plant.id || !plant.id.startsWith('PLA-')) {
                maxNumber++;
                plant.id = `PLA-${maxNumber}`;
              }
              const now = new Date().toISOString();
              plant.createdAt = plant.createdAt || now;
              plant.updatedAt = now;
            });

            this.plants = [...this.plants, ...newPlants];
            localStorage.setItem('vivero_plantas', JSON.stringify(this.plants));
            this.loadPlants(false);

            window.app.showNotification(
              `Importadas ${newPlants.length} nuevas plantas`,
              'success',
              'Importación Exitosa'
            );
          } else {
            window.app.showNotification(
              'No se encontraron plantas nuevas para importar',
              'info',
              'Importación'
            );
          }
        } catch (error) {
          console.error('Error al importar:', error);
          window.app.showNotification(
            `Error al importar: ${error.message}`,
            'error',
            'Error de Importación'
          );
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  exportPlants() {
    if (this.plants.length === 0) {
      window.app.showNotification('No hay plantas para exportar', 'warning');
      return;
    }

    const dataStr = JSON.stringify(this.plants, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `plantas_vivero_chaka_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showNotification(
      `Exportadas ${this.plants.length} plantas`,
      'success',
      'Exportación Exitosa'
    );
  }

  printPlants() {
    if (this.plants.length === 0) {
      window.app.showNotification('No hay plantas para imprimir', 'warning');
      return;
    }

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Catálogo de Plantas - MEXICO PRIMERO S. DE S.S.</title>
        <style>
          @page {
            margin: 15mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #196f3d;
          }
          .logo-container {
            flex-shrink: 0;
            margin-right: 15px;
          }
          .company-info {
            flex-grow: 1;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #196f3d;
            margin-bottom: 3px;
          }
          .company-subtitle {
            font-size: 12px;
            color: #27ae60;
            margin-bottom: 3px;
          }
          .company-details {
            font-size: 10px;
            color: #666;
            margin-bottom: 3px;
          }
          .report-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #27ae60;
            margin: 10px 0;
            padding: 5px;
            background-color: #f0f8f0;
            border-radius: 3px;
            border: 1px solid #d4efdf;
          }
          .date-info {
            text-align: right;
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            font-size: 9px;
          }
          th {
            background-color: #196f3d;
            color: white;
            padding: 6px 4px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
          }
          td {
            padding: 5px 4px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          tr:nth-child(even) {
            background-color: #f0f8f0;
          }
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 9px;
            color: #7f8c8d;
            border-top: 1px solid #ddd;
            padding-top: 5px;
          }
          .summary-row {
            background-color: #e8f8ef !important;
            font-weight: bold;
            border-top: 2px solid #196f3d;
          }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="logo.png" alt="Logo" style="width: 60px; height: auto;">
          </div>
          <div class="company-info">
            <div class="company-name">MEXICO PRIMERO S. DE S.S.</div>
            <div class="company-subtitle">GANADERIA, AGRICULTURA Y REFORESTACIÓN</div>
            <div class="company-details">DOMICILIO CONOCIDO TZUCACAB, YUCATAN</div>
            <div class="company-details">RFC: MPR980510JT9</div>
            <div class="company-details">Tel: 99-97-48-26-11 | Email: administracion@mexicoprimero.mx</div>
          </div>
        </div>
        
        <div class="report-title">CATÁLOGO DE PLANTAS</div>
        
        <div class="date-info">
          <strong>Fecha:</strong> ${currentDate}<br>
          <strong>Generado por:</strong> Ing. Luis Gerardo Herrera Tuz
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Común</th>
              <th>Nombre Científico</th>
              <th>Fecha Registro</th>
              <th>Última Actualización</th>
            </tr>
          </thead>
          <tbody>
            ${this.plants.map(plant => {
      const createdAt = new Date(plant.createdAt);
      const updatedAt = new Date(plant.updatedAt);

      return `
                <tr>
                  <td><strong>${plant.id}</strong></td>
                  <td>${plant.commonName || ''}</td>
                  <td><em>${plant.scientificName || ''}</em></td>
                  <td>${createdAt.toLocaleDateString('es-MX')}</td>
                  <td>${updatedAt.toLocaleDateString('es-MX')}</td>
                </tr>
              `;
    }).join('')}
            <tr class="summary-row">
              <td colspan="5"><strong>TOTAL PLANTAS: ${this.plants.length}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Documento generado automáticamente por el Sistema de Gestión Vivero Chaka</p>
          <p>MEXICO PRIMERO S. DE S.S. | ${new Date().getFullYear()}</p>
          <p class="no-print">
            <button onclick="window.print()" style="padding: 5px 10px; background-color: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
              <i class="fas fa-print"></i> Imprimir
            </button>
          </p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  capitalizeFirst(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }
}

// Exportar para el sistema principal
window.PlantManager = PlantManager;

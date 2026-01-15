// Módulo de Gestión de Semillas Mejorado
class SeedManager {
  constructor() {
    this.seeds = JSON.parse(localStorage.getItem('vivero_semillas')) || [];
    this.currentSeedId = null;
    this.filteredSeeds = [...this.seeds];
    this.currentView = 'table'; // Vista actual: 'table' o 'cards'
    this.notificationShown = false; // Controlar notificaciones duplicadas
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
          <h2><i class="fas fa-seedling"></i> Gestión de Semillas</h2>
          <p class="subtitle">Administra el catálogo de semillas del vivero</p>
        </div>
        <div class="header-actions">
          <div class="action-buttons-group">
            <button class="btn btn-primary" id="addSeedBtn">
              <i class="fas fa-plus-circle"></i> Nueva Semilla
            </button>
            <button class="btn btn-outline" id="importSeedsBtn">
              <i class="fas fa-file-import"></i> Importar
            </button>
            <button class="btn btn-outline" id="exportSeedsBtn">
              <i class="fas fa-file-export"></i> Exportar
            </button>
            <button class="btn btn-outline" id="printSeedsBtn">
              <i class="fas fa-print"></i> Imprimir
            </button>
            <button class="btn btn-danger" id="deleteAllSeedsBtn">
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
              <div class="stat-icon" style="background: linear-gradient(135deg, #2ecc71, #27ae60);">
                <i class="fas fa-seedling"></i>
              </div>
              <div class="stat-info">
                <h3 id="totalSeedsCount">0</h3>
                <p>Total Semillas</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #3498db, #2980b9);">
                <i class="fas fa-boxes"></i>
              </div>
              <div class="stat-info">
                <h3 id="totalStock">0 kg</h3>
                <p>Stock Total</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f39c12, #d35400);">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="stat-info">
                <h3 id="totalValue">$0</h3>
                <p>Valor Total</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="stat-info">
                <h3 id="lowStockCount">0</h3>
                <p>Stock Bajo</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: linear-gradient(135deg, #95a5a6, #7f8c8d);">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="stat-info">
                <h3 id="outOfStockCount">0</h3>
                <p>Sin Stock</p>
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
                     id="searchSeeds" 
                     placeholder="Buscar por nombre común, científico o ID..."
                     class="search-input">
              <div class="search-tools">
                <span id="searchResultsCount">0 resultados</span>
              </div>
            </div>

            <div class="filter-grid">
              <div class="filter-group">
                <label for="filterClassification" class="filter-label">
                  <i class="fas fa-tag"></i> Clasificación
                </label>
                <div class="filter-select-wrapper">
                  <select id="filterClassification" class="filter-select">
                    <option value="">Todas las clasificaciones</option>
                    <option value="recalcitrante">Recalcitrante</option>
                    <option value="intermedia">Intermedia</option>
                    <option value="ortodoxa">Ortodoxa</option>
                    <option value="vareta">Vareta</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>

              <div class="filter-group">
                <label for="filterStock" class="filter-label">
                  <i class="fas fa-box"></i> Estado de Stock
                </label>
                <div class="filter-select-wrapper">
                  <select id="filterStock" class="filter-select">
                    <option value="">Todo el stock</option>
                    <option value="out">Sin stock (0 kg)</option>
                    <option value="low">Stock bajo (<50 kg)</option>
                    <option value="optimal">Stock óptimo (50-200 kg)</option>
                    <option value="high">Stock alto (>200 kg)</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>

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
                    <option value="stock_asc">Stock (Bajo a Alto)</option>
                    <option value="stock_desc">Stock (Alto a Bajo)</option>
                    <option value="value_asc">Valor (Bajo a Alto)</option>
                    <option value="value_desc">Valor (Alto a Bajo)</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">
                  <i class="fas fa-eye"></i> Vista
                </label>
                <div class="view-toggle">
                  <button class="view-btn active" id="viewTableBtn" title="Vista de tabla">
                    <i class="fas fa-table"></i> Tabla
                  </button>
                  <button class="view-btn" id="viewCardsBtn" title="Vista de tarjetas">
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
                  <i class="fas fa-list"></i> <span id="visibleSeedsCount">0</span> registros
                </span>
                <span class="badge bg-light text-dark">
                  <i class="fas fa-box"></i> Stock: <span id="visibleStockTotal">0 kg</span>
                </span>
                <span class="badge bg-light text-dark">
                  <i class="fas fa-dollar-sign"></i> Valor: <span id="visibleValueTotal">$0</span>
                </span>
              </div>
            </div>
            <div class="results-actions">
              <button class="btn btn-sm btn-outline" id="refreshDataBtn">
                <i class="fas fa-sync-alt"></i> Actualizar
              </button>
            </div>
          </div>

          <!-- Vista de tabla (por defecto) -->
          <div class="view-container">
            <div class="table-view" id="tableView">
              <div class="table-responsive">
                <table id="seedsTable" class="data-table">
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
                      <th data-sort="classification">
                        <div class="th-content">
                          <span>Clasificación</span>
                        </div>
                      </th>
                      <th data-sort="availableMonths">
                        <div class="th-content">
                          <span>Meses</span>
                        </div>
                      </th>
                      <th data-sort="seedsPerKilo" class="sortable numeric">
                        <div class="th-content">
                          <span>Sem/Kg</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="unitPrice" class="sortable numeric">
                        <div class="th-content">
                          <span>Precio/Kg</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="stock" class="sortable numeric">
                        <div class="th-content">
                          <span>Stock (Kg)</span>
                          <i class="fas fa-sort"></i>
                        </div>
                      </th>
                      <th data-sort="status">
                        <div class="th-content">
                          <span>Estado</span>
                        </div>
                      </th>
                      <th data-sort="value" class="sortable numeric">
                        <div class="th-content">
                          <span>Valor</span>
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
                  <tbody id="seedsTableBody">
                    <!-- Las semillas se cargarán aquí -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Vista de tarjetas (alternativa) -->
            <div class="cards-view" id="cardsView">
              <div class="cards-grid" id="seedsCardsGrid">
                <!-- Las tarjetas se cargarán aquí -->
              </div>
            </div>

            <!-- Estado vacío -->
            <div class="empty-state" id="emptyState">
              <div class="empty-icon">
                <i class="fas fa-seedling"></i>
              </div>
              <h3>No se encontraron semillas</h3>
              <p>No hay semillas que coincidan con los filtros aplicados.</p>
              <button class="btn btn-primary" id="addFirstSeedBtn">
                <i class="fas fa-plus"></i> Agregar primera semilla
              </button>
              <button class="btn btn-outline" id="resetFiltersEmptyBtn">
                <i class="fas fa-undo"></i> Restablecer filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Agregar estilos CSS adicionales para el diseño mejorado
    this.injectStyles();
  }

  injectStyles() {
    const styleId = 'seed-manager-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      <style id="${styleId}">
        /* Estilos mejorados para el módulo de semillas */
        
        /* Colores de vivero */
        :root {
          --vivero-green: #27ae60;
          --vivero-green-dark: #219a52;
          --vivero-green-light: #2ecc71;
          --vivero-brown: #8b4513;
          --vivero-brown-light: #a0522d;
          --vivero-earth: #d2691e;
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
          background: linear-gradient(135deg, var(--vivero-green), var(--vivero-green-dark));
          color: white;
          border-color: var(--vivero-green);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--vivero-green-dark), var(--vivero-green));
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

        /* Panel de estadísticas */
        .stats-panel {
          background: linear-gradient(135deg, var(--vivero-brown), var(--vivero-earth));
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
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.15);
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
        }
        
        .stat-info h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: white;
        }
        
        .stat-info p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        /* Panel de filtros */
        .filter-panel {
          background: white;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
        }
        
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .filter-header h3 {
          margin: 0;
          font-size: 18px;
          color: #2c3e50;
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
          color: #6c757d;
          font-size: 16px;
        }
        
        .search-input {
          width: 100%;
          padding: 16px 20px 16px 50px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--vivero-green);
          background: white;
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
        }
        
        .search-tools {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #6c757d;
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
          color: #2c3e50;
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
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          background: #f8f9fa;
          appearance: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: var(--vivero-green);
          background: white;
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
        }
        
        .select-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #6c757d;
        }
        
        /* Toggle de vista mejorado */
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f8f9fa;
          padding: 4px;
          border-radius: 8px;
          border: 2px solid #e9ecef;
          width: 100%;
        }
        
        .view-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: none;
          border-radius: 6px;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .view-btn:hover {
          background: #e9ecef;
          color: #2c3e50;
        }
        
        .view-btn.active {
          background: var(--vivero-green);
          color: white;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
        }
        
        .view-btn.active:hover {
          background: var(--vivero-green-dark);
          color: white;
        }
        
        /* Panel de resultados */
        .results-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .results-summary h4 {
          margin: 0 0 12px 0;
          color: #2c3e50;
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
          background: #f8f9fa;
          border: 1px solid #e9ecef;
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
          min-width: 1200px;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .data-table th {
          background: #f8f9fa;
          padding: 16px;
          font-weight: 600;
          color: #2c3e50;
          text-align: left;
          border-bottom: 2px solid #e9ecef;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .data-table td {
          padding: 16px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
          transition: background 0.2s ease;
        }
        
        .data-table tbody tr:hover {
          background: #f8fafc;
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
          background: #e9ecef;
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
        
        .badge.recalcitrante { background: #ffeaa7; color: #856404; }
        .badge.intermedia { background: #a29bfe; color: #2d3436; }
        .badge.ortodoxa { background: #74b9ff; color: #0c5460; }
        .badge.vareta { background: #55efc4; color: #00695c; }
        
        .badge.bg-danger { background: #ff6b6b; color: white; }
        .badge.bg-warning { background: #ffd93d; color: #856404; }
        .badge.bg-success { background: var(--vivero-green); color: white; }
        .badge.bg-info { background: var(--vivero-sky); color: white; }
        .badge.bg-light { background: #f8f9fa; color: #212529; }
        
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
        
        .seed-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .seed-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
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
          color: #2c3e50;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }
        
        .card-scientific {
          font-style: italic;
          color: #6c757d;
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
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        .detail-value {
          font-weight: 600;
          color: #2c3e50;
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
          color: #ddd;
          margin-bottom: 24px;
        }
        
        .empty-state h3 {
          color: #6c757d;
          margin-bottom: 12px;
          font-size: 24px;
        }
        
        .empty-state p {
          color: #adb5bd;
          margin-bottom: 32px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          font-size: 16px;
          line-height: 1.5;
        }
        
        /* Vista de tabla */
        .table-view {
          display: none;
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
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          transform: translateY(-20px);
          transition: transform 0.3s ease;
        }
        
        .modal.show .modal-content {
          transform: translateY(0);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6c757d;
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
          background: #f8f9fa;
          color: #e74c3c;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
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
          color: #2c3e50;
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--vivero-green);
          box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
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
            min-width: 800px;
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
    console.log('🎯 Inicializando módulo de Semillas mejorado');
    this.bindEvents();
    this.loadSeeds(false); // No mostrar notificación al cargar
    this.updateQuickStats();
  }

  destroy() {
    console.log('🧹 Limpiando módulo de Semillas');
    // Eliminar estilos inyectados
    const styleElement = document.getElementById('seed-manager-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  bindEvents() {
    console.log('🔗 Enlazando eventos del módulo de Semillas');

    // Botones principales
    document.getElementById('addSeedBtn')?.addEventListener('click', () => this.openSeedModal());
    document.getElementById('addFirstSeedBtn')?.addEventListener('click', () => this.openSeedModal());
    document.getElementById('importSeedsBtn')?.addEventListener('click', () => this.importSeeds());
    document.getElementById('exportSeedsBtn')?.addEventListener('click', () => this.exportSeeds());
    document.getElementById('printSeedsBtn')?.addEventListener('click', () => this.printSeeds());
    document.getElementById('deleteAllSeedsBtn')?.addEventListener('click', () => this.deleteAllSeeds());
    document.getElementById('refreshDataBtn')?.addEventListener('click', () => this.loadSeeds());

    // Filtros y búsqueda
    document.getElementById('searchSeeds')?.addEventListener('input', (e) => {
      this.filterSeeds();
      this.updateSearchResultsCount();
    });

    document.getElementById('filterClassification')?.addEventListener('change', () => {
      this.filterSeeds();
      this.updateSearchResultsCount();
    });

    document.getElementById('filterStock')?.addEventListener('change', () => {
      this.filterSeeds();
      this.updateSearchResultsCount();
    });

    document.getElementById('sortBy')?.addEventListener('change', () => this.sortSeeds());

    // Limpiar filtros
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());
    document.getElementById('resetFiltersEmptyBtn')?.addEventListener('click', () => this.clearFilters());

    // Alternar vista - CORREGIDO
    document.getElementById('viewTableBtn')?.addEventListener('click', () => {
      this.switchView('table');
    });

    document.getElementById('viewCardsBtn')?.addEventListener('click', () => {
      this.switchView('cards');
    });

    // Ordenar por clic en cabecera
    document.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', (e) => {
        const sortField = th.dataset.sort;
        this.sortByField(sortField);
      });
    });
  }

  switchView(viewType) {
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
      tableBtn.classList.add('active');
      cardsBtn.classList.remove('active');

      // Renderizar tabla si hay datos
      if (this.filteredSeeds.length > 0) {
        this.renderSeedsTable(this.filteredSeeds);
      }
    } else {
      tableView.style.display = 'none';
      cardsView.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';

      // Actualizar botones
      tableBtn.classList.remove('active');
      cardsBtn.classList.add('active');

      // Renderizar tarjetas si hay datos
      if (this.filteredSeeds.length > 0) {
        this.renderSeedCards(this.filteredSeeds);
      }
    }

    // Mostrar estado vacío si no hay datos
    if (this.filteredSeeds.length === 0 && emptyState) {
      emptyState.style.display = 'block';
    }
  }

  updateSearchResultsCount() {
    const count = this.filteredSeeds.length;
    const total = this.seeds.length;
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
    document.getElementById('searchSeeds').value = '';
    document.getElementById('filterClassification').value = '';
    document.getElementById('filterStock').value = '';
    document.getElementById('sortBy').value = 'id_asc';

    this.filterSeeds();
    this.updateSearchResultsCount();

    // Mostrar notificación solo una vez
    if (!this.notificationShown) {
      window.app.showNotification('Filtros restablecidos', 'success');
      this.notificationShown = true;
      setTimeout(() => { this.notificationShown = false; }, 1000);
    }
  }

  sortSeeds() {
    const sortValue = document.getElementById('sortBy').value;
    let sortedSeeds = [...this.filteredSeeds];

    switch (sortValue) {
      case 'id_asc':
        sortedSeeds.sort((a, b) => this.extractIdNumber(a.id) - this.extractIdNumber(b.id));
        break;
      case 'id_desc':
        sortedSeeds.sort((a, b) => this.extractIdNumber(b.id) - this.extractIdNumber(a.id));
        break;
      case 'name_asc':
        sortedSeeds.sort((a, b) => (a.commonName || '').localeCompare(b.commonName || ''));
        break;
      case 'name_desc':
        sortedSeeds.sort((a, b) => (b.commonName || '').localeCompare(a.commonName || ''));
        break;
      case 'stock_asc':
        sortedSeeds.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'stock_desc':
        sortedSeeds.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      case 'value_asc':
        sortedSeeds.sort((a, b) => ((a.unitPrice || 0) * (a.stock || 0)) - ((b.unitPrice || 0) * (b.stock || 0)));
        break;
      case 'value_desc':
        sortedSeeds.sort((a, b) => ((b.unitPrice || 0) * (b.stock || 0)) - ((a.unitPrice || 0) * (a.stock || 0)));
        break;
    }

    this.filteredSeeds = sortedSeeds;

    // Renderizar según la vista actual
    if (this.currentView === 'table') {
      this.renderSeedsTable(this.filteredSeeds);
    } else {
      this.renderSeedCards(this.filteredSeeds);
    }
  }

  sortByField(field) {
    // Implementar ordenamiento por campo específico
    console.log(`Ordenar por: ${field}`);
    // Por simplicidad, redirigir al ordenamiento general
    this.sortSeeds();
  }

  extractIdNumber(id) {
    if (!id || !id.startsWith('SEM-')) return 0;
    const num = parseInt(id.replace('SEM-', ''));
    return isNaN(num) ? 0 : num;
  }

  openSeedModal(seedId = null) {
    this.currentSeedId = seedId;

    if (!document.getElementById('seedModal')) {
      this.createSeedModal();
    }

    const modal = document.getElementById('seedModal');
    const form = document.getElementById('seedForm');

    if (seedId) {
      document.getElementById('modalTitle').textContent = 'Editar Semilla';
      const seed = this.seeds.find(s => s.id == seedId);
      if (seed) {
        document.getElementById('seedId').value = seed.id;
        document.getElementById('commonName').value = seed.commonName || '';
        document.getElementById('scientificName').value = seed.scientificName || '';
        document.getElementById('classification').value = seed.classification || '';
        document.getElementById('availableMonths').value = seed.availableMonths || '';
        document.getElementById('seedsPerKilo').value = seed.seedsPerKilo || '';
        document.getElementById('unitPrice').value = seed.unitPrice || '';
        document.getElementById('stock').value = seed.stock || '';
      }
    } else {
      document.getElementById('modalTitle').textContent = 'Nueva Semilla';
      if (form) form.reset();
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  renderSeedCards(seedsToShow = this.filteredSeeds) {
    const cardsGrid = document.getElementById('seedsCardsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!cardsGrid) return;

    cardsGrid.innerHTML = '';

    if (seedsToShow.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    seedsToShow.forEach(seed => {
      const stockValue = (seed.unitPrice || 0) * (seed.stock || 0);
      const stockStatus = this.getStockStatus(seed.stock || 0);
      const statusLabels = {
        'out': 'Sin Stock',
        'low': 'Stock Bajo',
        'optimal': 'Stock Óptimo',
        'high': 'Stock Alto'
      };
      const statusColors = {
        'out': 'danger',
        'low': 'warning',
        'optimal': 'success',
        'high': 'info'
      };

      const card = document.createElement('div');
      card.className = 'seed-card';
      card.innerHTML = `
        <div class="card-header">
          <span class="card-id">${seed.id}</span>
          <span class="badge bg-${statusColors[stockStatus]}">${statusLabels[stockStatus]}</span>
        </div>
        <div class="card-body">
          <h4 class="card-title">${seed.commonName || ''}</h4>
          <p class="card-scientific">${seed.scientificName || ''}</p>
          <div class="card-details">
            <div class="detail-item">
              <span class="detail-label">Clasificación</span>
              <span class="detail-value">
                <span class="badge ${seed.classification || ''}">
                  ${this.capitalizeFirst(seed.classification || '')}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Meses</span>
              <span class="detail-value">${seed.availableMonths || ''}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sem/Kg</span>
              <span class="detail-value">${seed.seedsPerKilo ? seed.seedsPerKilo.toLocaleString() : '0'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Precio/Kg</span>
              <span class="detail-value">$${(seed.unitPrice || 0).toFixed(2)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Stock</span>
              <span class="detail-value">${(seed.stock || 0).toFixed(2)} kg</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Valor</span>
              <span class="detail-value">$${stockValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <div class="actions">
            <button class="action-btn edit" data-id="${seed.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${seed.id}" title="Eliminar">
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

      const seedId = target.getAttribute('data-id');
      if (target.classList.contains('edit')) {
        this.openSeedModal(seedId);
      } else if (target.classList.contains('delete')) {
        this.openConfirmModal(seedId);
      }
    });
  }

  filterSeeds() {
    const searchTerm = document.getElementById('searchSeeds')?.value.toLowerCase() || '';
    const filterClass = document.getElementById('filterClassification')?.value || '';
    const filterStock = document.getElementById('filterStock')?.value || '';

    this.filteredSeeds = this.seeds.filter(seed => {
      const matchesSearch = !searchTerm ||
        (seed.commonName && seed.commonName.toLowerCase().includes(searchTerm)) ||
        (seed.scientificName && seed.scientificName.toLowerCase().includes(searchTerm)) ||
        (seed.id && seed.id.toLowerCase().includes(searchTerm));

      const matchesClass = !filterClass || seed.classification === filterClass;

      let matchesStock = true;
      if (filterStock === 'out') matchesStock = seed.stock === 0;
      if (filterStock === 'low') matchesStock = seed.stock > 0 && seed.stock < 50;
      if (filterStock === 'optimal') matchesStock = seed.stock >= 50 && seed.stock <= 200;
      if (filterStock === 'high') matchesStock = seed.stock > 200;

      return matchesSearch && matchesClass && matchesStock;
    });

    // Aplicar ordenamiento actual
    this.sortSeeds();

    this.updateVisibleStats();
  }

  renderSeedsTable(seedsToShow = this.filteredSeeds) {
    const tbody = document.getElementById('seedsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (seedsToShow.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    seedsToShow.forEach(seed => {
      const stockValue = (seed.unitPrice || 0) * (seed.stock || 0);
      const stockStatus = this.getStockStatus(seed.stock || 0);
      const statusLabels = {
        'out': 'Sin Stock',
        'low': 'Stock Bajo',
        'optimal': 'Stock Óptimo',
        'high': 'Stock Alto'
      };
      const statusColors = {
        'out': 'danger',
        'low': 'warning',
        'optimal': 'success',
        'high': 'info'
      };

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong class="text-primary">${seed.id}</strong></td>
        <td>${seed.commonName || ''}</td>
        <td><em class="text-muted">${seed.scientificName || ''}</em></td>
        <td><span class="badge ${seed.classification || ''}">${this.capitalizeFirst(seed.classification || '')}</span></td>
        <td>${seed.availableMonths || ''}</td>
        <td class="numeric">${seed.seedsPerKilo ? seed.seedsPerKilo.toLocaleString() : ''}</td>
        <td class="numeric">$${(seed.unitPrice || 0).toFixed(2)}</td>
        <td class="numeric">${(seed.stock || 0).toFixed(2)}</td>
        <td>
          <span class="badge bg-${statusColors[stockStatus]}">
            ${statusLabels[stockStatus]}
          </span>
        </td>
        <td class="numeric"><strong>$${stockValue.toFixed(2)}</strong></td>
        <td>
          <div class="actions">
            <button class="action-btn edit" data-id="${seed.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${seed.id}" title="Eliminar">
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

      const seedId = target.getAttribute('data-id');
      if (target.classList.contains('edit')) {
        this.openSeedModal(seedId);
      } else if (target.classList.contains('delete')) {
        this.openConfirmModal(seedId);
      }
    });
  }

  updateQuickStats() {
    const totalSeeds = this.seeds.length;
    const totalStock = this.seeds.reduce((sum, seed) => sum + (seed.stock || 0), 0);
    const totalValue = this.seeds.reduce((sum, seed) => sum + ((seed.unitPrice || 0) * (seed.stock || 0)), 0);

    const lowStockCount = this.seeds.filter(seed => {
      const stock = seed.stock || 0;
      return stock > 0 && stock < 50;
    }).length;

    const outOfStockCount = this.seeds.filter(seed => (seed.stock || 0) === 0).length;

    document.getElementById('totalSeedsCount').textContent = totalSeeds.toLocaleString();
    document.getElementById('totalStock').textContent = `${totalStock.toFixed(2)} kg`;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('lowStockCount').textContent = lowStockCount.toLocaleString();
    document.getElementById('outOfStockCount').textContent = outOfStockCount.toLocaleString();
  }

  updateVisibleStats() {
    const visibleSeeds = this.filteredSeeds.length;
    const visibleStock = this.filteredSeeds.reduce((sum, seed) => sum + (seed.stock || 0), 0);
    const visibleValue = this.filteredSeeds.reduce((sum, seed) => sum + ((seed.unitPrice || 0) * (seed.stock || 0)), 0);

    document.getElementById('visibleSeedsCount').textContent = visibleSeeds.toLocaleString();
    document.getElementById('visibleStockTotal').textContent = `${visibleStock.toFixed(2)} kg`;
    document.getElementById('visibleValueTotal').textContent = `$${visibleValue.toFixed(2)}`;
  }

  getStockStatus(stock) {
    if (stock === 0) return 'out';
    if (stock < 50) return 'low';
    if (stock <= 200) return 'optimal';
    return 'high';
  }

  loadSeeds(showNotification = true) {
    try {
      this.seeds = JSON.parse(localStorage.getItem('vivero_semillas')) || [];
      this.filteredSeeds = [...this.seeds];

      // Renderizar según la vista actual
      if (this.currentView === 'cards') {
        this.renderSeedCards(this.filteredSeeds);
      } else {
        this.renderSeedsTable(this.filteredSeeds);
      }

      this.updateQuickStats();
      this.updateSearchResultsCount();

      // Mostrar notificación solo si se solicita explícitamente
      if (showNotification) {
        window.app.showNotification('Datos de semillas cargados', 'success');
      }
    } catch (error) {
      console.error('Error cargando semillas:', error);
      this.seeds = [];
      this.filteredSeeds = [];
      this.renderSeedsTable(this.filteredSeeds);
      window.app.showNotification('Error cargando semillas', 'error');
    }
  }

  generateSeedId() {
    let maxNumber = 0;

    // Verificar todos los IDs SEM- existentes
    this.seeds.forEach(seed => {
      if (seed.id && seed.id.startsWith('SEM-')) {
        const numPart = seed.id.replace('SEM-', '');
        const num = parseInt(numPart);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    return `SEM-${maxNumber + 1}`;
  }

  createSeedModal() {
    const modalHTML = `
      <div class="modal" id="seedModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Nueva Semilla</h3>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>
          <div class="modal-body">
            <form id="seedForm">
              <input type="hidden" id="seedId">
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
              <div class="form-row">
                <div class="form-group">
                  <label for="classification">Clasificación *</label>
                  <select id="classification" required>
                    <option value="">Seleccionar...</option>
                    <option value="recalcitrante">Recalcitrante</option>
                    <option value="intermedia">Intermedia</option>
                    <option value="ortodoxa">Ortodoxa</option>
                    <option value="vareta">Vareta</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="availableMonths">Meses Disponible *</label>
                  <input type="text" id="availableMonths" placeholder="Ej: Enero-Marzo" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="seedsPerKilo">Semillas por Kilo *</label>
                  <input type="number" id="seedsPerKilo" min="1" required>
                </div>
                <div class="form-group">
                  <label for="unitPrice">Precio Unitario (Kilo) *</label>
                  <input type="number" id="unitPrice" min="0" step="0.01" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="stock">Stock Disponible (Kg) *</label>
                  <input type="number" id="stock" min="0" step="0.01" required>
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

    document.getElementById('modalClose').addEventListener('click', () => this.closeModal('seedModal'));
    document.getElementById('modalCancel').addEventListener('click', () => this.closeModal('seedModal'));
    document.getElementById('modalSave').addEventListener('click', () => this.saveSeed());

    document.getElementById('seedModal').addEventListener('click', (e) => {
      if (e.target.id === 'seedModal') this.closeModal('seedModal');
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
            <p>¿Estás seguro de que deseas eliminar esta semilla?</p>
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
    document.getElementById('confirmDelete').addEventListener('click', () => this.deleteSeed());

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
      if (modalId === 'seedModal') {
        document.getElementById('seedForm')?.reset();
        this.currentSeedId = null;
      }
    }, 300);
  }

  openConfirmModal(seedId) {
    this.currentSeedId = seedId;

    if (!document.getElementById('confirmModal')) {
      this.createConfirmModal();
    }

    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  saveSeed() {
    const form = document.getElementById('seedForm');
    const saveButton = document.getElementById('modalSave');

    if (!form || !saveButton) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const commonName = document.getElementById('commonName').value.trim();
    const scientificName = document.getElementById('scientificName').value.trim();
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const stock = parseFloat(document.getElementById('stock').value);

    if (!commonName || !scientificName) {
      window.app.showNotification('Nombre común y científico son obligatorios', 'error');
      return;
    }

    if (unitPrice < 0) {
      window.app.showNotification('El precio debe ser mayor o igual a 0', 'error');
      return;
    }

    if (stock < 0) {
      window.app.showNotification('El stock no puede ser negativo', 'error');
      return;
    }

    saveButton.classList.add('loading');
    saveButton.disabled = true;

    setTimeout(() => {
      const seedIdValue = document.getElementById('seedId').value;

      let seedData = {
        commonName: commonName,
        scientificName: scientificName,
        classification: document.getElementById('classification').value,
        availableMonths: document.getElementById('availableMonths').value.trim(),
        seedsPerKilo: parseInt(document.getElementById('seedsPerKilo').value) || 0,
        unitPrice: unitPrice,
        stock: stock,
        updatedAt: new Date().toISOString()
      };

      if (seedIdValue) {
        // Actualizar semilla existente
        const index = this.seeds.findIndex(s => s.id == seedIdValue);
        if (index !== -1) {
          seedData.id = seedIdValue;
          seedData.createdAt = this.seeds[index].createdAt || new Date().toISOString();
          this.seeds[index] = seedData;
          window.app.showNotification('Semilla actualizada correctamente', 'success');
        }
      } else {
        // Crear nueva semilla con ID SEM-N
        seedData.id = this.generateSeedId();
        seedData.createdAt = new Date().toISOString();
        this.seeds.push(seedData);
        window.app.showNotification('Semilla creada correctamente', 'success');
      }

      localStorage.setItem('vivero_semillas', JSON.stringify(this.seeds));

      // Recargar y actualizar vistas
      this.loadSeeds(false);
      this.filterSeeds();
      this.closeModal('seedModal');

      saveButton.classList.remove('loading');
      saveButton.disabled = false;
    }, 500);
  }

  deleteSeed() {
    if (this.currentSeedId) {
      this.seeds = this.seeds.filter(seed => seed.id != this.currentSeedId);
      localStorage.setItem('vivero_semillas', JSON.stringify(this.seeds));
      this.loadSeeds(false);
      window.app.showNotification('Semilla eliminada correctamente', 'success');
    }
    this.closeModal('confirmModal');
  }

  deleteAllSeeds() {
    if (this.seeds.length === 0) {
      window.app.showNotification('No hay semillas para eliminar', 'warning');
      return;
    }

    if (confirm(`⚠️ ¿Estás seguro de eliminar TODAS las semillas (${this.seeds.length})?\n\nEsta acción no se puede deshacer.`)) {
      this.seeds = [];
      localStorage.setItem('vivero_semillas', JSON.stringify(this.seeds));
      this.loadSeeds(false);
      window.app.showNotification('Todas las semillas han sido eliminadas', 'success');
    }
  }

  importSeeds() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedSeeds = JSON.parse(event.target.result);

          if (!Array.isArray(importedSeeds)) {
            throw new Error('El archivo no contiene un array válido');
          }

          // Verificar nombres científicos duplicados
          const existingScientificNames = new Set(
            this.seeds.map(s => s.scientificName?.toLowerCase()).filter(Boolean)
          );

          const newSeeds = importedSeeds.filter(seed =>
            seed.scientificName && !existingScientificNames.has(seed.scientificName.toLowerCase())
          );

          if (newSeeds.length > 0) {
            // Primero, obtener el ID más alto de TODAS las semillas (existentes + nuevas)
            let maxNumber = 0;

            // Verificar IDs existentes
            this.seeds.forEach(seed => {
              if (seed.id && seed.id.startsWith('SEM-')) {
                const numPart = seed.id.replace('SEM-', '');
                const num = parseInt(numPart);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              }
            });

            // Verificar IDs en las nuevas semillas (si ya tienen ID SEM-)
            newSeeds.forEach(seed => {
              if (seed.id && seed.id.startsWith('SEM-')) {
                const numPart = seed.id.replace('SEM-', '');
                const num = parseInt(numPart);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              }
            });

            // Asignar nuevos IDs secuenciales
            newSeeds.forEach((seed, index) => {
              if (!seed.id || !seed.id.startsWith('SEM-')) {
                // Solo asignar nuevo ID si no tiene uno SEM- válido
                maxNumber++;
                seed.id = `SEM-${maxNumber}`;
              }
              seed.createdAt = seed.createdAt || new Date().toISOString();
              seed.updatedAt = new Date().toISOString();

              // Asegurar que el stock sea un número
              seed.stock = parseFloat(seed.stock) || 0;
              seed.unitPrice = parseFloat(seed.unitPrice) || 0;
              seed.seedsPerKilo = parseInt(seed.seedsPerKilo) || 0;
            });

            this.seeds = [...this.seeds, ...newSeeds];
            localStorage.setItem('vivero_semillas', JSON.stringify(this.seeds));
            this.loadSeeds(false);

            window.app.showNotification(
              `Importadas ${newSeeds.length} nuevas semillas`,
              'success',
              'Importación Exitosa'
            );
          } else {
            window.app.showNotification(
              'No se encontraron semillas nuevas para importar',
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

  exportSeeds() {
    if (this.seeds.length === 0) {
      window.app.showNotification('No hay semillas para exportar', 'warning');
      return;
    }

    const dataStr = JSON.stringify(this.seeds, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `semillas_vivero_chaka_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showNotification(
      `Exportadas ${this.seeds.length} semillas`,
      'success',
      'Exportación Exitosa'
    );
  }

  printSeeds() {
    if (this.seeds.length === 0) {
      window.app.showNotification('No hay semillas para imprimir', 'warning');
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
        <title>Lista de Semillas - MEXICO PRIMERO S. DE S.S.</title>
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
            border-bottom: 2px solid #2c3e50;
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
            color: #2c3e50;
            margin-bottom: 3px;
          }
          .company-subtitle {
            font-size: 12px;
            color: #7f8c8d;
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
            background-color: #f8f9fa;
            border-radius: 3px;
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
            background-color: #2c3e50;
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
            background-color: #f9f9f9;
          }
          .stock-out { background-color: #ffe6e6 !important; }
          .stock-low { background-color: #fff3cd !important; }
          .stock-optimal { background-color: #d4edda !important; }
          .stock-high { background-color: #d1ecf1 !important; }
          .status-badge {
            padding: 2px 5px;
            border-radius: 2px;
            font-size: 8px;
            font-weight: bold;
            display: inline-block;
          }
          .status-out { background-color: #f8d7da; color: #721c24; }
          .status-low { background-color: #fff3cd; color: #856404; }
          .status-optimal { background-color: #d4edda; color: #155724; }
          .status-high { background-color: #d1ecf1; color: #0c5460; }
          .classification {
            font-size: 8px;
            padding: 2px 5px;
            border-radius: 2px;
            background-color: #e9ecef;
            color: #495057;
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
            background-color: #f8f9fa !important;
            font-weight: bold;
            border-top: 2px solid #2c3e50;
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
        
        <div class="report-title">INVENTARIO DE SEMILLAS</div>
        
        <div class="date-info">
          <strong>Fecha:</strong> ${currentDate}<br>
          <strong>Generado por:</strong> Sistema Vivero Chaka
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Común</th>
              <th>Nombre Científico</th>
              <th>Clasificación</th>
              <th>Meses</th>
              <th>Sem/Kg</th>
              <th>Precio/Kg</th>
              <th>Stock (Kg)</th>
              <th>Estado</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${this.seeds.map(seed => {
      const stock = seed.stock || 0;
      const stockValue = (seed.unitPrice || 0) * stock;
      const stockStatus = this.getStockStatus(stock);
      const statusLabels = {
        'out': 'SIN STOCK',
        'low': 'BAJO',
        'optimal': 'ÓPTIMO',
        'high': 'ALTO'
      };

      return `
                <tr class="stock-${stockStatus}">
                  <td><strong>${seed.id}</strong></td>
                  <td>${seed.commonName || ''}</td>
                  <td><em>${seed.scientificName || ''}</em></td>
                  <td><span class="classification">${this.capitalizeFirst(seed.classification || '')}</span></td>
                  <td>${seed.availableMonths || ''}</td>
                  <td>${seed.seedsPerKilo ? seed.seedsPerKilo.toLocaleString() : ''}</td>
                  <td>$${(seed.unitPrice || 0).toFixed(2)}</td>
                  <td>${stock.toFixed(2)}</td>
                  <td><span class="status-badge status-${stockStatus}">${statusLabels[stockStatus]}</span></td>
                  <td>$${stockValue.toFixed(2)}</td>
                </tr>
              `;
    }).join('')}
            <tr class="summary-row">
              <td colspan="7"><strong>TOTALES</strong></td>
              <td><strong>${this.seeds.reduce((sum, seed) => sum + (seed.stock || 0), 0).toFixed(2)} kg</strong></td>
              <td></td>
              <td><strong>$${this.seeds.reduce((sum, seed) => sum + ((seed.unitPrice || 0) * (seed.stock || 0)), 0).toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Documento generado automáticamente por el Sistema de Gestión Vivero Chaka</p>
          <p>MEXICO PRIMERO S. DE S.S. | ${new Date().getFullYear()}</p>
          <p class="no-print">
            <button onclick="window.print()" style="padding: 5px 10px; background-color: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
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
window.SeedManager = SeedManager;
// Módulo de Cotizaciones Guardadas optimizado - Formato Unificado con cotizaciones.js
class QuotationHistoryManager {
  constructor() {
    this.quotations = JSON.parse(localStorage.getItem('mexicoprimero_cotizaciones')) || [];
    this.filteredQuotations = [...this.quotations];
    this.currentSort = { field: 'createdAt', order: 'desc' };
    this.itemsPerPage = 10;
    this.currentPage = 1;
    this.activeModal = null;
    this.searchTimeout = null;

    // Datos de la empresa (CONSISTENTE CON cotizaciones.js)
    this.companyInfo = {
      name: "MEXICO PRIMERO S DE S.S",
      activities: "GANADERIA, AGRICULTURA Y REFORESTACIÓN",
      address: "DOMICILIO CONOCIDO TZUCACAB, YUCATAN",
      rfc: "RFC: MPR980510JT9",
      phone: "99-97-48-26-11",
      email: "administracion@mexicoprimero.mx",
      fullAddress: "CALLE 39 No 92 Entre 22 y 24 C.P 97960 Tzucacab, Yucatán",
      logoPath: "logo.png",
      esrLogoPath: "logo2.png"
    };

    // Firmas (CONSISTENTE CON cotizaciones.js)
    this.signatures = [
      "P.A ING LUIS GERARDO HERRERA TUZ",
      "CONSULTOR AMBIENTAL",
      "PROF. ALBERTO CASANOVA MARTIN",
      "DIRECTOR Y APODERADO LEGAL DE 'MEXICO PRIMERO S DE S.S'"
    ];

    // Configuración de condiciones por defecto (CONSISTENTE)
    this.defaultConditions = [
      "Condiciones de pago: 70% de anticipo y 30% inmediatos al finalizar el trabajo o la entrega del producto",
      "Para la facturación: es necesario que envíe el CIF (cédula de identificación fiscal). En el caso del IVA por ser únicamente plantas, la tasa es cero (0)",
      "Cotización válida 10 días a partir de la fecha de emisión o notificar que es seguro el pedido",
      "Tiempo de entrega después del anticipo 5 días. (Programación)",
      "La existencia está sujeta a cambio sin previo aviso",
      `Precios vigentes ${new Date().getFullYear()}`
    ];
  }

  renderModuleInterface() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="content-header" style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(46, 125, 50, 0.2);">
        <div style="flex: 1;">
          <h2 style="margin: 0 0 8px 0; font-size: 28px; display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-history" style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px;"></i>
            Historial de Cotizaciones
          </h2>
          <p style="margin: 0; opacity: 0.9; font-size: 15px; color: #e8f5e9;">
            Gestiona y revisa todas las cotizaciones generadas en el sistema
          </p>
        </div>
        <div class="header-actions" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="action-buttons-group" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
            <button class="btn-secondary" id="refreshBtn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-sync-alt"></i> Actualizar
            </button>
            <button class="btn-secondary" id="exportAllBtn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-file-export"></i> Exportar Todo
            </button>
            <button class="btn-primary" id="bulkConfirmBtn" style="display: none; background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-check-double"></i> Confirmar Seleccionadas
            </button>
          </div>
          <div style="color: rgba(255,255,255,0.8); font-size: 13px; text-align: right;">
            <i class="fas fa-info-circle"></i> ${this.quotations.length} cotizaciones en total
          </div>
        </div>
      </div>

      <!-- Filtros Avanzados -->
      <div class="filters-container" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">
        <div class="filter-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div class="filter-item" style="display: flex; flex-direction: column;">
            <label for="searchQuotes" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #2e7d32; font-size: 13px;">
              <i class="fas fa-search"></i> Buscar
            </label>
            <input type="text" id="searchQuotes" placeholder="Cliente, folio, producto..." style="padding: 10px 12px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; transition: all 0.3s;">
          </div>
          <div class="filter-item" style="display: flex; flex-direction: column;">
            <label for="filterDateFrom" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #2e7d32; font-size: 13px;">
              <i class="fas fa-calendar"></i> Desde
            </label>
            <input type="date" id="filterDateFrom" style="padding: 10px 12px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; transition: all 0.3s;">
          </div>
          <div class="filter-item" style="display: flex; flex-direction: column;">
            <label for="filterDateTo" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #2e7d32; font-size: 13px;">
              <i class="fas fa-calendar"></i> Hasta
            </label>
            <input type="date" id="filterDateTo" style="padding: 10px 12px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; transition: all 0.3s;">
          </div>
          <div class="filter-item" style="display: flex; flex-direction: column;">
            <label for="filterStatus" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #2e7d32; font-size: 13px;">
              <i class="fas fa-circle"></i> Estado
            </label>
            <select id="filterStatus" style="padding: 10px 12px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="facturada">Facturada</option>
            </select>
          </div>
          <div class="filter-item" style="display: flex; flex-direction: column;">
            <label for="filterType" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #2e7d32; font-size: 13px;">
              <i class="fas fa-tag"></i> Tipo
            </label>
            <select id="filterType" style="padding: 10px 12px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;">
              <option value="">Todos</option>
              <option value="semillas">Semillas</option>
              <option value="plantas">Plantas</option>
              <option value="fertilizantes">Fertilizantes</option>
            </select>
          </div>
        </div>
        <div class="filter-actions" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; border-top: 1px solid #e8f5e9; padding-top: 20px;">
          <button class="btn-secondary" id="applyFilters" style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-filter"></i> Aplicar Filtros
          </button>
          <button class="btn-secondary" id="clearFilters" style="background: white; color: #2e7d32; border: 2px solid #c8e6c9; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-filter-circle-xmark"></i> Limpiar
          </button>
          <button class="btn-secondary" id="selectAllBtn" style="background: white; color: #2e7d32; border: 2px solid #c8e6c9; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-square"></i> Seleccionar Todos
          </button>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 25px;">
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px; transition: all 0.3s;">
          <div class="stat-icon total" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); width: 60px; height: 60px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div class="stat-info">
            <h3 id="totalQuotes" style="margin: 0 0 5px 0; color: #2c3e50; font-size: 28px;">0</h3>
            <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Total Cotizaciones</p>
          </div>
        </div>
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px; transition: all 0.3s;">
          <div class="stat-icon pending" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); width: 60px; height: 60px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h3 id="pendingQuotes" style="margin: 0 0 5px 0; color: #2c3e50; font-size: 28px;">0</h3>
            <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Pendientes</p>
          </div>
        </div>
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px; transition: all 0.3s;">
          <div class="stat-icon approved" style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); width: 60px; height: 60px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3 id="approvedQuotes" style="margin: 0 0 5px 0; color: #2c3e50; font-size: 28px;">0</h3>
            <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Aprobadas</p>
          </div>
        </div>
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px; transition: all 0.3s;">
          <div class="stat-icon revenue" style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); width: 60px; height: 60px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-info">
            <h3 id="totalRevenue" style="margin: 0 0 5px 0; color: #2c3e50; font-size: 28px;">$0</h3>
            <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Total Facturado</p>
          </div>
        </div>
      </div>

      <!-- Tabla de cotizaciones -->
      <div class="table-container" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; overflow: auto;">
        <div class="responsive-table">
          <table style="width: 100%; border-collapse: collapse; min-width: 1000px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%);">
                <th width="30" style="padding: 15px; text-align: center; border-bottom: 2px solid #2e7d32;">
                  <input type="checkbox" id="selectAllCheckbox" style="width: 18px; height: 18px; cursor: pointer;">
                </th>
                <th data-sort="id" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Folio <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th data-sort="clientName" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Cliente <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th data-sort="date" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Fecha <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th data-sort="validUntil" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Válido hasta <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th data-sort="type" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Tipo <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32;">Productos</th>
                <th data-sort="financial.total" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Total <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th data-sort="status" style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32; cursor: pointer; user-select: none;">
                  Estado <i class="fas fa-sort" style="margin-left: 5px;"></i>
                </th>
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #2e7d32;">Acciones</th>
              </tr>
            </thead>
            <tbody id="quotationsTableBody" style="border-bottom: 1px solid #e0e0e0;">
              <!-- Las cotizaciones se cargarán aquí -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginación -->
      <div class="pagination-container" style="display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 12px; padding: 15px 20px; margin-bottom: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">
        <div class="pagination-info" style="color: #2e7d32; font-size: 14px; font-weight: 500;">
          Mostrando <span id="showingCount" style="font-weight: bold; color: #1b5e20;">0</span> de <span id="totalCount" style="font-weight: bold; color: #1b5e20;">0</span> cotizaciones
        </div>
        <div class="pagination-controls" style="display: flex; align-items: center; gap: 10px;">
          <button class="btn-icon" id="firstPage" title="Primera página" style="background: #f1f8e9; border: 1px solid #c8e6c9; color: #2e7d32; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button class="btn-icon" id="prevPage" title="Página anterior" style="background: #f1f8e9; border: 1px solid #c8e6c9; color: #2e7d32; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-angle-left"></i>
          </button>
          <span class="page-info" style="color: #2e7d32; font-size: 14px; font-weight: 500; padding: 0 10px;">
            Página <span id="currentPage" style="font-weight: bold; color: #1b5e20;">1</span> de <span id="totalPages" style="font-weight: bold; color: #1b5e20;">1</span>
          </span>
          <button class="btn-icon" id="nextPage" title="Página siguiente" style="background: #f1f8e9; border: 1px solid #c8e6c9; color: #2e7d32; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-angle-right"></i>
          </button>
          <button class="btn-icon" id="lastPage" title="Última página" style="background: #f1f8e9; border: 1px solid #c8e6c9; color: #2e7d32; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <select id="itemsPerPageSelect" style="padding: 8px 12px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; color: #2e7d32;">
            <option value="10">10 por página</option>
            <option value="25">25 por página</option>
            <option value="50">50 por página</option>
            <option value="100">100 por página</option>
          </select>
        </div>
      </div>

      <!-- Resumen de selección -->
      <div class="selection-summary" id="selectionSummary" style="display: none; background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; border-radius: 12px; padding: 15px 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(46, 125, 50, 0.2); animation: slideInUp 0.3s ease;">
        <div class="summary-content" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <span id="selectedCountText" style="font-weight: 600; font-size: 16px;">0 cotizaciones seleccionadas</span>
            <span id="selectedTotalText" style="font-size: 14px; opacity: 0.9;">Total: $0.00</span>
          </div>
          <div class="summary-actions" style="display: flex; gap: 10px;">
            <button class="btn-icon danger" id="clearSelectionBtn" title="Limpiar selección" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <style>
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .table-container table tbody tr {
          transition: all 0.3s ease;
        }

        .table-container table tbody tr:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .table-container table tbody tr.pendiente {
          border-left: 4px solid #ff9800;
        }

        .table-container table tbody tr.aprobada {
          border-left: 4px solid #4caf50;
        }

        .table-container table tbody tr.rechazada {
          border-left: 4px solid #f44336;
        }

        .table-container table tbody tr.facturada {
          border-left: 4px solid #9c27b0;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.semillas {
          background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
          color: white;
        }

        .badge.plantas {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
        }

        .badge.fertilizantes {
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.pendiente {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .status-badge.aprobada {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.rechazada {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status-badge.facturada {
          background: #e8eaf6;
          color: #303f9f;
          border: 1px solid #c5cae9;
        }

        .amount-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .amount-cell .text-success {
          color: #4caf50;
          font-size: 11px;
        }

        .product-count {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .count-badge {
          background: #2e7d32;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .status-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .action-btn.view {
          background: #2196f3;
        }

        .action-btn.print {
          background: #9c27b0;
        }

        .action-btn.confirm {
          background: #4caf50;
        }

        .action-btn.cancel {
          background: #f44336;
        }

        .action-btn.duplicate {
          background: #ff9800;
        }

        .action-btn.delete {
          background: #dc3545;
        }

        .action-btn.edit {
          background: #ff9800;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.2) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #388e3c 0%, #1b5e20 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        input:focus, select:focus {
          outline: none;
          border-color: #4caf50 !important;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1) !important;
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon:disabled:hover {
          transform: none;
          box-shadow: none;
        }
      </style>
    `;

    // Inicializar controles
    this.initControls();
  }

  initControls() {
    // Configurar fechas por defecto
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('filterDateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('filterDateTo').value = lastDayOfMonth.toISOString().split('T')[0];
  }

  init() {
    console.log('🎯 Inicializando módulo de Historial de Cotizaciones');
    this.bindEvents();
    this.applyFilters();
    this.updateStats();
    this.renderPagination();
  }

  destroy() {
    console.log('🧹 Limpiando módulo de Historial');
    if (this.activeModal && document.body.contains(this.activeModal)) {
      document.body.removeChild(this.activeModal);
      this.activeModal = null;
    }
  }

  bindEvents() {
    // Limpiar eventos previos
    this.unbindEvents();

    // Filtros
    document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
    document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
    document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshData());
    document.getElementById('exportAllBtn')?.addEventListener('click', () => this.exportAllQuotations());
    document.getElementById('bulkConfirmBtn')?.addEventListener('click', () => this.bulkConfirmQuotations());
    document.getElementById('selectAllBtn')?.addEventListener('click', () => this.toggleSelectAll());

    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAllRows(e.target.checked));
    }

    document.getElementById('clearSelectionBtn')?.addEventListener('click', () => this.clearSelection());

    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchQuotes');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.applyFilters(), 300);
      });
    }

    // Ordenación
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', (e) => {
        const field = e.currentTarget.getAttribute('data-sort');
        this.sortQuotations(field);
      });
    });

    // Paginación
    document.getElementById('firstPage')?.addEventListener('click', () => this.goToPage(1));
    document.getElementById('prevPage')?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
    document.getElementById('nextPage')?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
    document.getElementById('lastPage')?.addEventListener('click', () => this.goToPage(this.totalPages));

    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener('change', (e) => {
        this.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1;
        this.renderPagination();
        this.renderQuotationsTable();
      });
    }
  }

  unbindEvents() {
    // Esta función se puede usar para limpiar eventos específicos si es necesario
  }

  refreshData() {
    this.quotations = JSON.parse(localStorage.getItem('mexicoprimero_cotizaciones')) || [];
    this.applyFilters();
    this.updateStats();
    window.app?.showNotification('Datos actualizados', 'success');
  }

  applyFilters() {
    const searchTerm = document.getElementById('searchQuotes')?.value.toLowerCase() || '';
    const dateFrom = document.getElementById('filterDateFrom')?.value;
    const dateTo = document.getElementById('filterDateTo')?.value;
    const status = document.getElementById('filterStatus')?.value;
    const type = document.getElementById('filterType')?.value;

    this.filteredQuotations = this.quotations.filter(quote => {
      // Búsqueda por texto
      const matchesSearch = !searchTerm ||
        quote.clientName?.toLowerCase().includes(searchTerm) ||
        quote.id?.toLowerCase().includes(searchTerm) ||
        quote.items?.some(item =>
          item.commonName?.toLowerCase().includes(searchTerm) ||
          item.scientificName?.toLowerCase().includes(searchTerm)
        );

      // Filtro por fecha
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const quoteDate = new Date(quote.date || quote.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDate = matchesDate && quoteDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && quoteDate <= toDate;
        }
      }

      // Filtro por estado
      const matchesStatus = !status || quote.status === status;

      // Filtro por tipo
      const matchesType = !type || quote.type === type;

      return matchesSearch && matchesDate && matchesStatus && matchesType;
    });

    // Aplicar ordenación
    this.sortQuotations(this.currentSort.field, this.currentSort.order);

    // Actualizar paginación
    this.currentPage = 1;
    this.renderPagination();
    this.renderQuotationsTable();
    this.updateSelectionSummary();
  }

  clearFilters() {
    document.getElementById('searchQuotes').value = '';

    // Restablecer a fechas por defecto (mes actual)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('filterDateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('filterDateTo').value = lastDayOfMonth.toISOString().split('T')[0];

    document.getElementById('filterStatus').value = '';
    document.getElementById('filterType').value = '';

    this.applyFilters();
    window.app?.showNotification('Filtros limpiados', 'info');
  }

  sortQuotations(field, order = null) {
    if (this.currentSort.field === field) {
      this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, order: 'desc' };
    }

    // Actualizar iconos de ordenación
    document.querySelectorAll('[data-sort] i').forEach(icon => {
      icon.className = 'fas fa-sort';
    });

    const currentTh = document.querySelector(`[data-sort="${field}"]`);
    if (currentTh) {
      const icon = currentTh.querySelector('i');
      icon.className = this.currentSort.order === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }

    this.filteredQuotations.sort((a, b) => {
      let valA, valB;

      // Manejar campos anidados como financial.total
      if (field.includes('.')) {
        const fields = field.split('.');
        valA = this.getNestedValue(a, fields);
        valB = this.getNestedValue(b, fields);
      } else {
        valA = a[field];
        valB = b[field];
      }

      // Manejar fechas
      if (field === 'date' || field === 'createdAt' || field === 'validUntil') {
        valA = new Date(valA || 0);
        valB = new Date(valB || 0);
      }

      // Manejar números
      if (field === 'financial.total' || field === 'financial.subtotal') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }

      // Comparar
      if (valA < valB) return this.currentSort.order === 'asc' ? -1 : 1;
      if (valA > valB) return this.currentSort.order === 'asc' ? 1 : -1;
      return 0;
    });

    this.renderQuotationsTable();
  }

  getNestedValue(obj, fields) {
    return fields.reduce((current, field) => current && current[field], obj);
  }

  renderQuotationsTable() {
    const tbody = document.getElementById('quotationsTableBody');
    if (!tbody) return;

    // Calcular rango para paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageQuotations = this.filteredQuotations.slice(startIndex, endIndex);

    if (pageQuotations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 60px 20px;">
            <div style="color: #7f8c8d;">
              <i class="fas fa-file-invoice-dollar" style="font-size: 48px; margin-bottom: 20px; color: #c8e6c9; display: block;"></i>
              <h3 style="color: #2e7d32; margin-bottom: 10px;">No se encontraron cotizaciones</h3>
              <p style="max-width: 400px; margin: 0 auto;">Intenta con otros filtros o crea una nueva cotización</p>
              <button onclick="window.app.loadModule('cotizaciones')" style="margin-top: 20px; background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-plus"></i> Crear Nueva Cotización
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pageQuotations.map(quote => `
      <tr data-id="${quote.id}" class="${quote.status}" style="border-bottom: 1px solid #e8f5e9;">
        <td style="padding: 12px; text-align: center;">
          <input type="checkbox" class="quote-select" data-id="${quote.id}" 
                 ${quote.status === 'aprobada' || quote.status === 'facturada' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : 'style="width: 18px; height: 18px; cursor: pointer;"'}>
        </td>
        <td style="padding: 12px;"><strong style="color: #2e7d32;">${quote.id}</strong></td>
        <td style="padding: 12px;">${quote.clientName}</td>
        <td style="padding: 12px;">${this.formatDateForDisplay(quote.date)}</td>
        <td style="padding: 12px;">${this.formatDateForDisplay(quote.validUntil)}</td>
        <td style="padding: 12px;"><span class="badge ${quote.type}">${this.getTypeText(quote.type)}</span></td>
        <td style="padding: 12px;">
          <div class="product-count">
            <span class="count-badge">${quote.items?.length || 0}</span>
            <small style="color: #7f8c8d;">productos</small>
          </div>
        </td>
        <td style="padding: 12px;">
          <div class="amount-cell">
            <strong style="color: #2e7d32; font-size: 14px;">$${this.formatNumberWithCommas((quote.financial?.total || quote.subtotal || 0).toFixed(2))}</strong>
            ${quote.status === 'aprobada' ? '<small class="text-success"><i class="fas fa-check"></i> Pagado</small>' : ''}
          </div>
        </td>
        <td style="padding: 12px;">
          <span class="status-badge ${quote.status || 'pendiente'}">
            ${this.getStatusText(quote.status)}
          </span>
        </td>
        <td style="padding: 12px;">
          <div class="status-actions">
            <button class="action-btn view" data-id="${quote.id}" title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn print" data-id="${quote.id}" title="Imprimir">
              <i class="fas fa-print"></i>
            </button>
            <button class="action-btn edit" data-id="${quote.id}" title="Editar" style="background: #ff9800;">
              <i class="fas fa-edit"></i>
            </button>
            ${quote.status === 'pendiente' ? `
            <button class="action-btn confirm" data-id="${quote.id}" title="Confirmar">
              <i class="fas fa-check"></i>
            </button>
            <button class="action-btn cancel" data-id="${quote.id}" title="Cancelar">
              <i class="fas fa-times"></i>
            </button>
            ` : ''}
            <button class="action-btn duplicate" data-id="${quote.id}" title="Duplicar">
              <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn delete" data-id="${quote.id}" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    this.addTableEvents();
    this.updatePaginationInfo();
  }

  addTableEvents() {
    const tbody = document.getElementById('quotationsTableBody');
    if (!tbody) return;

    // Usar delegación de eventos para manejar todos los botones
    tbody.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      const quoteId = button.getAttribute('data-id');
      const quote = this.quotations.find(q => q.id === quoteId);
      if (!quote) return;

      const actionClass = button.classList[1];

      // Prevenir múltiples clics rápidos
      if (button.disabled) return;
      button.disabled = true;
      setTimeout(() => button.disabled = false, 500);

      switch(actionClass) {
        case 'view':
          this.viewQuotation(quote);
          break;
        case 'print':
          this.printQuotation(quote);
          break;
        case 'edit':
          this.editQuotation(quote);
          break;
        case 'confirm':
          this.confirmQuotation(quote);
          break;
        case 'cancel':
          this.cancelQuotation(quote);
          break;
        case 'duplicate':
          this.duplicateQuotation(quote);
          break;
        case 'delete':
          this.deleteQuotation(quote);
          break;
      }
    });

    // Manejar selección de checkboxes
    tbody.addEventListener('change', (e) => {
      if (e.target.matches('.quote-select')) {
        this.updateSelectionSummary();
        this.updateBulkActions();
      }
    });
  }

  updateStats() {
    const total = this.quotations.length;
    const pending = this.quotations.filter(q => q.status === 'pendiente').length;
    const approved = this.quotations.filter(q => q.status === 'aprobada' || q.status === 'facturada').length;
    const revenue = this.quotations
      .filter(q => q.status === 'aprobada' || q.status === 'facturada')
      .reduce((sum, q) => sum + (q.financial?.total || q.subtotal || 0), 0);

    document.getElementById('totalQuotes').textContent = total;
    document.getElementById('pendingQuotes').textContent = pending;
    document.getElementById('approvedQuotes').textContent = approved;
    document.getElementById('totalRevenue').textContent = `$${this.formatNumberWithCommas(revenue.toFixed(2))}`;
  }

  renderPagination() {
    this.totalPages = Math.ceil(this.filteredQuotations.length / this.itemsPerPage);

    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    // Actualizar controles de paginación
    document.getElementById('currentPage').textContent = this.currentPage;
    document.getElementById('totalPages').textContent = this.totalPages;
    document.getElementById('showingCount').textContent = this.filteredQuotations.length;
    document.getElementById('totalCount').textContent = this.quotations.length;

    // Habilitar/deshabilitar botones
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');

    if (firstPageBtn) firstPageBtn.disabled = this.currentPage === 1;
    if (prevPageBtn) prevPageBtn.disabled = this.currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = this.currentPage === this.totalPages;
    if (lastPageBtn) lastPageBtn.disabled = this.currentPage === this.totalPages;

    // Actualizar select de items por página
    const itemsSelect = document.getElementById('itemsPerPageSelect');
    if (itemsSelect) {
      itemsSelect.value = this.itemsPerPage;
    }
  }

  updatePaginationInfo() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.filteredQuotations.length);

    document.getElementById('showingCount').textContent =
      this.filteredQuotations.length > 0 ? `${startIndex}-${endIndex}` : '0';
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.renderPagination();
    this.renderQuotationsTable();

    // Hacer scroll suave a la parte superior de la tabla
    const table = document.querySelector('.table-container');
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const isChecked = !selectAllCheckbox.checked;
    selectAllCheckbox.checked = isChecked;
    this.toggleSelectAllRows(isChecked);
  }

  toggleSelectAllRows(isChecked) {
    const checkboxes = document.querySelectorAll('.quote-select:not(:disabled)');
    checkboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });

    this.updateSelectionSummary();
    this.updateBulkActions();
  }

  updateSelectionSummary() {
    const selectedCheckboxes = document.querySelectorAll('.quote-select:checked');
    const selectedCount = selectedCheckboxes.length;
    const summary = document.getElementById('selectionSummary');
    const selectedCountText = document.getElementById('selectedCountText');
    const selectedTotalText = document.getElementById('selectedTotalText');
    const bulkConfirmBtn = document.getElementById('bulkConfirmBtn');

    if (selectedCount > 0) {
      // Calcular total de seleccionadas
      let total = 0;
      selectedCheckboxes.forEach(checkbox => {
        const quoteId = checkbox.getAttribute('data-id');
        const quote = this.quotations.find(q => q.id === quoteId);
        if (quote) {
          total += quote.financial?.total || quote.subtotal || 0;
        }
      });

      selectedCountText.textContent = `${selectedCount} cotización(es) seleccionada(s)`;
      selectedTotalText.textContent = `Total: $${this.formatNumberWithCommas(total.toFixed(2))}`;
      summary.style.display = 'block';

      // Mostrar botón de confirmación masiva si hay seleccionadas pendientes
      const hasPending = Array.from(selectedCheckboxes).some(checkbox => {
        const quoteId = checkbox.getAttribute('data-id');
        const quote = this.quotations.find(q => q.id === quoteId);
        return quote?.status === 'pendiente';
      });

      if (bulkConfirmBtn) {
        bulkConfirmBtn.style.display = hasPending ? 'flex' : 'none';
      }
    } else {
      if (summary) summary.style.display = 'none';
      if (bulkConfirmBtn) bulkConfirmBtn.style.display = 'none';
    }
  }

  updateBulkActions() {
    const selectedCount = document.querySelectorAll('.quote-select:checked').length;
    const bulkConfirmBtn = document.getElementById('bulkConfirmBtn');

    if (bulkConfirmBtn) {
      if (selectedCount > 0) {
        bulkConfirmBtn.style.display = 'flex';
        bulkConfirmBtn.innerHTML = `<i class="fas fa-check-double"></i> Confirmar (${selectedCount})`;
      } else {
        bulkConfirmBtn.style.display = 'none';
      }
    }
  }

  clearSelection() {
    const checkboxes = document.querySelectorAll('.quote-select');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    this.updateSelectionSummary();
  }

  bulkConfirmQuotations() {
    const selectedCheckboxes = document.querySelectorAll('.quote-select:checked');
    if (selectedCheckboxes.length === 0) {
      window.app?.showNotification('Selecciona al menos una cotización', 'warning');
      return;
    }

    const pendingQuotes = [];
    selectedCheckboxes.forEach(checkbox => {
      const quoteId = checkbox.getAttribute('data-id');
      const quote = this.quotations.find(q => q.id === quoteId);
      if (quote && quote.status === 'pendiente') {
        pendingQuotes.push(quote);
      }
    });

    if (pendingQuotes.length === 0) {
      window.app?.showNotification('No hay cotizaciones pendientes seleccionadas', 'warning');
      return;
    }

    if (confirm(`¿Confirmar ${pendingQuotes.length} cotización(es) seleccionada(s)?\n\nEsta acción actualizará el stock y cambiará el estado a "Aprobada".`)) {
      let confirmedCount = 0;
      let errors = [];

      pendingQuotes.forEach(quote => {
        try {
          // Verificar stock antes de confirmar
          const stockIssues = this.checkStockForQuotation(quote);
          if (stockIssues.length > 0) {
            errors.push(`• ${quote.id}: ${stockIssues[0]}`);
            return;
          }

          // Actualizar stock si la cotización es de semillas
          if (quote.type === 'semillas') {
            this.updateStockForQuotation(quote);
          }

          // Actualizar estado
          const index = this.quotations.findIndex(q => q.id === quote.id);
          if (index !== -1) {
            this.quotations[index].status = 'aprobada';
            this.quotations[index].updatedAt = new Date().toISOString();
            confirmedCount++;
          }
        } catch (error) {
          errors.push(`• ${quote.id}: ${error.message}`);
        }
      });

      // Guardar cambios
      localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

      // Actualizar vista
      this.refreshData();
      this.clearSelection();

      // Mostrar resultados
      let message = `✅ ${confirmedCount} cotización(es) confirmada(s) exitosamente`;
      if (errors.length > 0) {
        message += `\n\n❌ Errores:\n${errors.join('\n')}`;
        window.app?.showNotification(message, confirmedCount > 0 ? 'warning' : 'error');
      } else {
        window.app?.showNotification(message, 'success');
      }
    }
  }

  viewQuotation(quote) {
    // Cerrar modal activo si existe
    this.closeActiveModal();

    const modal = this.createViewModal(quote);
    this.activeModal = modal;
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
    }, 10);
  }

  createViewModal(quote) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'viewQuoteModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 20px;
    `;

    const financial = quote.financial || {};

    modal.innerHTML = `
      <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 1200px; max-height: 90vh; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <div class="modal-header" style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-file-invoice"></i> Cotización ${quote.id}
          </h3>
          <button class="modal-close" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
            &times;
          </button>
        </div>
        <div class="modal-body" style="max-height: calc(90vh - 140px); overflow-y: auto; padding: 20px;">
          <!-- Información básica -->
          <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Información de la Cotización</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <strong>Cliente:</strong><br>
                <span>${quote.clientName}</span>
              </div>
              <div>
                <strong>Fecha:</strong><br>
                <span>${this.formatDateForDisplay(quote.date)}</span>
              </div>
              <div>
                <strong>Válido hasta:</strong><br>
                <span>${this.formatDateForDisplay(quote.validUntil)}</span>
              </div>
              <div>
                <strong>Tipo:</strong><br>
                <span>${this.getTypeText(quote.type)}</span>
              </div>
              <div>
                <strong>Estado:</strong><br>
                <span class="status-badge ${quote.status || 'pendiente'}">${this.getStatusText(quote.status)}</span>
              </div>
            </div>
          </div>

          <!-- Tabla de productos -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Productos (${quote.items?.length || 0})</h4>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background: #f1f8e9;">
                    <th style="padding: 10px; border: 1px solid #c8e6c9; text-align: center;">No.</th>
                    <th style="padding: 10px; border: 1px solid #c8e6c9;">Producto</th>
                    <th style="padding: 10px; border: 1px solid #c8e6c9;">Cantidad</th>
                    <th style="padding: 10px; border: 1px solid #c8e6c9;">Precio Unitario</th>
                    <th style="padding: 10px; border: 1px solid #c8e6c9;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${quote.items?.map((item, index) => `
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                      <td style="padding: 10px; text-align: center; border: 1px solid #e0e0e0;">${index + 1}</td>
                      <td style="padding: 10px; border: 1px solid #e0e0e0;">
                        <strong>${item.commonName || ''}</strong><br>
                        <small><em>${item.scientificName || ''}</em></small>
                      </td>
                      <td style="padding: 10px; text-align: center; border: 1px solid #e0e0e0;">${item.quantity} kg</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e0e0e0;">$${this.formatNumberWithCommas(item.unitPrice?.toFixed(2) || '0.00')}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e0e0e0;">$${this.formatNumberWithCommas(item.subtotal?.toFixed(2) || '0.00')}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">No hay productos</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen financiero -->
          <div style="margin-bottom: 20px; padding: 15px; background: #f1f8e9; border-radius: 8px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Resumen Financiero</h4>
            <div style="max-width: 300px; margin-left: auto;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #c8e6c9;">
                <span>Subtotal:</span>
                <strong>$${this.formatNumberWithCommas(financial.subtotal?.toFixed(2) || '0.00')}</strong>
              </div>
              ${financial.discountType === 'fixed' && financial.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #c8e6c9;">
                <span>Descuento:</span>
                <strong>$${this.formatNumberWithCommas(financial.discountAmount.toFixed(2))}</strong>
              </div>
              ` : ''}
              ${financial.discountType === 'percentage' && financial.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #c8e6c9;">
                <span>Descuento (${financial.discountValue}%):</span>
                <strong>$${this.formatNumberWithCommas(financial.discountAmount.toFixed(2))}</strong>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #c8e6c9;">
                <span>IVA (${financial.taxRate || 0}%):</span>
                <strong>$${this.formatNumberWithCommas(financial.taxAmount?.toFixed(2) || '0.00')}</strong>
              </div>
              ${financial.shippingCost > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #c8e6c9;">
                <span>Costo de Envío:</span>
                <strong>$${this.formatNumberWithCommas(financial.shippingCost.toFixed(2))}</strong>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #2e7d32; margin-top: 8px; font-size: 16px; color: #2e7d32;">
                <span><strong>TOTAL:</strong></span>
                <strong>$${this.formatNumberWithCommas(financial.total?.toFixed(2) || '0.00')}</strong>
              </div>
            </div>
          </div>

          <!-- Condiciones -->
          ${quote.conditions?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Condiciones</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
              ${quote.conditions.map((condition, index) => `
                <div style="margin-bottom: 8px; display: flex; gap: 10px;">
                  <span style="font-weight: bold; min-width: 25px;">${index + 1}.</span>
                  <span>${condition}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        <div class="modal-footer" style="background: #f8f9fa; padding: 20px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #e0e0e0;">
          <button class="btn-secondary" id="closeViewModal" style="background: white; color: #2e7d32; border: 2px solid #c8e6c9; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-times"></i> Cerrar
          </button>
          
          <!-- Botón de editar -->
          <button class="btn-warning edit-quote-btn" data-id="${quote.id}" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-edit"></i> Editar
          </button>
          
          <button class="btn-primary print-quote-btn" data-id="${quote.id}" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-print"></i> Imprimir
          </button>
          ${quote.status === 'pendiente' ? `
          <button class="btn-success confirm-quote-btn" data-id="${quote.id}" style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check"></i> Confirmar
          </button>
          <button class="btn-danger cancel-quote-btn" data-id="${quote.id}" style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-times"></i> Cancelar
          </button>
          ` : ''}
          <button class="btn-info duplicate-quote-btn" data-id="${quote.id}" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-copy"></i> Duplicar
          </button>
        </div>
      </div>
      
      <style>
        .modal.show {
          display: flex;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          animation: slideInUp 0.3s ease;
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .modal-close:hover {
          background: rgba(255,255,255,0.2) !important;
        }
        
        .btn-secondary:hover {
          background: #f1f8e9 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }
        
        .btn-success:hover {
          background: linear-gradient(135deg, #388e3c 0%, #1b5e20 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        
        .btn-danger:hover {
          background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }
        
        .btn-info:hover {
          background: linear-gradient(135deg, #f57c00 0%, #e65100 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }
      </style>
    `;

    // Agregar event listeners de manera segura
    const closeModal = (e) => {
      e.stopPropagation();
      this.closeModal(modal);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('#closeViewModal').addEventListener('click', closeModal);

    modal.querySelector('.edit-quote-btn').addEventListener('click', () => {
      this.editQuotation(quote);
      this.closeModal(modal);
    });

    modal.querySelector('.print-quote-btn').addEventListener('click', () => {
      this.printQuotation(quote);
      this.closeModal(modal);
    });

    const confirmBtn = modal.querySelector('.confirm-quote-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmQuotation(quote);
        this.closeModal(modal);
      });
    }

    const cancelBtn = modal.querySelector('.cancel-quote-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.cancelQuotation(quote);
        this.closeModal(modal);
      });
    }

    const duplicateBtn = modal.querySelector('.duplicate-quote-btn');
    if (duplicateBtn) {
      duplicateBtn.addEventListener('click', () => {
        this.duplicateQuotation(quote);
        this.closeModal(modal);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        e.stopPropagation();
        this.closeModal(modal);
      }
    });

    return modal;
  }

  closeModal(modal) {
    if (!modal) return;

    modal.classList.remove('show');
    modal.style.opacity = '0';

    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
      if (this.activeModal === modal) {
        this.activeModal = null;
      }
    }, 300);
  }

  closeActiveModal() {
    if (this.activeModal && document.body.contains(this.activeModal)) {
      this.closeModal(this.activeModal);
    }
  }

  editQuotation(quote) {
    // Cerrar modal activo si existe
    this.closeActiveModal();

    const modal = this.createEditModal(quote);
    this.activeModal = modal;
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
    }, 10);
  }

  createEditModal(quote) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editQuoteModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1060;
      padding: 20px;
    `;

    const financial = quote.financial || {};

    modal.innerHTML = `
      <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <div class="modal-header" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-edit"></i> Editar Cotización ${quote.id}
          </h3>
          <button class="modal-close" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
            &times;
          </button>
        </div>
        
        <div class="modal-body" style="max-height: calc(90vh - 140px); overflow-y: auto; padding: 20px;">
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Información del Cliente</h4>
            <div style="display: grid; gap: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Nombre del Cliente:</label>
                <input type="text" id="editClientName" value="${quote.clientName || ''}" 
                       style="width: 100%; padding: 10px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Dirección:</label>
                <textarea id="editClientAddress" rows="3" 
                          style="width: 100%; padding: 10px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px; resize: vertical;">${quote.clientAddress || ''}</textarea>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Ajustes Financieros</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Tipo de Descuento:</label>
                <select id="editDiscountType" style="width: 100%; padding: 10px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px;">
                  <option value="none" ${!financial.discountType || financial.discountType === 'none' ? 'selected' : ''}>Sin descuento</option>
                  <option value="fixed" ${financial.discountType === 'fixed' ? 'selected' : ''}>Monto fijo</option>
                  <option value="percentage" ${financial.discountType === 'percentage' ? 'selected' : ''}>Porcentaje</option>
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Valor del Descuento:</label>
                <input type="number" id="editDiscountValue" value="${financial.discountValue || 0}" min="0" step="0.01"
                       style="width: 100%; padding: 10px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">IVA (%):</label>
                <input type="number" id="editTaxRate" value="${financial.taxRate || 0}" min="0" max="100" step="0.1"
                       style="width: 100%; padding: 10px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">Costo de Envío:</label>
                <input type="number" id="editShippingCost" value="${financial.shippingCost || 0}" min="0" step="0.01"
                       style="width: 100%; padding: 10px; border: 2px solid #c8e6c9; border-radius: 8px; font-size: 14px;">
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; background: #f1f8e9; border-radius: 8px;">
            <h4 style="color: #2e7d32; margin-bottom: 15px;">Resumen</h4>
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal:</span>
                <strong id="editSubtotal">$${this.formatNumberWithCommas((financial.subtotal || 0).toFixed(2))}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Descuento:</span>
                <strong id="editDiscountAmount">$${this.formatNumberWithCommas((financial.discountAmount || 0).toFixed(2))}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>IVA:</span>
                <strong id="editTaxAmount">$${this.formatNumberWithCommas((financial.taxAmount || 0).toFixed(2))}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Envío:</span>
                <strong id="editShippingDisplay">$${this.formatNumberWithCommas((financial.shippingCost || 0).toFixed(2))}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #2e7d32;">
                <span><strong>TOTAL:</strong></span>
                <strong style="color: #2e7d32; font-size: 16px;" id="editTotal">$${this.formatNumberWithCommas((financial.total || 0).toFixed(2))}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer" style="background: #f8f9fa; padding: 20px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #e0e0e0;">
          <button class="btn-secondary" id="cancelEdit" style="background: white; color: #2e7d32; border: 2px solid #c8e6c9; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button class="btn-primary" id="saveEdit" style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-save"></i> Guardar Cambios
          </button>
        </div>
      </div>
    `;

    // Agrega el listener para calcular en tiempo real
    const updateCalculations = () => {
      const subtotal = financial.subtotal || 0;
      const discountType = modal.querySelector('#editDiscountType').value;
      const discountValue = parseFloat(modal.querySelector('#editDiscountValue').value) || 0;
      const taxRate = parseFloat(modal.querySelector('#editTaxRate').value) || 0;
      const shippingCost = parseFloat(modal.querySelector('#editShippingCost').value) || 0;

      let discountAmount = 0;
      if (discountType === 'fixed') {
        discountAmount = Math.min(discountValue, subtotal);
      } else if (discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100);
      }

      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (taxRate / 100);
      const total = taxableAmount + taxAmount + shippingCost;

      modal.querySelector('#editDiscountAmount').textContent = `$${this.formatNumberWithCommas(discountAmount.toFixed(2))}`;
      modal.querySelector('#editTaxAmount').textContent = `$${this.formatNumberWithCommas(taxAmount.toFixed(2))}`;
      modal.querySelector('#editShippingDisplay').textContent = `$${this.formatNumberWithCommas(shippingCost.toFixed(2))}`;
      modal.querySelector('#editTotal').textContent = `$${this.formatNumberWithCommas(total.toFixed(2))}`;
    };

    // Listeners para actualizar cálculos
    modal.querySelector('#editDiscountType').addEventListener('change', updateCalculations);
    modal.querySelector('#editDiscountValue').addEventListener('input', updateCalculations);
    modal.querySelector('#editTaxRate').addEventListener('input', updateCalculations);
    modal.querySelector('#editShippingCost').addEventListener('input', updateCalculations);

    // Inicializar cálculos
    setTimeout(updateCalculations, 100);

    // Listeners para cerrar
    const closeModalHandler = (e) => {
      e.stopPropagation();
      this.closeModal(modal);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModalHandler);
    modal.querySelector('#cancelEdit').addEventListener('click', closeModalHandler);

    // Listener para guardar
    modal.querySelector('#saveEdit').addEventListener('click', (e) => {
      e.stopPropagation();
      this.saveEditQuotation(quote, modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        e.stopPropagation();
        this.closeModal(modal);
      }
    });

    return modal;
  }

  saveEditQuotation(quote, modal) {
    const clientName = modal.querySelector('#editClientName').value.trim();
    const clientAddress = modal.querySelector('#editClientAddress').value.trim();
    const discountType = modal.querySelector('#editDiscountType').value;
    const discountValue = parseFloat(modal.querySelector('#editDiscountValue').value) || 0;
    const taxRate = parseFloat(modal.querySelector('#editTaxRate').value) || 0;
    const shippingCost = parseFloat(modal.querySelector('#editShippingCost').value) || 0;

    if (!clientName) {
      window.app?.showNotification('El nombre del cliente es requerido', 'error');
      return;
    }

    // Calcular nuevos valores financieros
    const subtotal = quote.financial?.subtotal || 0;
    let discountAmount = 0;

    if (discountType === 'fixed') {
      discountAmount = Math.min(discountValue, subtotal);
    } else if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount + shippingCost;

    // Actualizar la cotización
    const index = this.quotations.findIndex(q => q.id === quote.id);
    if (index !== -1) {
      this.quotations[index].clientName = clientName;
      this.quotations[index].clientAddress = clientAddress;
      this.quotations[index].financial = {
        ...this.quotations[index].financial,
        subtotal: subtotal,
        discountType: discountType,
        discountValue: discountValue,
        discountAmount: discountAmount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        shippingCost: shippingCost,
        total: total,
        taxableAmount: taxableAmount
      };
      this.quotations[index].updatedAt = new Date().toISOString();

      // Guardar en localStorage
      localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

      // Cerrar modal y actualizar
      this.closeModal(modal);
      this.refreshData();
      window.app?.showNotification(`✅ Cotización ${quote.id} actualizada`, 'success');
    }
  }

  confirmQuotation(quote) {
    if (quote.status === 'aprobada') {
      window.app?.showNotification('Esta cotización ya ha sido confirmada', 'info');
      return;
    }

    // Verificar stock disponible
    const stockIssues = this.checkStockForQuotation(quote);
    if (stockIssues.length > 0) {
      const message = stockIssues.join('\n');
      if (!confirm(`⚠️ Problemas de stock detectados:\n\n${message}\n\n¿Deseas confirmar de todos modos?`)) {
        return;
      }
    }

    if (confirm(`¿Confirmar la cotización ${quote.id}?\n\nEsta acción actualizará el stock y cambiará el estado a "Aprobada".`)) {
      // Actualizar stock si la cotización es de semillas
      if (quote.type === 'semillas') {
        this.updateStockForQuotation(quote);
      }

      // Actualizar estado de la cotización
      const index = this.quotations.findIndex(q => q.id === quote.id);
      if (index !== -1) {
        this.quotations[index].status = 'aprobada';
        this.quotations[index].updatedAt = new Date().toISOString();
        localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

        // Actualizar la vista
        this.refreshData();

        window.app?.showNotification(`✅ Cotización ${quote.id} confirmada y stock actualizado`, 'success');
      }
    }
  }

  cancelQuotation(quote) {
    if (quote.status === 'rechazada') {
      window.app?.showNotification('Esta cotización ya ha sido cancelada', 'info');
      return;
    }

    if (confirm(`¿Cancelar la cotización ${quote.id}?\n\nEsta acción cambiará el estado a "Rechazada".`)) {
      const index = this.quotations.findIndex(q => q.id === quote.id);
      if (index !== -1) {
        this.quotations[index].status = 'rechazada';
        this.quotations[index].updatedAt = new Date().toISOString();
        localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

        // Actualizar la vista
        this.refreshData();

        window.app?.showNotification(`Cotización ${quote.id} cancelada`, 'info');
      }
    }
  }

  duplicateQuotation(quote) {
    if (confirm(`¿Duplicar la cotización ${quote.id}?\n\nSe creará una nueva cotización con los mismos datos.`)) {
      // Obtener el último número de cotización y sumar 1
      const lastQuoteNumber = this.getLastQuoteNumber();
      const newQuoteNumber = lastQuoteNumber + 1;

      // Crear copia de la cotización con nuevo número
      const newQuote = {
        ...JSON.parse(JSON.stringify(quote)), // Deep clone
        id: this.formatQuoteNumber(newQuoteNumber), // Usar el mismo formato que cotizaciones.js
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'pendiente',
        validityDays: 10,
        validUntil: this.calculateValidUntil(new Date().toISOString().split('T')[0], 10),
        notes: 'De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:'
      };

      // Agregar a la lista
      this.quotations.push(newQuote);
      localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

      // Actualizar vista
      this.refreshData();

      window.app?.showNotification(`✅ Cotización ${newQuote.id} creada como copia`, 'success');
    }
  }

  // NUEVO MÉTODO: Obtener el último número de cotización (consistente con cotizaciones.js)
  getLastQuoteNumber() {
    if (this.quotations.length === 0) return 0;
    let maxNumber = 0;
    this.quotations.forEach(quote => {
      if (quote.id) {
        const match = quote.id.match(/^(\d{3})\/\d{4}$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNumber) maxNumber = num;
        }
      }
    });
    return maxNumber;
  }

  // NUEVO MÉTODO: Formatear número de cotización (consistente con cotizaciones.js)
  formatQuoteNumber(number) {
    const paddedNumber = number.toString().padStart(3, '0');
    const currentYear = new Date().getFullYear();
    return `${paddedNumber}/${currentYear}`;
  }

  calculateValidUntil(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  checkStockForQuotation(quote) {
    const issues = [];

    if (quote.type === 'semillas') {
      const products = JSON.parse(localStorage.getItem('vivero_semillas')) || [];

      quote.items?.forEach((item, index) => {
        // Buscar el producto por nombre común o científico
        const product = products.find(p =>
          p.commonName === item.commonName ||
          p.scientificName === item.scientificName
        );

        if (product) {
          if (product.stock < item.quantity) {
            issues.push(`"${item.commonName}": Stock disponible: ${product.stock.toFixed(2)} kg, Solicitado: ${item.quantity} kg`);
          } else if (product.stock === 0) {
            issues.push(`"${item.commonName}": Sin stock disponible`);
          }
        } else {
          issues.push(`"${item.commonName}": Producto no encontrado en inventario`);
        }
      });
    }

    return issues;
  }

  updateStockForQuotation(quote) {
    if (quote.type !== 'semillas') return;

    const products = JSON.parse(localStorage.getItem('vivero_semillas')) || [];
    let updatedProducts = [...products];
    let stockUpdated = false;

    quote.items?.forEach(item => {
      const productIndex = updatedProducts.findIndex(p =>
        p.commonName === item.commonName ||
        p.scientificName === item.scientificName
      );

      if (productIndex !== -1) {
        const product = updatedProducts[productIndex];
        const newStock = Math.max(0, product.stock - item.quantity);

        if (newStock !== product.stock) {
          updatedProducts[productIndex].stock = newStock;
          updatedProducts[productIndex].updatedAt = new Date().toISOString();
          stockUpdated = true;
        }
      }
    });

    if (stockUpdated) {
      localStorage.setItem('vivero_semillas', JSON.stringify(updatedProducts));
    }
  }

  printQuotation(quote) {
    const printWindow = window.open('', '_blank');
    const printContent = this.getPrintHTML(quote);

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Cotización ${quote.id} - ${this.companyInfo.name}</title>
  <style>${this.getPrintStyles()}</style>
</head>
<body>
  ${printContent}
  <script>
    setTimeout(() => {
      window.print();
      setTimeout(() => window.close(), 100);
    }, 500);
  </script>
</body>
</html>`);
    printWindow.document.close();
  }

  getPrintHTML(quote) {
    const typeText = {
      'semillas': 'SEMILLAS',
      'plantas': 'PLANTAS',
      'fertilizantes': 'FERTILIZANTES'
    };

    const itemsHTML = quote.items?.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.commonName || 'Producto'}</strong></td>
        <td><em>${item.scientificName || '-'}</em></td>
        <td>${item.classification || 'Certificada'}</td>
        <td>${item.availableMonths || 'N/A'}</td>
        <td>${item.seedsPerKilo ? this.formatNumberWithCommas(item.seedsPerKilo) : '0'}</td>
        <td>$${this.formatNumberWithCommas((item.unitPrice || 0).toFixed(2))}</td>
        <td>${this.formatNumberWithCommas(item.quantity || 1)} kg</td>
        <td><strong>$${this.formatNumberWithCommas((item.subtotal || 0).toFixed(2))}</strong></td>
      </tr>
    `).join('') || '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">No hay productos en la cotización</td></tr>';

    const conditionsHTML = (quote.conditions || this.defaultConditions)?.map((condition, index) => `
      <div class="print-condition-item">
        <div class="print-condition-number">${index + 1}</div>
        <div>${condition}</div>
      </div>
    `).join('');

    const financial = quote.financial || {};
    const subtotal = financial.subtotal || 0;
    const discountAmount = financial.discountAmount || 0;
    const taxAmount = financial.taxAmount || 0;
    const shippingCost = financial.shippingCost || 0;
    const total = financial.total || 0;

    let discountText = '';
    if (financial.discountType === 'fixed' && discountAmount > 0) {
      discountText = `Descuento: $${this.formatNumberWithCommas(discountAmount.toFixed(2))}`;
    } else if (financial.discountType === 'percentage' && discountAmount > 0) {
      discountText = `Descuento (${financial.discountValue}%): $${this.formatNumberWithCommas(discountAmount.toFixed(2))}`;
    }

    return `
      <div class="print-container">
        <!-- ENCABEZADO CENTRADO CON LOGO A LA IZQUIERDA -->
        <div class="print-header">
          <div class="print-logo-container">
            <img src="${this.companyInfo.logoPath}" alt="Logo México Primero" class="print-logo" onerror="this.style.display='none'">
          </div>
          <div class="print-company-info" style="text-align: center;">
            <div class="print-company-name">${this.companyInfo.name}</div>
            <div class="print-company-line">${this.companyInfo.activities}</div>
            <div class="print-company-line">${this.companyInfo.address}</div>
            <div class="print-company-line">${this.companyInfo.rfc}</div>
            <div class="print-company-line">Tel: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}</div>
          </div>
        </div>

        <div class="print-quote-info">
          <div class="print-quote-header-row">
            <div class="print-quote-title-section">COTIZACIÓN DE ${typeText[quote.type] || 'PRODUCTOS'}</div>
          </div>
          
          <div class="print-quote-details-row">
            <div class="print-folio-section" style="color: #ff0000; font-size: 14px; font-weight: bold;">
              COTIZACIÓN No. ${quote.id}
            </div>
            <div class="print-date-section">
              ${this.formatDocumentDate(quote.date)}
            </div>
            <div class="print-cot-section">
              Válido hasta: <span class="print-dynamic-field">${this.formatDate(quote.validUntil)}</span>
            </div>
          </div>
          
          <div class="print-client-info">
            <strong>CLIENTE:</strong> <span class="print-dynamic-field">${quote.clientName}</span>
            ${quote.clientAddress ? `<br><strong>DIRECCIÓN:</strong> <span class="print-dynamic-field">${quote.clientAddress}</span>` : ''}
          </div>
          
          <div class="print-intro-text">
            ${quote.notes || 'De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:'}
          </div>
        </div>

        <table class="print-products-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nombre Común</th>
              <th>Nombre Científico</th>
              <th>Clasificación</th>
              <th>Meses<br>disponible</th>
              <th>Semillas/kilo</th>
              <th>Precio/kilo</th>
              <th>Cantidad<br>(kg)</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <div class="print-summary">
          <div class="print-summary-item">
            <span>Subtotal:</span>
            <span>$${this.formatNumberWithCommas(subtotal.toFixed(2))}</span>
          </div>
          ${discountText ? `
          <div class="print-summary-item">
            <span>${discountText.split(':')[0]}:</span>
            <span>$${this.formatNumberWithCommas(discountAmount.toFixed(2))}</span>
          </div>
          ` : ''}
          <div class="print-summary-item">
            <span>IVA (${financial.taxRate || 0}%):</span>
            <span>$${this.formatNumberWithCommas(taxAmount.toFixed(2))}</span>
          </div>
          ${shippingCost > 0 ? `
          <div class="print-summary-item">
            <span>Costo de Envío:</span>
            <span>$${this.formatNumberWithCommas(shippingCost.toFixed(2))}</span>
          </div>
          ` : ''}
          <div class="print-summary-item print-summary-total">
            <span>TOTAL:</span>
            <span>$${this.formatNumberWithCommas(total.toFixed(2))}</span>
          </div>
        </div>

        ${conditionsHTML ? `
        <div class="print-conditions">
          <div class="print-conditions-title">CONDICIONES DE LA COTIZACIÓN:</div>
          ${conditionsHTML}
        </div>
        ` : ''}

        <div class="print-signatures">
          <div class="signature-section">
            <div class="print-signature-line"></div>
            <div class="print-signature-name">ATENTAMENTE</div>
            <div class="signature-details">
              ${this.signatures.map(sig => `<div class="signature-line">${sig}</div>`).join('')}
            </div>
          </div>
        </div>

        <!-- PIE DE PÁGINA CON LOGO ESR A LA DERECHA - MODIFICADO -->
        <div class="print-footer">
          <div class="footer-content">
            <div class="footer-contact">
              ${this.companyInfo.fullAddress}<br>
              Whatsapp: ${this.companyInfo.phone} / email: ${this.companyInfo.email}
            </div>
            <div class="footer-logo">
              <img src="${this.companyInfo.esrLogoPath}" alt="Logo ESR" class="footer-esr-logo" onerror="this.style.display='none'">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // NUEVO MÉTODO: Formato de fecha para el documento (consistente con cotizaciones.js)
  formatDocumentDate(dateString) {
    if (!dateString) return 'Mérida, Yucatán, a [Fecha no especificada]';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Mérida, Yucatán, a [Fecha inválida]';

      const day = date.getDate();
      const month = date.toLocaleString('es-ES', { month: 'long' });
      const year = date.getFullYear();

      // Capitalizar primera letra del mes
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);

      return `Mérida, Yucatán, a ${day} de ${monthCapitalized} de ${year}`;
    } catch {
      return 'Mérida, Yucatán, a [Error en fecha]';
    }
  }

  formatDate(dateString) {
    if (!dateString) return '[Fecha no especificada]';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '[Fecha inválida]';
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = date.toLocaleDateString('es-ES', options);
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch {
      return '[Error en fecha]';
    }
  }

  // NUEVO MÉTODO: Formatear números con comas (consistente con cotizaciones.js)
  formatNumberWithCommas(number) {
    // Si es un string que termina con .00, .50, etc, lo convertimos
    if (typeof number === 'string') {
      // Extraer la parte decimal si existe
      const parts = number.split('.');
      if (parts.length === 2) {
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${integerPart}.${parts[1]}`;
      }
      return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Si es un número
    const num = typeof number === 'number' ? number : parseFloat(number);
    if (isNaN(num)) return '0';

    // Verificar si tiene decimales
    const hasDecimals = num % 1 !== 0;
    if (hasDecimals) {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  getPrintStyles() {
    return `
      @page { size: letter; margin: 2cm; }
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
      body { padding: 20px; font-size: 12px; line-height: 1.4; background-color: white; }
      
      .print-container { max-width: 1000px; margin: 0 auto; padding: 20px; }
      
      /* ENCABEZADO CON LOGO - CENTRADO */
      .print-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #2e7d32;
        position: relative;
      }
      
      .print-logo-container {
        position: absolute;
        left: 0;
        top: 0;
      }
      
      .print-logo {
        max-width: 120px;
        max-height: 120px;
        object-fit: contain;
      }
      
      .print-company-info {
        flex: 1;
        text-align: center;
      }
      
      .print-company-name {
        font-size: 16px;
        font-weight: bold;
        text-decoration: underline;
        color: #2e7d32;
        margin-bottom: 6px;
        text-transform: uppercase;
      }
      
      .print-company-line {
        font-size: 11px;
        margin-bottom: 3px;
        color: #333;
      }
      
      .print-quote-info {
        margin-bottom: 25px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 15px;
      }
      
      .print-quote-header-row {
        text-align: center;
        margin-bottom: 8px;
      }
      
      .print-quote-title-section {
        font-weight: bold;
        font-size: 14px;
        color: #2e7d32;
        text-transform: uppercase;
      }
      
      .print-quote-details-row {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        font-size: 11px;
      }
      
      .print-folio-section {
        font-weight: bold;
        color: #ff0000;
        font-size: 14px;
      }
      
      .print-date-section {
        text-align: center;
      }
      
      .print-cot-section {
        text-align: right;
        font-weight: bold;
      }
      
      .print-client-info {
        font-size: 11px;
        margin-top: 15px;
        margin-bottom: 10px;
        padding: 10px;
        background: #f1f8e9;
        border-radius: 5px;
      }
      
      .print-intro-text {
        font-style: italic;
        margin-bottom: 20px;
        text-align: justify;
      }
      
      .print-dynamic-field {
        font-weight: bold;
      }
      
      /* TABLA DE PRODUCTOS CON 9 COLUMNAS - MODIFICADO PARA SEPARAR NOMBRE COMÚN Y CIENTÍFICO */
      .print-products-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 25px;
        font-size: 10px;
      }
      
      .print-products-table th {
        background-color: #2e7d32;
        color: white;
        padding: 8px 5px;
        text-align: center;
        border: 1px solid #ddd;
        font-weight: bold;
        font-size: 9px;
        white-space: nowrap;
      }
      
      .print-products-table td {
        padding: 8px 5px;
        border: 1px solid #ddd;
        text-align: center;
        font-size: 9px;
        vertical-align: top;
      }
      
      .print-products-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .print-products-table th:nth-child(1) { width: 4%; }  /* No. */
      .print-products-table th:nth-child(2) { width: 15%; } /* Nombre Común */
      .print-products-table th:nth-child(3) { width: 17%; } /* Nombre Científico */
      .print-products-table th:nth-child(4) { width: 10%; } /* Clasificación */
      .print-products-table th:nth-child(5) { width: 14%; }  /* Meses disponible */
      .print-products-table th:nth-child(6) { width: 6%; }  /* Semillas/kilo */
      .print-products-table th:nth-child(7) { width: 8%; } /* Precio/kilo */
      .print-products-table th:nth-child(8) { width: 8%; } /* Cantidad (kg) */
      .print-products-table th:nth-child(9) { width: 10%; } /* Subtotal */
      
      /* Ajuste para columnas con precios */
      .print-products-table td:nth-child(5),
      .print-products-table td:nth-child(6),
      .print-products-table td:nth-child(7),
      .print-products-table td:nth-child(8),
      .print-products-table td:nth-child(9) {
        font-family: 'Courier New', monospace;
        font-weight: bold;
      }
      
      /* Estilo para nombres científicos en cursiva */
      .print-products-table td:nth-child(3) {
        font-style: italic;
      }
      
      /* RESUMEN */
      .print-summary {
        margin: 20px 0;
        padding: 15px;
        background: #f1f8e9;
        border-radius: 8px;
        max-width: 300px;
        margin-left: auto;
      }
      
      .print-summary-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #dee2e6;
        font-family: 'Courier New', monospace;
      }
      
      .print-summary-total {
        font-weight: bold;
        font-size: 14px;
        color: #2e7d32;
        border-top: 2px solid #2e7d32;
        margin-top: 10px;
        padding-top: 10px;
      }
      
      /* CONDICIONES */
      .print-conditions {
        margin-bottom: 30px;
      }
      
      .print-conditions-title {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #2e7d32;
        text-align: center;
      }
      
      .print-condition-item {
        margin-bottom: 5px;
        display: flex;
      }
      
      .print-condition-number {
        font-weight: bold;
        margin-right: 10px;
        min-width: 20px;
      }
      
      /* FIRMAS */
      .print-signatures {
        margin-top: 50px;
        margin-bottom: 40px;
        display: flex;
        justify-content: center;
      }
      
      .signature-section {
        text-align: center;
        width: 45%;
      }
      
      .print-signature-line {
        width: 100%;
        border-top: 1px solid #333;
        margin: 30px auto 10px;
      }
      
      .print-signature-name {
        font-weight: bold;
        margin-top: 5px;
        font-size: 11px;
      }
      
      .signature-details {
        font-size: 10px;
        color: #555;
        margin-top: 5px;
      }
      
      .signature-line {
        margin-bottom: 2px;
      }
      
      /* PIE DE PÁGINA - MODIFICADO: TEXTO A LA IZQUIERDA, LOGO A LA DERECHA */
      .print-footer {
        font-size: 10px;
        color: #555;
        border-top: 1px solid #ccc;
        padding-top: 15px;
        margin-top: 40px;
        width: 100%;
      }
      
      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      
      .footer-contact {
        flex: 1;
        text-align: left;
        line-height: 1.4;
      }
      
      .footer-logo {
        text-align: right;
      }
      
      .footer-esr-logo {
        max-width: 120px;
        max-height: 100px;
        object-fit: contain;
      }
      
      @media print {
        body { padding: 0; }
        .print-container { box-shadow: none; padding: 15px; }
        .no-print { display: none !important; }
        @page { margin: 1.5cm; }
        .footer-content {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        .footer-contact {
          text-align: left !important;
        }
        .footer-logo {
          text-align: right !important;
        }
        .print-products-table {
          font-size: 9px !important;
        }
      }
    `;
  }

  deleteQuotation(quote) {
    if (confirm(`⚠️ ¿Estás seguro de eliminar la cotización ${quote.id}?\n\nEsta acción no se puede deshacer.`)) {
      this.quotations = this.quotations.filter(q => q.id !== quote.id);
      localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));
      this.refreshData();
      window.app?.showNotification(`✅ Cotización ${quote.id} eliminada`, 'success');
    }
  }

  exportAllQuotations() {
    if (this.quotations.length === 0) {
      window.app?.showNotification('No hay cotizaciones para exportar', 'warning');
      return;
    }

    const data = this.quotations.map(quote => ({
      Folio: quote.id,
      Cliente: quote.clientName,
      Fecha: quote.date,
      'Válido hasta': quote.validUntil,
      Tipo: this.getTypeText(quote.type),
      'Productos': quote.items?.length || 0,
      Subtotal: `$${this.formatNumberWithCommas(quote.financial?.subtotal?.toFixed(2) || '0.00')}`,
      Total: `$${this.formatNumberWithCommas(quote.financial?.total?.toFixed(2) || '0.00')}`,
      Estado: this.getStatusText(quote.status),
      'Fecha creación': this.formatDateTime(quote.createdAt)
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cotizaciones_mexico_primero_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app?.showNotification(`✅ Exportadas ${this.quotations.length} cotizaciones a CSV`, 'success');
  }

  formatDateForDisplay(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-ES');
    } catch {
      return '';
    }
  }

  formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  getTypeText(type) {
    const types = {
      'semillas': 'Semillas',
      'plantas': 'Plantas',
      'fertilizantes': 'Fertilizantes'
    };
    return types[type] || type;
  }

  getStatusText(status) {
    const statuses = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'facturada': 'Facturada'
    };
    return statuses[status] || 'Pendiente';
  }
}

// Exportar para el sistema principal
window.QuotationHistoryManager = QuotationHistoryManager;

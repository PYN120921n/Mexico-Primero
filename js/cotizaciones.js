// cotizaciones.js - Sistema de Cotizaciones Automatizado y Unificado
class QuotationManager {
  constructor() {
    this.quotations = JSON.parse(localStorage.getItem('mexicoprimero_cotizaciones')) || [];
    this.products = JSON.parse(localStorage.getItem('vivero_semillas')) || [];
    this.plants = JSON.parse(localStorage.getItem('vivero_plantas')) || [];
    this.fertilizantes = JSON.parse(localStorage.getItem('vivero_fertilizantes')) || [];
    this.quoteItems = [];
    this.quoteCounter = this.getLastQuoteNumber() + 1;
    this.currentProductType = 'semillas';

    // Configuración automática
    this.defaultConditions = [
      "Condiciones de pago: 70% de anticipo y 30% inmediatos al finalizar el trabajo o la entrega del producto",
      "Para la facturación: es necesario que envíe el CIF (cédula de identificación fiscal). En el caso del IVA por ser únicamente plantas, la tasa es cero (0)",
      "Cotización válida 10 días a partir de la fecha de emisión o notificar que es seguro el pedido",
      "Tiempo de entrega después del anticipo 5 días. (Programación)",
      "La existencia está sujeta a cambio sin previo aviso",
      `Precios vigentes ${new Date().getFullYear()}`
    ];

    // Configuración de impuestos, descuentos y envío
    this.taxRate = 0;
    this.discountType = 'none';
    this.discountValue = 0;
    this.shippingCost = 0;

    // Datos de la empresa
    this.companyInfo = {
      name: "MEXICO PRIMERO S DE S.S",
      activities: "GANADERIA, AGRICULTURA Y REFORESTACIÓN",
      address: "DOMICILIO CONOCIDO TZUCACAB, YUCATAN",
      rfc: "RFC: MPR980510JT9",
      phone: "99-97-48-26-11",
      email: "administracion@mexicoprimero.mx",
      fullAddress: "CALLE 39 No 92 Entre 22 y 24 C.P 97960 Tzucacab, Yucatán",
      logoPath: "logo.png",
      esrLogoPath: "logo2.png"  // Cambiado a logo2.png
    };

    // Firmas
    this.signatures = [
      "P.A ING LUIS GERARDO HERRERA TUZ",
      "CONSULTOR AMBIENTAL",
      "PROF. ALBERTO CASANOVA MARTIN",
      "DIRECTOR Y APODERADO LEGAL DE 'MEXICO PRIMERO S DE S.S'"
    ];
  }

  renderModuleInterface() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="quote-controls">
        <div class="section-header">
          <div>
            <h2><i class="fas fa-file-invoice-dollar"></i> Sistema de Cotizaciones Automatizado</h2>
            <p class="subtitle">Genera cotizaciones profesionales en minutos</p>
          </div>
          <div class="header-badges">
            <span class="badge info" id="quoteCounterBadge">COT ${this.formatQuoteNumber(this.quoteCounter)}</span>
            <span class="badge secondary" id="productCountBadge">0 productos</span>
          </div>
        </div>

        <div class="single-page-quote">
          <!-- Panel izquierdo: Formulario -->
          <div class="quote-form-panel">
            <div class="panel-header">
              <h3><i class="fas fa-edit"></i> Información de la Cotización</h3>
            </div>
            
            <div class="form-section">
              <h4><i class="fas fa-user-tie"></i> Información del Cliente</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="clientName" class="required-field">
                    <i class="fas fa-user"></i> Nombre del Cliente *
                  </label>
                  <input type="text" id="clientName" placeholder="Ingrese el nombre del cliente o empresa" required>
                </div>
                
                <div class="form-group">
                  <label for="clientAddress">
                    <i class="fas fa-map-marker-alt"></i> Dirección de Envío
                  </label>
                  <input type="text" id="clientAddress" placeholder="Dirección para envío (opcional)">
                </div>
                
                <div class="form-group">
                  <label for="quoteType">
                    <i class="fas fa-tag"></i> Tipo de Producto *
                  </label>
                  <select id="quoteType" required>
                    <option value="semillas">🌱 Semillas</option>
                    <option value="plantas">🌿 Plantas</option>
                    <option value="fertilizantes">🧪 Fertilizantes</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="quoteDate">
                    <i class="fas fa-calendar-alt"></i> Fecha *
                  </label>
                  <input type="date" id="quoteDate" required>
                </div>
                
                <div class="form-group">
                  <label for="validityDays">
                    <i class="fas fa-clock"></i> Vigencia (días) *
                  </label>
                  <div class="input-with-action">
                    <input type="number" id="validityDays" value="10" min="1" max="365" required>
                    <span class="input-helper">días</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4><i class="fas fa-boxes"></i> Agregar Productos</h4>
              
              <div class="search-container">
                <div class="search-bar">
                  <i class="fas fa-search"></i>
                  <input type="text" id="productSearch" placeholder="Buscar productos por nombre...">
                  <button class="btn-icon" id="clearSearch">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="search-info">
                  <span id="availableProductsCount">Cargando productos...</span>
                </div>
              </div>
              
              <div class="products-container" id="availableProductsContainer">
                <!-- Los productos se cargarán aquí en tabla -->
              </div>
            </div>

            <div class="form-section">
              <h4><i class="fas fa-shopping-cart"></i> Productos Seleccionados</h4>
              <div class="selected-products-list" id="selectedProductsList">
                <div class="empty-state">
                  <i class="fas fa-cart-plus"></i>
                  <p>No hay productos seleccionados</p>
                  <small>Busca y selecciona productos del inventario</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel derecho: Vista previa y configuración -->
          <div class="quote-preview-panel">
            <div class="panel-header">
              <h3><i class="fas fa-eye"></i> Configuración y Acciones</h3>
              <div class="panel-actions">
                <button class="btn-secondary btn-sm" id="editConditionsBtn">
                  <i class="fas fa-edit"></i> Condiciones
                </button>
                <button class="btn-secondary btn-sm" id="editTaxDiscountBtn">
                  <i class="fas fa-percentage"></i> IVA/Descuento/Envío
                </button>
              </div>
            </div>

            <!-- Resumen de la cotización -->
            <div class="preview-summary">
              <div class="summary-section">
                <h4><i class="fas fa-info-circle"></i> Información General</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span>Cliente:</span>
                    <strong id="summaryClientName">-</strong>
                  </div>
                  <div class="info-item">
                    <span>Dirección:</span>
                    <strong id="summaryAddress">-</strong>
                  </div>
                  <div class="info-item">
                    <span>Fecha:</span>
                    <strong id="summaryDate">-</strong>
                  </div>
                  <div class="info-item">
                    <span>Válido hasta:</span>
                    <strong id="summaryValidUntil">-</strong>
                  </div>
                  <div class="info-item">
                    <span>Tipo:</span>
                    <strong id="summaryType">-</strong>
                  </div>
                  <div class="info-item">
                    <span>Envío:</span>
                    <strong id="summaryShipping">$0.00</strong>
                  </div>
                </div>
              </div>

              <div class="summary-section">
                <h4><i class="fas fa-list"></i> Productos en Cotización</h4>
                <div class="products-summary" id="productsSummaryTable">
                  <p class="no-items">No hay productos seleccionados</p>
                </div>
              </div>

              <div class="summary-section">
                <h4><i class="fas fa-calculator"></i> Totales</h4>
                <div class="totals-grid">
                  <div class="total-item">
                    <span>Subtotal:</span>
                    <span id="summarySubtotal">$0.00</span>
                  </div>
                  <div class="total-item">
                    <span id="summaryDiscountLabel">Descuento:</span>
                    <span id="summaryDiscount">$0.00</span>
                  </div>
                  <div class="total-item">
                    <span id="summaryTaxLabel">IVA (0%):</span>
                    <span id="summaryTax">$0.00</span>
                  </div>
                  <div class="total-item">
                    <span>Costo de Envío:</span>
                    <span id="summaryShippingCost">$0.00</span>
                  </div>
                  <div class="total-item grand-total">
                    <span>TOTAL:</span>
                    <span id="summaryTotal">$0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="action-buttons">
              <button class="btn-primary" id="previewQuoteBtn">
                <i class="fas fa-eye"></i> Vista Previa Completa
              </button>
              <button class="btn-success" id="generateQuoteBtn">
                <i class="fas fa-file-invoice-dollar"></i> Generar Cotización
              </button>
              <button class="btn-secondary" id="clearQuoteBtn">
                <i class="fas fa-redo"></i> Limpiar Todo
              </button>
            </div>
          </div>
        </div>

        <!-- Modal para editar condiciones -->
        <div class="modal" id="conditionsModal">
          <div class="modal-content">
            <div class="modal-header">
              <h4><i class="fas fa-clipboard-list"></i> Editar Condiciones</h4>
              <button class="btn-icon modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="conditions-list" id="conditionsList"></div>
              <div class="modal-actions">
                <button class="btn-secondary" id="addConditionBtn">
                  <i class="fas fa-plus"></i> Agregar Condición
                </button>
                <button class="btn-success" id="saveConditionsBtn">
                  <i class="fas fa-save"></i> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal para IVA, descuento y envío -->
        <div class="modal" id="taxDiscountModal">
          <div class="modal-content">
            <div class="modal-header">
              <h4><i class="fas fa-percentage"></i> Configurar IVA, Descuento y Envío</h4>
              <button class="btn-icon modal-close-tax">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="tax-discount-form">
                <div class="form-group">
                  <label for="taxRate">
                    <i class="fas fa-receipt"></i> Tasa de IVA (%)
                  </label>
                  <div class="input-with-action">
                    <input type="number" id="taxRate" value="0" min="0" max="100" step="0.1">
                    <span class="input-helper">%</span>
                  </div>
                  <small>Para plantas, generalmente 0%</small>
                </div>
                
                <div class="form-group">
                  <label for="discountType">
                    <i class="fas fa-tag"></i> Tipo de Descuento
                  </label>
                  <select id="discountType">
                    <option value="none">Sin descuento</option>
                    <option value="fixed">Monto fijo</option>
                    <option value="percentage">Porcentaje</option>
                  </select>
                </div>
                
                <div class="form-group" id="discountValueContainer">
                  <label for="discountValue">
                    <i class="fas fa-money-bill-wave"></i> Valor del Descuento
                  </label>
                  <div class="input-with-action">
                    <input type="number" id="discountValue" value="0" min="0" step="0.01">
                    <span class="input-helper" id="discountHelper">$</span>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="modalShippingCost">
                    <i class="fas fa-truck"></i> Costo de Envío ($)
                  </label>
                  <div class="input-with-action">
                    <input type="number" id="modalShippingCost" value="0" min="0" step="0.01">
                    <span class="input-helper">$</span>
                  </div>
                  <small>Agrega el costo de transporte si aplica</small>
                </div>
              </div>
              
              <div class="modal-actions">
                <button class="btn-secondary" id="cancelTaxDiscountBtn">
                  Cancelar
                </button>
                <button class="btn-success" id="saveTaxDiscountBtn">
                  <i class="fas fa-save"></i> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .quote-controls {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #2e7d32;
        }
        
        .section-header h2 {
          color: #2e7d32;
          margin: 0;
          font-size: 24px;
        }
        
        .section-header .subtitle {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        
        .header-badges {
          display: flex;
          gap: 10px;
        }
        
        .badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        
        .badge.info {
          background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
          color: white;
        }
        
        .badge.secondary {
          background: white;
          color: #2e7d32;
          border: 2px solid #2e7d32;
        }
        
        /* LAYOUT DE UNA SOLA PÁGINA */
        .single-page-quote {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          min-height: 700px;
        }
        
        .quote-form-panel,
        .quote-preview-panel {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f1f8e9;
        }
        
        .panel-header h3 {
          color: #1b5e20;
          margin: 0;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .panel-actions {
          display: flex;
          gap: 10px;
        }
        
        /* FORMULARIO IZQUIERDO */
        .form-section {
          margin-bottom: 30px;
        }
        
        .form-section:last-child {
          margin-bottom: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .form-section h4 {
          color: #2e7d32;
          margin: 0 0 15px 0;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2e7d32;
          font-size: 13px;
        }
        
        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border: 2px solid #c8e6c9;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }
        
        .required-field::after {
          content: " *";
          color: #f44336;
        }
        
        .input-with-action {
          position: relative;
        }
        
        .input-helper {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: #f1f8e9;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
          color: #388e3c;
        }
        
        /* BÚSQUEDA DE PRODUCTOS */
        .search-container {
          margin-bottom: 20px;
        }
        
        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 2px solid #c8e6c9;
          border-radius: 8px;
          padding: 8px 12px;
        }
        
        .search-bar i {
          color: #4caf50;
        }
        
        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
        }
        
        .search-info {
          margin-top: 8px;
          font-size: 12px;
          color: #4caf50;
        }
        
        /* TABLA DE PRODUCTOS (REEMPLAZA A LAS TARJETAS) */
        .products-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .products-table-container {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        
        .products-table thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .products-table th {
          background: #2e7d32;
          color: white;
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          border-right: 1px solid #1b5e20;
        }
        
        .products-table th:last-child {
          border-right: none;
        }
        
        .products-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #e0e0e0;
          color: #333;
        }
        
        .products-table tr:hover {
          background-color: #f1f8e9;
        }
        
        .products-table tr.selected-product {
          background-color: #e8f5e9;
          border-left: 3px solid #4caf50;
        }
        
        .add-product-table-btn {
          padding: 6px 12px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }
        
        .add-product-table-btn:hover {
          background: #388e3c;
        }
        
        .add-product-table-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        /* PRODUCTOS SELECCIONADOS */
        .selected-products-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #c8e6c9;
        }
        
        .selected-product-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 8px;
          margin-bottom: 10px;
          border: 1px solid #e8f5e9;
        }
        
        .product-info h6 {
          margin: 0 0 5px 0;
          color: #1b5e20;
          font-size: 14px;
        }
        
        .product-info small {
          color: #666;
          font-size: 12px;
        }
        
        .product-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f1f8e9;
          padding: 4px 8px;
          border-radius: 6px;
        }
        
        .quantity-input {
          width: 60px;
          text-align: center;
          padding: 4px 8px;
          border: 1px solid #c8e6c9;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }
        
        .quantity-input:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }
        
        .btn-icon-sm {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: none;
          background: white;
          color: #388e3c;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* PANEL DERECHO - VISTA PREVIA */
        .preview-summary {
          flex: 1;
          overflow-y: auto;
        }
        
        .summary-section {
          margin-bottom: 25px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .info-item {
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .info-item span {
          font-size: 12px;
          color: #666;
          display: block;
          margin-bottom: 3px;
        }
        
        .info-item strong {
          color: #2e7d32;
          font-size: 13px;
        }
        
        .products-summary {
          max-height: 200px;
          overflow-y: auto;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .product-summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .totals-grid {
          background: #f1f8e9;
          padding: 15px;
          border-radius: 8px;
        }
        
        .total-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #c8e6c9;
        }
        
        .total-item.grand-total {
          font-weight: bold;
          color: #1b5e20;
          font-size: 16px;
          border-top: 2px solid #1b5e20;
          border-bottom: none;
          margin-top: 8px;
          padding-top: 12px;
        }
        
        /* BOTONES DE ACCIÓN */
        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 20px 0;
        }
        
        .btn-primary, .btn-success, .btn-secondary {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
        }
        
        .btn-success {
          background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
          color: white;
        }
        
        .btn-secondary {
          background: white;
          color: #388e3c;
          border: 2px solid #c8e6c9;
          grid-column: span 2;
        }
        
        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }
        
        /* MODALES */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        
        .modal.active {
          display: flex;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
        }
        
        /* ESTADOS VACÍOS */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #81c784;
        }
        
        .empty-state i {
          font-size: 48px;
          margin-bottom: 15px;
          color: #c8e6c9;
        }
        
        .empty-state p {
          margin: 8px 0;
          color: #388e3c;
        }
        
        .empty-state small {
          color: #81c784;
        }
        
        .no-items {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
        }
        
        /* RESPONSIVE */
        @media (max-width: 1200px) {
          .single-page-quote {
            grid-template-columns: 1fr;
          }
          
          .products-table {
            font-size: 12px;
          }
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            grid-template-columns: 1fr;
          }
          
          .btn-secondary {
            grid-column: span 1;
          }
          
          .products-table th,
          .products-table td {
            padding: 8px 4px;
            font-size: 11px;
          }
        }
      </style>
    `;
  }

  init() {
    console.log('🎯 Inicializando módulo de Cotizaciones Automático - Interfaz Única');
    window.quotationManager = this;
    this.bindEvents();
    this.updateQuoteDate();
    this.loadAvailableProducts();
    this.updateQuoteCounterBadge();
    this.updateSummary();
  }

  bindEvents() {
    // Cambiar tipo de producto
    document.getElementById('quoteType')?.addEventListener('change', (e) => {
      this.currentProductType = e.target.value;
      this.loadAvailableProducts();
      this.updateSummary();
    });

    // Búsqueda de productos
    document.getElementById('productSearch')?.addEventListener('input', (e) => {
      this.searchProducts(e.target.value);
    });

    document.getElementById('clearSearch')?.addEventListener('click', () => {
      document.getElementById('productSearch').value = '';
      this.searchProducts('');
    });

    // Botones de acción
    document.getElementById('generateQuoteBtn')?.addEventListener('click', () => this.generateQuotation());
    document.getElementById('previewQuoteBtn')?.addEventListener('click', () => this.showFullPreview());
    document.getElementById('clearQuoteBtn')?.addEventListener('click', () => this.clearQuote());

    // Botón para editar condiciones
    document.getElementById('editConditionsBtn')?.addEventListener('click', () => this.showConditionsModal());
    document.getElementById('addConditionBtn')?.addEventListener('click', () => this.addNewCondition());
    document.getElementById('saveConditionsBtn')?.addEventListener('click', () => this.saveConditions());

    // Botón para editar IVA/descuento/envío
    document.getElementById('editTaxDiscountBtn')?.addEventListener('click', () => this.showTaxDiscountModal());
    document.getElementById('saveTaxDiscountBtn')?.addEventListener('click', () => this.saveTaxDiscount());
    document.getElementById('cancelTaxDiscountBtn')?.addEventListener('click', () => this.hideTaxDiscountModal());
    document.getElementById('discountType')?.addEventListener('change', (e) => this.updateDiscountType(e.target.value));

    // Cerrar modales
    document.querySelector('.modal-close')?.addEventListener('click', () => this.hideConditionsModal());
    document.querySelector('.modal-close-tax')?.addEventListener('click', () => this.hideTaxDiscountModal());

    document.getElementById('conditionsModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideConditionsModal();
    });

    document.getElementById('taxDiscountModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideTaxDiscountModal();
    });

    // Actualizar resumen al cambiar datos
    const updateSummaryElements = ['clientName', 'clientAddress', 'validityDays', 'quoteDate'];
    updateSummaryElements.forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.updateSummary());
    });
  }

  // Métodos de carga de productos - AHORA EN TABLA
  loadAvailableProducts() {
    let products = [];
    switch(this.currentProductType) {
      case 'semillas':
        products = this.products;
        break;
      case 'plantas':
        products = this.plants;
        break;
      case 'fertilizantes':
        products = this.fertilizantes;
        break;
    }

    const container = document.getElementById('availableProductsContainer');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <i class="fas fa-inbox"></i>
          <p>No hay productos disponibles</p>
          <small>Ve al módulo correspondiente para agregar productos</small>
        </div>
      `;
      document.getElementById('availableProductsCount').textContent = '0 productos disponibles';
      return;
    }

    // Filtrar solo productos con stock
    const availableProducts = products.filter(p => (p.stock || 0) > 0);

    container.innerHTML = `
      <div class="products-table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>Nombre Común</th>
              <th>Nombre Científico</th>
              <th>Precio/kg</th>
              <th>Stock (kg)</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${availableProducts.map(product => `
              <tr class="product-row" data-id="${product.id}">
                <td><strong>${product.commonName || product.name || 'Sin nombre'}</strong></td>
                <td><em>${product.scientificName || ''}</em></td>
                <td>$${(product.unitPrice || 0).toFixed(2)}</td>
                <td>${(product.stock || 0).toFixed(2)}</td>
                <td>
                  <button class="add-product-table-btn" data-id="${product.id}">
                    <i class="fas fa-plus"></i> Agregar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('availableProductsCount').textContent =
      `${availableProducts.length} productos disponibles`;

    // Agregar eventos a los botones de la tabla
    container.querySelectorAll('.add-product-table-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = e.target.closest('.add-product-table-btn').getAttribute('data-id');
        this.addProductToQuote(productId);

        // Efecto visual
        const row = e.target.closest('.product-row');
        row.classList.add('selected-product');
        setTimeout(() => row.classList.remove('selected-product'), 1000);
      });
    });

    // Hacer las filas clickeables también
    container.querySelectorAll('.product-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (!e.target.closest('.add-product-table-btn')) {
          const productId = row.getAttribute('data-id');
          this.addProductToQuote(productId);

          // Efecto visual
          row.classList.add('selected-product');
          setTimeout(() => row.classList.remove('selected-product'), 1000);
        }
      });
    });
  }

  addProductToQuote(productId) {
    let sourceArray;
    switch(this.currentProductType) {
      case 'semillas':
        sourceArray = this.products;
        break;
      case 'plantas':
        sourceArray = this.plants;
        break;
      case 'fertilizantes':
        sourceArray = this.fertilizantes;
        break;
    }

    const product = sourceArray.find(p => p.id == productId);
    if (!product) return;

    // Verificar si ya está en la cotización
    const existingItem = this.quoteItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.subtotal = existingItem.unitPrice * existingItem.quantity;
    } else {
      const newItem = {
        id: product.id,
        commonName: product.commonName || product.name || '',
        scientificName: product.scientificName || '',
        classification: product.classification || '',
        availableMonths: product.availableMonths || product.monthsAvailable || '',
        seedsPerKilo: product.seedsPerKilo || 0,
        unitPrice: product.unitPrice || 0,
        quantity: 1,
        subtotal: product.unitPrice || 0,
        stock: product.stock || 0,
        type: this.currentProductType
      };
      this.quoteItems.push(newItem);
    }

    this.updateSelectedProducts();
    this.updateSummary();
  }

  removeProductFromQuote(productId) {
    const index = this.quoteItems.findIndex(item => item.id === productId);
    if (index !== -1) {
      this.quoteItems.splice(index, 1);
      this.updateSelectedProducts();
      this.updateSummary();
    }
  }

  updateProductQuantity(productId, newQuantity) {
    const item = this.quoteItems.find(item => item.id === productId);
    if (item) {
      if (newQuantity >= 1) {
        item.quantity = newQuantity;
        item.subtotal = item.unitPrice * item.quantity;
        this.updateSelectedProducts();
        this.updateSummary();
      } else if (newQuantity === 0) {
        this.removeProductFromQuote(productId);
      }
    }
  }

  updateSelectedProducts() {
    const container = document.getElementById('selectedProductsList');
    const productCountBadge = document.getElementById('productCountBadge');

    if (!container) return;

    productCountBadge.textContent = `${this.quoteItems.length} ${this.quoteItems.length === 1 ? 'producto' : 'productos'}`;

    if (this.quoteItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-cart-plus"></i>
          <p>No hay productos seleccionados</p>
          <small>Busca y selecciona productos del inventario</small>
        </div>
      `;
      return;
    }

    container.innerHTML = this.quoteItems.map(item => `
      <div class="selected-product-item" data-id="${item.id}">
        <div class="product-info">
          <h6>${item.commonName}</h6>
          <small><em>${item.scientificName}</em></small>
          <small>Stock: ${item.stock} kg</small>
        </div>
        <div class="product-controls">
          <div class="quantity-controls">
            <button class="btn-icon-sm decrease-qty" data-id="${item.id}">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" 
                   class="quantity-input" 
                   value="${item.quantity}" 
                   min="1" 
                   max="${item.stock}" 
                   step="0.01"
                   data-id="${item.id}"
                   title="Cantidad en kg">
            <button class="btn-icon-sm increase-qty" data-id="${item.id}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div style="font-weight: bold; color: #1b5e20;">
            $${item.subtotal.toFixed(2)}
          </div>
          <button class="btn-icon-sm remove-product" data-id="${item.id}" style="color: #f44336;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Agregar eventos para los botones de incremento/decremento
    container.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('.decrease-qty').getAttribute('data-id');
        const item = this.quoteItems.find(item => item.id === productId);
        if (item && item.quantity > 1) {
          this.updateProductQuantity(productId, item.quantity - 1);
        }
      });
    });

    container.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('.increase-qty').getAttribute('data-id');
        const item = this.quoteItems.find(item => item.id === productId);
        if (item && item.quantity < item.stock) {
          this.updateProductQuantity(productId, item.quantity + 1);
        } else {
          window.app?.showNotification?.(`No hay suficiente stock para "${item.commonName}". Stock disponible: ${item.stock} kg`, 'warning');
        }
      });
    });

    // Agregar eventos para los inputs de cantidad
    container.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const productId = e.target.getAttribute('data-id');
        const newQuantity = parseFloat(e.target.value);
        const item = this.quoteItems.find(item => item.id === productId);

        if (isNaN(newQuantity) || newQuantity <= 0) {
          e.target.value = item.quantity;
          return;
        }

        if (newQuantity > item.stock) {
          window.app?.showNotification?.(`No hay suficiente stock para "${item.commonName}". Stock disponible: ${item.stock} kg`, 'warning');
          e.target.value = item.quantity;
          return;
        }

        this.updateProductQuantity(productId, newQuantity);
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      });
    });

    // Agregar eventos para el botón de eliminar
    container.querySelectorAll('.remove-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('.remove-product').getAttribute('data-id');
        this.removeProductFromQuote(productId);
      });
    });
  }

  updateSummary() {
    // Actualizar información básica
    const clientName = document.getElementById('clientName')?.value || '';
    const clientAddress = document.getElementById('clientAddress')?.value || '';
    const validityDays = parseInt(document.getElementById('validityDays')?.value) || 10;
    const quoteDate = document.getElementById('quoteDate')?.value;
    const quoteType = document.getElementById('quoteType')?.value;

    document.getElementById('summaryClientName').textContent = clientName || '-';
    document.getElementById('summaryAddress').textContent = clientAddress || '-';
    document.getElementById('summaryDate').textContent = this.formatDateForDisplay(quoteDate);
    document.getElementById('summaryShipping').textContent = `$${this.shippingCost.toFixed(2)}`;

    if (quoteDate) {
      const validUntil = new Date(quoteDate);
      validUntil.setDate(validUntil.getDate() + validityDays);
      document.getElementById('summaryValidUntil').textContent = this.formatDateForDisplay(validUntil.toISOString());
    }

    document.getElementById('summaryType').textContent = this.getTypeText(quoteType);

    // Actualizar tabla de productos
    const table = document.getElementById('productsSummaryTable');
    if (this.quoteItems.length === 0) {
      table.innerHTML = '<p class="no-items">No hay productos seleccionados</p>';
      this.updateTotalsDisplay();
      return;
    }

    table.innerHTML = this.quoteItems.map(item => `
      <div class="product-summary-item">
        <div>
          <strong>${item.commonName}</strong>
          <small>${item.quantity} kg × $${item.unitPrice.toFixed(2)}</small>
        </div>
        <strong>$${item.subtotal.toFixed(2)}</strong>
      </div>
    `).join('');

    this.updateTotalsDisplay();
  }

  calculateTotals() {
    const subtotal = this.quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
    let discount = 0;
    if (this.discountType === 'fixed') {
      discount = Math.min(this.discountValue, subtotal);
    } else if (this.discountType === 'percentage') {
      discount = subtotal * (this.discountValue / 100);
    }
    const taxableAmount = subtotal - discount;
    const taxAmount = taxableAmount * (this.taxRate / 100);
    const total = taxableAmount + taxAmount + this.shippingCost;

    return { subtotal, discount, taxAmount, shippingCost: this.shippingCost, total };
  }

  updateTotalsDisplay() {
    const totals = this.calculateTotals();
    document.getElementById('summarySubtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('summaryDiscount').textContent = `$${totals.discount.toFixed(2)}`;
    document.getElementById('summaryTaxLabel').textContent = `IVA (${this.taxRate}%):`;
    document.getElementById('summaryTax').textContent = `$${totals.taxAmount.toFixed(2)}`;
    document.getElementById('summaryShippingCost').textContent = `$${totals.shippingCost.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${totals.total.toFixed(2)}`;
  }

  // Métodos de ayuda
  getTypeText(type) {
    const types = { 'semillas': 'Semillas', 'plantas': 'Plantas', 'fertilizantes': 'Fertilizantes' };
    return types[type] || type;
  }

  formatDateForDisplay(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-ES');
    } catch { return ''; }
  }

  formatQuoteNumber(number) {
    const paddedNumber = number.toString().padStart(3, '0');
    const currentYear = new Date().getFullYear();
    return `${paddedNumber}/${currentYear}`;
  }

  updateQuoteDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const dateInput = document.getElementById('quoteDate');
    if (dateInput) {
      dateInput.value = formattedDate;
      dateInput.min = formattedDate;
    }
  }

  // Métodos para modales
  showConditionsModal() {
    const modal = document.getElementById('conditionsModal');
    const conditionsList = document.getElementById('conditionsList');
    conditionsList.innerHTML = '';
    this.defaultConditions.forEach((condition, index) => {
      const conditionElement = document.createElement('div');
      conditionElement.className = 'condition-item';
      conditionElement.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <span style="font-weight: bold; min-width: 30px;">${index + 1}.</span>
          <textarea style="flex: 1; padding: 8px; border: 1px solid #c8e6c9; border-radius: 6px; min-height: 60px; font-size: 14px;">${condition}</textarea>
          <button class="btn-icon-sm" onclick="window.quotationManager.removeCondition(${index})" style="color: #f44336; background: #ffebee;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      conditionsList.appendChild(conditionElement);
    });
    modal.classList.add('active');
  }

  hideConditionsModal() {
    document.getElementById('conditionsModal').classList.remove('active');
  }

  showTaxDiscountModal() {
    const modal = document.getElementById('taxDiscountModal');
    document.getElementById('taxRate').value = this.taxRate;
    document.getElementById('discountType').value = this.discountType;
    document.getElementById('discountValue').value = this.discountValue;
    document.getElementById('modalShippingCost').value = this.shippingCost;
    this.updateDiscountType(this.discountType);
    modal.classList.add('active');
  }

  hideTaxDiscountModal() {
    document.getElementById('taxDiscountModal').classList.remove('active');
  }

  updateDiscountType(type) {
    const container = document.getElementById('discountValueContainer');
    const helper = document.getElementById('discountHelper');
    container.style.display = type === 'none' ? 'none' : 'block';
    helper.textContent = type === 'percentage' ? '%' : '$';
  }

  saveTaxDiscount() {
    this.taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    this.discountType = document.getElementById('discountType').value;
    this.discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    this.shippingCost = parseFloat(document.getElementById('modalShippingCost').value) || 0;

    this.hideTaxDiscountModal();
    this.updateSummary();
    window.app?.showNotification?.('Configuración de IVA, descuento y envío guardada', 'success');
  }

  addNewCondition() {
    const conditionsList = document.getElementById('conditionsList');
    const newIndex = this.defaultConditions.length;
    const conditionElement = document.createElement('div');
    conditionElement.className = 'condition-item';
    conditionElement.innerHTML = `
      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <span style="font-weight: bold; min-width: 30px;">${newIndex + 1}.</span>
        <textarea style="flex: 1; padding: 8px; border: 1px solid #c8e6c9; border-radius: 6px; min-height: 60px; font-size: 14px;" placeholder="Nueva condición..."></textarea>
        <button class="btn-icon-sm" onclick="window.quotationManager.removeCondition(${newIndex})" style="color: #f44336; background: #ffebee;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    conditionsList.appendChild(conditionElement);
  }

  removeCondition(index) {
    if (this.defaultConditions.length > 1) {
      this.defaultConditions.splice(index, 1);
      this.showConditionsModal();
    } else {
      window.app?.showNotification?.('Debe haber al menos una condición', 'warning');
    }
  }

  saveConditions() {
    const conditionInputs = document.querySelectorAll('#conditionsList textarea');
    this.defaultConditions = Array.from(conditionInputs).map(input => input.value.trim()).filter(c => c.length > 0);
    this.hideConditionsModal();
    window.app?.showNotification?.('Condiciones guardadas', 'success');
  }

  // Métodos de validación y generación
  validateQuote() {
    const clientName = document.getElementById('clientName')?.value.trim();
    if (!clientName) {
      window.app?.showNotification?.('Ingresa el nombre del cliente', 'error');
      return false;
    }
    if (this.quoteItems.length === 0) {
      window.app?.showNotification?.('Selecciona al menos un producto', 'error');
      return false;
    }

    // Validar stock disponible
    for (const item of this.quoteItems) {
      if (item.quantity > item.stock) {
        window.app?.showNotification?.(`Stock insuficiente para "${item.commonName}". Disponible: ${item.stock} kg, Solicitado: ${item.quantity} kg`, 'warning');
        return false;
      }
    }

    return true;
  }

  generateQuotation() {
    if (!this.validateQuote()) return;

    const clientName = document.getElementById('clientName').value.trim();
    const clientAddress = document.getElementById('clientAddress').value.trim();
    const validityDays = parseInt(document.getElementById('validityDays').value) || 10;
    const quoteDate = document.getElementById('quoteDate').value;
    const quoteType = document.getElementById('quoteType').value;
    const totals = this.calculateTotals();
    const quoteNumber = this.formatQuoteNumber(this.quoteCounter);

    const quoteData = {
      id: quoteNumber,
      clientName,
      clientAddress,
      date: quoteDate,
      validityDays,
      validUntil: this.calculateValidUntil(quoteDate, validityDays),
      type: quoteType,
      shippingCost: this.shippingCost,
      notes: 'De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:',
      items: this.quoteItems.map(item => ({
        ...item,
        subtotal: item.unitPrice * item.quantity
      })),
      conditions: this.defaultConditions,
      financial: {
        subtotal: totals.subtotal,
        discountType: this.discountType,
        discountValue: this.discountValue,
        discountAmount: totals.discount,
        taxRate: this.taxRate,
        taxAmount: totals.taxAmount,
        shippingCost: totals.shippingCost,
        total: totals.total
      },
      createdAt: new Date().toISOString(),
      status: 'pendiente'
    };

    this.quotations.push(quoteData);
    localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

    this.quoteCounter++;
    this.updateQuoteCounterBadge();

    window.app?.showNotification?.(`✅ Cotización ${quoteData.id} guardada exitosamente`, 'success');

    if (confirm('✅ Cotización guardada.\n\n¿Deseas crear una nueva cotización?')) {
      this.clearQuote();
    }
  }

  showFullPreview() {
    if (!this.validateQuote()) return;

    const quoteData = this.prepareQuoteData();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Vista Previa - Cotización ${quoteData.id}</title>
  <style>${this.getPrintStyles()}</style>
</head>
<body>
  ${this.getPrintHTML(quoteData)}
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

  prepareQuoteData() {
    const clientName = document.getElementById('clientName').value.trim();
    const clientAddress = document.getElementById('clientAddress').value.trim();
    const validityDays = parseInt(document.getElementById('validityDays').value) || 10;
    const quoteDate = document.getElementById('quoteDate').value;
    const quoteType = document.getElementById('quoteType').value;
    const totals = this.calculateTotals();
    const quoteNumber = this.formatQuoteNumber(this.quoteCounter);

    return {
      id: quoteNumber,
      clientName,
      clientAddress,
      date: quoteDate,
      validityDays,
      validUntil: this.calculateValidUntil(quoteDate, validityDays),
      type: quoteType,
      shippingCost: this.shippingCost,
      notes: 'De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:',
      items: this.quoteItems,
      conditions: this.defaultConditions,
      financial: {
        subtotal: totals.subtotal,
        discountAmount: totals.discount,
        taxRate: this.taxRate,
        taxAmount: totals.taxAmount,
        shippingCost: totals.shippingCost,
        total: totals.total
      }
    };
  }

  clearQuote() {
    this.quoteItems = [];
    this.shippingCost = 0;
    this.taxRate = 0;
    this.discountType = 'none';
    this.discountValue = 0;

    document.getElementById('clientName').value = '';
    document.getElementById('clientAddress').value = '';
    document.getElementById('validityDays').value = 10;
    document.getElementById('productSearch').value = '';

    this.updateQuoteDate();
    this.updateSelectedProducts();
    this.updateSummary();
    this.loadAvailableProducts();

    window.app?.showNotification?.('Listo para nueva cotización', 'info');
  }

  searchProducts(searchTerm) {
    const table = document.querySelector('.products-table tbody');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
  }

  getLastQuoteNumber() {
    if (this.quotations.length === 0) return 0;
    let maxNumber = 0;
    this.quotations.forEach(quote => {
      if (quote.id) {
        const match = quote.id.match(/^(\d{3})\/\d{4}$/);
        if (match) maxNumber = Math.max(maxNumber, parseInt(match[1]));
      }
    });
    return maxNumber;
  }

  updateQuoteCounterBadge() {
    const badge = document.getElementById('quoteCounterBadge');
    if (badge) badge.textContent = `COT ${this.formatQuoteNumber(this.quoteCounter)}`;
  }

  calculateValidUntil(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  getPrintHTML(quoteData) {
    const typeText = {
      'semillas': 'SEMILLAS',
      'plantas': 'PLANTAS',
      'fertilizantes': 'FERTILIZANTES'
    };

    const itemsHTML = quoteData.items?.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.commonName || 'Producto'}</strong><br>
            <small><em>${item.scientificName || ''}</em></small></td>
        <td>${item.classification || 'Certificada'}</td>
        <td>${item.availableMonths || 'N/A'}</td>
        <td>${item.seedsPerKilo?.toLocaleString() || '0'}</td>
        <td>$${(item.unitPrice || 0).toFixed(2)}</td>
        <td>${item.quantity || 1} kg</td>
        <td><strong>$${(item.subtotal || 0).toFixed(2)}</strong></td>
      </tr>
    `).join('') || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">No hay productos en la cotización</td></tr>';

    const conditionsHTML = quoteData.conditions?.map((condition, index) => `
      <div class="print-condition-item">
        <div class="print-condition-number">${index + 1}</div>
        <div>${condition}</div>
      </div>
    `).join('');

    const financial = quoteData.financial || {};
    const subtotal = financial.subtotal || 0;
    const discountAmount = financial.discountAmount || 0;
    const taxAmount = financial.taxAmount || 0;
    const total = financial.total || 0;

    let discountText = '';
    if (financial.discountType === 'fixed' && discountAmount > 0) {
      discountText = `Descuento: $${discountAmount.toFixed(2)}`;
    } else if (financial.discountType === 'percentage' && discountAmount > 0) {
      discountText = `Descuento (${financial.discountValue}%): $${discountAmount.toFixed(2)}`;
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
            <div class="print-quote-title-section">COTIZACIÓN DE ${typeText[quoteData.type] || 'PRODUCTOS'}</div>
          </div>
          
          <div class="print-quote-details-row">
            <div class="print-folio-section" style="color: #ff0000; font-size: 14px; font-weight: bold;">
              COTIZACIÓN No. ${quoteData.id}
            </div>
            <div class="print-date-section">
              Mérida, Yucatán, a <span class="print-dynamic-field">${this.formatDate(quoteData.date)}</span>
            </div>
            <div class="print-cot-section">
              Válido hasta: <span class="print-dynamic-field">${this.formatDate(quoteData.validUntil)}</span>
            </div>
          </div>
          
          <div class="print-client-info">
            <strong>CLIENTE:</strong> <span class="print-dynamic-field">${quoteData.clientName}</span>
            ${quoteData.clientAddress ? `<br><strong>DIRECCIÓN:</strong> <span class="print-dynamic-field">${quoteData.clientAddress}</span>` : ''}
          </div>
          
          <div class="print-intro-text">
            ${quoteData.notes || 'De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:'}
          </div>
        </div>

        <table class="print-products-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Producto</th>
              <th>Clasificación</th>
              <th>Meses</th>
              <th>Semillas/kilo</th>
              <th>Precio/kilo</th>
              <th>Cantidad (kg)</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <div class="print-summary">
          <div class="print-summary-item">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          ${discountText ? `
          <div class="print-summary-item">
            <span>${discountText.split(':')[0]}:</span>
            <span>$${discountAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="print-summary-item">
            <span>IVA (${financial.taxRate || 0}%):</span>
            <span>$${taxAmount.toFixed(2)}</span>
          </div>
          ${this.shippingCost > 0 ? `
          <div class="print-summary-item">
            <span>Costo de Envío:</span>
            <span>$${this.shippingCost.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="print-summary-item print-summary-total">
            <span>TOTAL:</span>
            <span>$${total.toFixed(2)}</span>
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

        <!-- PIE DE PÁGINA CON LOGO ESR A LA DERECHA -->
        <div class="print-footer">
          <div class="footer-contact">
            ${this.companyInfo.fullAddress}<br>
            Whatsapp: ${this.companyInfo.phone} / email: ${this.companyInfo.email}
          </div>
          <div class="footer-copyright">
            <div style="float: left; width: 70%;">
              © ${new Date().getFullYear()} ${this.companyInfo.name} - Sistema de Gestión Integral v2.0<br>
              Esta es una cotización generada electrónicamente
            </div>
            <div style="float: right; width: 30%; text-align: right;">
              <img src="${this.companyInfo.esrLogoPath}" alt="Logo ESR" style="max-width: 120px; max-height: 100px; display: block; margin-left: auto;" onerror="this.style.display='none'">
            </div>
            <div style="clear: both;"></div>
          </div>
        </div>
      </div>
    `;
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
      
      /* TABLA DE PRODUCTOS */
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
      }
      
      .print-products-table td {
        padding: 8px 5px;
        border: 1px solid #ddd;
        text-align: center;
      }
      
      .print-products-table tr:nth-child(even) {
        background-color: #f9f9f9;
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
      
      /* PIE DE PÁGINA */
      .print-footer {
        text-align: center;
        font-size: 10px;
        color: #555;
        border-top: 1px solid #ccc;
        padding-top: 15px;
        margin-top: 40px;
      }
      
      .footer-contact {
        margin-bottom: 10px;
      }
      
      .footer-copyright {
        color: #777;
        overflow: hidden;
        margin-top: 15px;
        position: relative;
        min-height: 100px;
      }
      
      @media print {
        body { padding: 0; }
        .print-container { box-shadow: none; padding: 15px; }
        .no-print { display: none !important; }
        @page { margin: 1.5cm; }
      }
    `;
  }
}

// Exportar para el sistema principal
window.QuotationManager = QuotationManager;
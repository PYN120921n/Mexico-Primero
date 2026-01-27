// cotizaciones_plantas.js - Sistema de Cotizaciones Automatizado Solo para Plantas
class PlantQuotationManager {
  constructor() {
    this.quotations = JSON.parse(localStorage.getItem('mexicoprimero_cotizaciones')) || [];
    this.plants = JSON.parse(localStorage.getItem('vivero_plantas')) || [];
    this.quoteItems = [];
    this.quoteCounter = this.getLastQuoteNumber();
    this.currentProductType = 'plantas';

    // Configuración de bolsas y alturas
    this.bagSizes = ['13x20', '25x25', '30x30', '30x40', '40x40'];
    this.heightOptions = ['20-30', '40-50', '50-60', '60-70', '80-90', '100', '150', '180', '200', '300'];

    // Configuración automática con marcadores dinámicos
    this.defaultConditions = [
      "Condiciones de pago: 70% de anticipo y 30% inmediatos al finalizar el trabajo o la entrega del producto",
      "Para la facturación: es necesario que envíe el CIF (cédula de identificación fiscal). En el caso del IVA por ser únicamente plantas, la tasa es {taxRate}%",
      "Cotización válida {days} días a partir de la fecha de emisión o notificar que es seguro el pedido",
      "Tiempo de entrega después del anticipo 5 días. (Programación)",
      "La existencia está sujeta a cambio sin previo aviso",
      `Precios vigentes ${new Date().getFullYear()}`
    ];

    // Configuración de impuestos, descuentos y envío
    this.taxRate = 0; // IVA para plantas
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
      esrLogoPath: "logo2.png"
    };

    // Firmas
    this.signatures = [
      "P.A ING LUIS GERARDO HERRERA TUZ",
      "CONSULTOR AMBIENTAL",
      "PROF. ALBERTO CASANOVA MARTIN",
      "DIRECTOR Y APODERADO LEGAL DE 'MEXICO PRIMERO S DE S.S'"
    ];
  }

  // MÉTODO FALTANTE: Obtener el último número de cotización
  getLastQuoteNumber() {
    try {
      // Obtener todas las cotizaciones del localStorage
      const allQuotes = JSON.parse(localStorage.getItem('mexicoprimero_cotizaciones')) || [];

      if (allQuotes.length === 0) {
        return 1; // Si no hay cotizaciones, empezar en 1
      }

      // Encontrar el número más alto de las cotizaciones existentes
      let maxNumber = 0;
      allQuotes.forEach(quote => {
        // Extraer el número de cotización del formato "COT-001" o similar
        const match = quote.quoteNumber?.match(/\d+/);
        if (match) {
          const num = parseInt(match[0]);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      });

      return maxNumber > 0 ? maxNumber + 1 : 1;
    } catch (error) {
      console.error('Error al obtener último número de cotización:', error);
      return 1;
    }
  }

  // MÉTODO FALTANTE: Formatear número de cotización
  formatQuoteNumber(number) {
    // Formatear como "COT-001", "COT-010", etc.
    const paddedNumber = number.toString().padStart(3, '0');
    const currentYear = new Date().getFullYear();
    return `${paddedNumber}/${currentYear}`;
  }

  // MÉTODO FALTANTE: Formatear números con comas
  formatNumberWithCommas(num) {
    if (typeof num === 'string') {
      const parts = num.split('.');
      if (parts.length === 2) {
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${integerPart}.${parts[1]}`;
      }
      return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const number = typeof num === 'number' ? num : parseFloat(num);
    if (isNaN(number)) return '0';

    const hasDecimals = number % 1 !== 0;
    if (hasDecimals) {
      return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  // MÉTODO FALTANTE: Formatear fecha para mostrar
  formatDateForDisplay(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // NUEVO MÉTODO: Actualizar condiciones con valores actuales
  getUpdatedConditions() {
    const validityDays = parseInt(document.getElementById('validityDays')?.value) || 10;

    return this.defaultConditions.map(condition => {
      return condition
        .replace('{taxRate}', this.taxRate)
        .replace('{days}', validityDays);
    });
  }

  renderModuleInterface() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="quote-controls">
        <!-- ENCABEZADO MEJORADO -->
        <div class="section-header">
          <div class="header-left">
            <div class="logo-title-container">
              <div class="logo-icon">
                <i class="fas fa-seedling"></i>
              </div>
              <div>
                <h2>Sistema de Cotizaciones de Plantas</h2>
                <p class="subtitle">Genera cotizaciones profesionales para plantas del vivero</p>
              </div>
            </div>
          </div>
          
          <div class="header-right">
            <div class="header-badges">
              <span class="badge primary" id="quoteCounterBadge">
                <i class="fas fa-file-invoice"></i> COT ${this.formatQuoteNumber(this.quoteCounter)}
              </span>
              <span class="badge secondary" id="productCountBadge">
                <i class="fas fa-leaf"></i> <span id="totalPlantsCount">0</span> plantas
              </span>
              <span class="badge success" id="taxStatusBadge">
                <i class="fas fa-percentage"></i> IVA: ${this.taxRate}%
              </span>
              <span class="badge warning" id="itemsStatusBadge">
                <i class="fas fa-shopping-cart"></i> <span id="totalItemsCount">0</span> ítems
              </span>
            </div>
          </div>
        </div>

        <!-- CONTENIDO PRINCIPAL MEJORADO -->
        <div class="single-page-quote">
          <!-- PANEL IZQUIERDO MEJORADO -->
          <div class="quote-form-panel">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon">
                  <i class="fas fa-edit"></i>
                </div>
                <div>
                  <h3>Información de la Cotización</h3>
                  <p class="panel-subtitle">Complete los datos del cliente y seleccione plantas</p>
                </div>
              </div>
              <div class="panel-actions">
                <button class="btn-icon" id="helpBtn" data-tooltip="Ayuda y atajos">
                  <i class="fas fa-question-circle"></i>
                </button>
              </div>
            </div>
            
            <div class="form-content">
              <!-- SECCIÓN CLIENTE MEJORADA -->
              <div class="form-section client-section">
                <div class="section-title">
                  <i class="fas fa-user-tie"></i>
                  <h4>Información del Cliente</h4>
                  <span class="required-badge">Requerido</span>
                </div>
                
                <div class="form-grid">
                  <div class="form-group enhanced">
                    <label for="clientName" class="form-label">
                      <i class="fas fa-user"></i>
                      <span>Nombre del Cliente *</span>
                    </label>
                    <div class="input-container">
                      <input type="text" id="clientName" placeholder="Nombre o empresa del cliente" required>
                      <div class="input-icon">
                        <i class="fas fa-building"></i>
                      </div>
                    </div>
                    <div class="form-hint">Requerido para generar la cotización</div>
                  </div>
                  
                  <div class="form-group enhanced">
                    <label for="clientAddress" class="form-label">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>Dirección de Envío</span>
                    </label>
                    <div class="input-container">
                      <input type="text" id="clientAddress" placeholder="Dirección para entrega (opcional)">
                      <div class="input-icon">
                        <i class="fas fa-truck"></i>
                      </div>
                    </div>
                    <div class="form-hint">Para calcular costos de envío si aplica</div>
                  </div>
                  
                  <div class="form-group enhanced">
                    <label for="quoteDate" class="form-label">
                      <i class="fas fa-calendar-alt"></i>
                      <span>Fecha *</span>
                    </label>
                    <div class="input-container">
                      <input type="date" id="quoteDate" required>
                      <div class="input-icon">
                        <i class="fas fa-calendar-check"></i>
                      </div>
                    </div>
                    <div class="form-hint">Fecha de emisión de la cotización</div>
                  </div>
                  
                  <div class="form-group enhanced">
                    <label for="validityDays" class="form-label">
                      <i class="fas fa-clock"></i>
                      <span>Vigencia (días) *</span>
                    </label>
                    <div class="input-container">
                      <div class="input-with-actions">
                        <input type="number" id="validityDays" value="10" min="1" max="365" required>
                        <div class="input-actions">
                          <button type="button" class="btn-input-action" data-action="decrease">
                            <i class="fas fa-minus"></i>
                          </button>
                          <button type="button" class="btn-input-action" data-action="increase">
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>
                      <div class="input-suffix">días</div>
                    </div>
                    <div class="form-hint">Días de validez de la cotización</div>
                  </div>
                </div>
                
                <div class="form-info-note success">
                  <i class="fas fa-info-circle"></i>
                  <div>
                    <strong>Cotización específica para plantas</strong>
                    <p>IVA actual: <span id="currentTaxDisplay" class="highlight">${this.taxRate}%</span> • Plantas disponibles: <span id="availableCount" class="highlight">${this.plants.length}</span> • Última cotización: <span id="lastQuoteNumber" class="highlight">${this.formatQuoteNumber(this.quoteCounter - 1)}</span></p>
                  </div>
                </div>
              </div>

              <!-- SECCIÓN BÚSQUEDA MEJORADA -->
              <div class="form-section search-section">
                <div class="section-title">
                  <i class="fas fa-search"></i>
                  <h4>Buscar y Agregar Plantas</h4>
                  <span class="count-badge" id="availablePlantsCount">${this.plants.length} disponibles</span>
                </div>
                
                <div class="search-container enhanced">
                  <div class="search-bar-container">
                    <div class="search-bar">
                      <i class="fas fa-search"></i>
                      <input type="text" id="productSearch" placeholder="Buscar por nombre común, científico o ID...">
                      <button class="btn-icon clear-search" id="clearSearch">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div class="search-actions">
                      <button class="btn-sm filter-btn active" data-filter="all">
                        <i class="fas fa-layer-group"></i> Todas
                      </button>
                      <button class="btn-sm filter-btn" data-filter="available">
                        <i class="fas fa-check-circle"></i> Disponibles
                      </button>
                      <button class="btn-sm filter-btn" data-filter="popular">
                        <i class="fas fa-star"></i> Populares
                      </button>
                    </div>
                  </div>
                  
                  <div class="search-info">
                    <div class="search-stats">
                      <i class="fas fa-chart-bar"></i>
                      <span id="searchResultsCount">Mostrando ${this.plants.length} plantas</span>
                    </div>
                    <div class="search-hint">
                      <i class="fas fa-mouse-pointer"></i> Haz clic en cualquier planta para agregar
                    </div>
                  </div>
                </div>
                
                <div class="products-container enhanced" id="availableProductsContainer">
                  <!-- Las plantas se cargarán aquí -->
                </div>
              </div>

              <!-- SECCIÓN PLANTAS SELECCIONADAS MEJORADA -->
              <div class="form-section selected-section">
                <div class="section-title">
                  <i class="fas fa-shopping-cart"></i>
                  <h4>Plantas en la Cotización</h4>
                  <div class="selection-info">
                    <span class="badge secondary" id="selectedCount">0 seleccionadas</span>
                    <span class="badge warning" id="totalQuantityBadge">0 unidades</span>
                  </div>
                </div>
                
                <div class="selected-products-container">
                  <div class="selected-products-list" id="selectedProductsList">
                    <div class="empty-state">
                      <div class="empty-icon">
                        <i class="fas fa-cart-plus"></i>
                      </div>
                      <div class="empty-content">
                        <h5>Carrito de plantas vacío</h5>
                        <p>Busca y selecciona plantas del inventario para agregarlas a la cotización</p>
                        <button class="btn-outline" onclick="document.getElementById('productSearch').focus()">
                          <i class="fas fa-search"></i> Buscar plantas
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="selected-actions">
                    <button class="btn-icon" id="clearAllBtn" data-tooltip="Limpiar todas las plantas">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="btn-icon" id="reorderBtn" data-tooltip="Reordenar plantas">
                      <i class="fas fa-sort-amount-down"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL DERECHO MEJORADO -->
          <div class="quote-preview-panel">
            <div class="panel-header">
              <div class="panel-title">
                <div class="panel-icon">
                  <i class="fas fa-eye"></i>
                </div>
                <div>
                  <h3>Vista Previa y Configuración</h3>
                  <p class="panel-subtitle">Revise y configure la cotización antes de guardar</p>
                </div>
              </div>
              <div class="panel-actions">
                <button class="btn-icon" id="editConditionsBtn" data-tooltip="Editar condiciones">
                  <i class="fas fa-clipboard-list"></i>
                </button>
                <button class="btn-icon" id="editTaxDiscountBtn" data-tooltip="Configurar impuestos y descuentos">
                  <i class="fas fa-cog"></i>
                </button>
              </div>
            </div>

            <div class="preview-content">
              <!-- RESÚMEN RÁPIDO MEJORADO -->
              <div class="quick-summary">
                <div class="summary-card">
                  <div class="summary-icon">
                    <i class="fas fa-user-circle"></i>
                  </div>
                  <div class="summary-content">
                    <div class="summary-label">Cliente</div>
                    <div class="summary-value" id="summaryClientName">-</div>
                  </div>
                </div>
                
                <div class="summary-card">
                  <div class="summary-icon">
                    <i class="fas fa-calendar"></i>
                  </div>
                  <div class="summary-content">
                    <div class="summary-label">Fecha</div>
                    <div class="summary-value" id="summaryDate">-</div>
                  </div>
                </div>
                
                <div class="summary-card">
                  <div class="summary-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="summary-content">
                    <div class="summary-label">Válido hasta</div>
                    <div class="summary-value" id="summaryValidUntil">-</div>
                  </div>
                </div>
                
                <div class="summary-card">
                  <div class="summary-icon">
                    <i class="fas fa-truck"></i>
                  </div>
                  <div class="summary-content">
                    <div class="summary-label">Envío</div>
                    <div class="summary-value" id="summaryShipping">$0.00</div>
                  </div>
                </div>
              </div>

              <!-- LISTA DE PLANTAS MEJORADA -->
              <div class="preview-section">
                <div class="section-title">
                  <i class="fas fa-list-ul"></i>
                  <h4>Detalle de Plantas</h4>
                  <span class="count-badge" id="previewItemsCount">0 ítems</span>
                </div>
                
                <div class="products-preview-list" id="productsSummaryTable">
                  <div class="no-items-preview">
                    <i class="fas fa-seedling"></i>
                    <p>No hay plantas en la cotización</p>
                    <small>Agrega plantas desde el panel izquierdo</small>
                  </div>
                </div>
              </div>

              <!-- TOTALES MEJORADOS -->
              <div class="preview-section totals-section">
                <div class="section-title">
                  <i class="fas fa-calculator"></i>
                  <h4>Resumen Financiero</h4>
                </div>
                
                <div class="totals-container">
                  <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value" id="summarySubtotal">$0.00</span>
                  </div>
                  
                  <div class="total-row discount-row" id="discountRow" style="display: none;">
                    <span class="total-label" id="summaryDiscountLabel">Descuento:</span>
                    <span class="total-value discount" id="summaryDiscount">-$0.00</span>
                  </div>
                  
                  <div class="total-row">
                    <span class="total-label" id="summaryTaxLabel">IVA (${this.taxRate}%):</span>
                    <span class="total-value tax" id="summaryTax">$0.00</span>
                  </div>
                  
                  <div class="total-row shipping-row" id="shippingRow" style="display: none;">
                    <span class="total-label">Costo de Envío:</span>
                    <span class="total-value shipping" id="summaryShippingCost">$0.00</span>
                  </div>
                  
                  <div class="total-row grand-total">
                    <span class="total-label">TOTAL:</span>
                    <span class="total-value" id="summaryTotal">$0.00</span>
                  </div>
                </div>
                
                <div class="totals-info">
                  <div class="info-item">
                    <i class="fas fa-info-circle"></i>
                    <span>IVA aplicado al subtotal después de descuentos</span>
                  </div>
                </div>
              </div>

              <!-- CONDICIONES RESUMEN MEJORADO -->
              <div class="preview-section conditions-preview">
                <div class="section-title">
                  <i class="fas fa-clipboard-check"></i>
                  <h4>Condiciones Aplicadas</h4>
                </div>
                
                <div class="conditions-summary" id="conditionsSummary">
                  <div class="condition-item">
                    <i class="fas fa-check-circle"></i>
                    <span>IVA: ${this.taxRate}% | Vigencia: 10 días | Envío: $0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- BOTONES DE ACCIÓN MEJORADOS -->
            <div class="action-buttons enhanced">
              <button class="btn-action preview" id="previewQuoteBtn">
                <div class="btn-icon">
                  <i class="fas fa-eye"></i>
                </div>
                <div class="btn-content">
                  <span class="btn-title">Vista Previa</span>
                  <span class="btn-subtitle">Ver antes de imprimir</span>
                </div>
              </button>
              
              <button class="btn-action generate" id="generateQuoteBtn">
                <div class="btn-icon">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="btn-content">
                  <span class="btn-title">Guardar Cotización</span>
                  <span class="btn-subtitle">Guardar en el sistema</span>
                </div>
              </button>
              
              <button class="btn-action clear" id="clearQuoteBtn">
                <div class="btn-icon">
                  <i class="fas fa-redo"></i>
                </div>
                <div class="btn-content">
                  <span class="btn-title">Limpiar Todo</span>
                  <span class="btn-subtitle">Reiniciar cotización</span>
                </div>
              </button>
              
              <button class="btn-action export" id="exportQuoteBtn">
                <div class="btn-icon">
                  <i class="fas fa-download"></i>
                </div>
                <div class="btn-content">
                  <span class="btn-title">Exportar PDF</span>
                  <span class="btn-subtitle">Descargar documento</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- MODALES (se mantienen igual, solo mejoraremos el CSS) -->
        <!-- Modal para editar condiciones -->
        <div class="modal" id="conditionsModal">
          <div class="modal-content enhanced">
            <div class="modal-header">
              <div class="modal-title">
                <i class="fas fa-clipboard-list"></i>
                <h4>Editar Condiciones de la Cotización</h4>
              </div>
              <button class="btn-icon modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-info-note">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Variables disponibles</strong>
                  <p>Use <code>{taxRate}</code> para el IVA y <code>{days}</code> para la vigencia. Se reemplazarán automáticamente.</p>
                </div>
              </div>
              <div class="conditions-list" id="conditionsList"></div>
              <div class="modal-actions">
                <button class="btn-outline" id="addConditionBtn">
                  <i class="fas fa-plus"></i> Agregar Condición
                </button>
                <button class="btn-primary" id="saveConditionsBtn">
                  <i class="fas fa-save"></i> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal para descuento, IVA y envío -->
        <div class="modal" id="taxDiscountModal">
          <div class="modal-content enhanced">
            <div class="modal-header">
              <div class="modal-title">
                <i class="fas fa-percentage"></i>
                <h4>Configurar Impuestos y Descuentos</h4>
              </div>
              <button class="btn-icon modal-close-tax">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="tax-discount-form">
                <div class="form-group enhanced">
                  <label for="taxRate" class="form-label">
                    <i class="fas fa-receipt"></i>
                    <span>Tasa de IVA (%)</span>
                    <span class="required-indicator">*</span>
                  </label>
                  <div class="input-container">
                    <input type="number" id="taxRate" value="${this.taxRate}" min="0" max="100" step="0.1">
                    <div class="input-suffix">%</div>
                  </div>
                  <div class="form-hint">Para plantas, generalmente 0%</div>
                </div>
                
                <div class="form-group enhanced">
                  <label for="discountType" class="form-label">
                    <i class="fas fa-tag"></i>
                    <span>Tipo de Descuento</span>
                  </label>
                  <div class="select-container">
                    <select id="discountType">
                      <option value="none">Sin descuento</option>
                      <option value="fixed">Monto fijo ($)</option>
                      <option value="percentage">Porcentaje (%)</option>
                    </select>
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
                
                <div class="form-group enhanced" id="discountValueContainer" style="display: none;">
                  <label for="discountValue" class="form-label">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>Valor del Descuento</span>
                  </label>
                  <div class="input-container">
                    <input type="number" id="discountValue" value="${this.discountValue}" min="0" step="0.01">
                    <div class="input-suffix" id="discountHelper">$</div>
                  </div>
                </div>
                
                <div class="form-group enhanced">
                  <label for="modalShippingCost" class="form-label">
                    <i class="fas fa-truck"></i>
                    <span>Costo de Envío ($)</span>
                  </label>
                  <div class="input-container">
                    <input type="number" id="modalShippingCost" value="${this.shippingCost}" min="0" step="0.01">
                    <div class="input-suffix">$</div>
                  </div>
                  <div class="form-hint">Agrega el costo de transporte si aplica</div>
                </div>
              </div>
              
              <div class="modal-actions">
                <button class="btn-outline" id="cancelTaxDiscountBtn">
                  Cancelar
                </button>
                <button class="btn-primary" id="saveTaxDiscountBtn">
                  <i class="fas fa-save"></i> Aplicar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal para agregar detalles de planta -->
        <div class="modal" id="plantDetailsModal">
          <div class="modal-content enhanced">
            <div class="modal-header">
              <div class="modal-title">
                <i class="fas fa-leaf"></i>
                <h4>Agregar Detalles de Planta</h4>
              </div>
              <button class="btn-icon close-plant-details">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div id="plantDetailsContent">
                <!-- Se carga dinámicamente -->
              </div>
              <div class="modal-actions">
                <button class="btn-outline" id="cancelPlantDetails">
                  Cancelar
                </button>
                <button class="btn-primary" id="savePlantDetails">
                  <i class="fas fa-check"></i> Agregar a Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        /* ===== ESTILOS MEJORADOS ===== */
        
        /* VARIABLES DE COLOR */
        :root {
          --primary-color: #4caf50;
          --primary-dark: #388e3c;
          --primary-light: #c8e6c9;
          --primary-bg: #e8f5e9;
          --secondary-color: #2e7d32;
          --accent-color: #81c784;
          --success-color: #4caf50;
          --warning-color: #ff9800;
          --danger-color: #f44336;
          --info-color: #2196f3;
          --light-color: #f8f9fa;
          --dark-color: #333333;
          --gray-light: #e0e0e0;
          --gray: #9e9e9e;
          --gray-dark: #616161;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --border-radius-lg: 16px;
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
          --transition: all 0.3s ease;
        }
        
        /* RESET Y ESTILOS BASE */
        .quote-controls {
          padding: 24px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }
        
        /* ENCABEZADO MEJORADO */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 24px;
          background: white;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border-left: 6px solid var(--primary-color);
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-left {
          flex: 1;
          min-width: 300px;
        }
        
        .header-right {
          flex-shrink: 0;
        }
        
        .logo-title-container {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        
        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        
        .section-header h2 {
          color: var(--secondary-color);
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .subtitle {
          color: var(--gray-dark);
          margin: 6px 0 0 0;
          font-size: 15px;
          opacity: 0.9;
        }
        
        .header-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .badge {
          padding: 10px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: var(--transition);
          white-space: nowrap;
        }
        
        .badge.primary {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
        }
        
        .badge.secondary {
          background: white;
          color: var(--primary-color);
          border: 2px solid var(--primary-light);
          box-shadow: var(--shadow-sm);
        }
        
        .badge.success {
          background: linear-gradient(135deg, var(--success-color), #66bb6a);
          color: white;
          box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
        }
        
        .badge.warning {
          background: linear-gradient(135deg, var(--warning-color), #ffb74d);
          color: white;
          box-shadow: 0 3px 10px rgba(255, 152, 0, 0.3);
        }
        
        .badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }
        
        /* LAYOUT MEJORADO */
        .single-page-quote {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 30px;
          min-height: calc(100vh - 200px);
        }
        
        @media (max-width: 1200px) {
          .single-page-quote {
            grid-template-columns: 1fr;
            gap: 25px;
          }
        }
        
        /* PANELES MEJORADOS */
        .quote-form-panel,
        .quote-preview-panel {
          background: white;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(76, 175, 80, 0.1);
          display: flex;
          flex-direction: column;
          transition: var(--transition);
        }
        
        .quote-form-panel:hover,
        .quote-preview-panel:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          border-color: rgba(76, 175, 80, 0.2);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: linear-gradient(135deg, var(--primary-bg) 0%, white 100%);
          border-bottom: 1px solid var(--primary-light);
        }
        
        .panel-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .panel-icon {
          width: 44px;
          height: 44px;
          background: var(--primary-color);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        
        .panel-header h3 {
          color: var(--secondary-color);
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.2;
        }
        
        .panel-subtitle {
          color: var(--gray);
          margin: 4px 0 0 0;
          font-size: 13px;
        }
        
        .panel-actions {
          display: flex;
          gap: 8px;
        }
        
        .form-content,
        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        /* SECCIONES DE FORMULARIO MEJORADAS */
        .form-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--gray-light);
        }
        
        .form-section:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .section-title i {
          color: var(--primary-color);
          font-size: 18px;
        }
        
        .section-title h4 {
          color: var(--secondary-color);
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
        }
        
        .required-badge {
          background: var(--danger-color);
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .count-badge {
          background: var(--primary-light);
          color: var(--secondary-color);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        /* FORMULARIO MEJORADO */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        
        .form-group.enhanced {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--secondary-color);
          font-size: 14px;
        }
        
        .form-label i {
          color: var(--primary-color);
          font-size: 16px;
          width: 20px;
        }
        
        .required-indicator {
          color: var(--danger-color);
          margin-left: 4px;
        }
        
        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-container input,
        .input-container select {
          flex: 1;
          padding: 14px 16px;
          padding-right: 40px;
          border: 2px solid var(--primary-light);
          border-radius: var(--border-radius-sm);
          font-size: 15px;
          transition: var(--transition);
          background: white;
          color: var(--dark-color);
        }
        
        .input-container input:focus,
        .input-container select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
        }
        
        .input-icon {
          position: absolute;
          right: 14px;
          color: var(--primary-color);
          font-size: 16px;
          pointer-events: none;
        }
        
        .input-suffix {
          position: absolute;
          right: 14px;
          color: var(--gray);
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
        }
        
        .input-with-actions {
          display: flex;
          flex: 1;
        }
        
        .input-with-actions input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right: none;
        }
        
        .input-actions {
          display: flex;
          flex-direction: column;
          border: 2px solid var(--primary-light);
          border-left: none;
          border-top-right-radius: var(--border-radius-sm);
          border-bottom-right-radius: var(--border-radius-sm);
          overflow: hidden;
        }
        
        .btn-input-action {
          padding: 0 12px;
          border: none;
          background: white;
          color: var(--primary-color);
          cursor: pointer;
          transition: var(--transition);
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-input-action:hover {
          background: var(--primary-light);
        }
        
        .btn-input-action:first-child {
          border-bottom: 1px solid var(--primary-light);
        }
        
        .form-hint {
          color: var(--gray);
          font-size: 12px;
          margin-top: 4px;
        }
        
        /* SELECT MEJORADO */
        .select-container {
          position: relative;
        }
        
        .select-container select {
          appearance: none;
          width: 100%;
          padding: 14px 16px;
          padding-right: 40px;
          border: 2px solid var(--primary-light);
          border-radius: var(--border-radius-sm);
          background: white;
          font-size: 15px;
          cursor: pointer;
        }
        
        .select-container i {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary-color);
          pointer-events: none;
        }
        
        /* NOTAS INFORMATIVAS MEJORADAS */
        .form-info-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: var(--border-radius-sm);
          margin-top: 16px;
          animation: fadeIn 0.3s ease;
        }
        
        .form-info-note.success {
          background: var(--primary-bg);
          border-left: 4px solid var(--success-color);
        }
        
        .form-info-note i {
          color: var(--success-color);
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .form-info-note .highlight {
          color: var(--secondary-color);
          font-weight: 600;
          background: white;
          padding: 2px 8px;
          border-radius: 4px;
          margin: 0 2px;
        }
        
        /* BÚSQUEDA MEJORADA */
        .search-container.enhanced {
          margin-bottom: 20px;
        }
        
        .search-bar-container {
          margin-bottom: 12px;
        }
        
        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 2px solid var(--primary-light);
          border-radius: var(--border-radius-sm);
          padding: 12px 16px;
          transition: var(--transition);
          margin-bottom: 12px;
        }
        
        .search-bar:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
        }
        
        .search-bar i {
          color: var(--primary-color);
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          background: transparent;
          color: var(--dark-color);
        }
        
        .search-bar input::placeholder {
          color: var(--gray);
        }
        
        .clear-search {
          background: transparent;
          border: none;
          color: var(--gray);
          cursor: pointer;
          padding: 4px;
          transition: var(--transition);
        }
        
        .clear-search:hover {
          color: var(--danger-color);
        }
        
        .search-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .btn-sm {
          padding: 8px 16px;
          border: 2px solid var(--primary-light);
          background: white;
          color: var(--secondary-color);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn-sm:hover,
        .btn-sm.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .search-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        
        .search-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-color);
          font-size: 13px;
          font-weight: 500;
        }
        
        .search-hint {
          color: var(--gray);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        /* TABLA DE PLANTAS MEJORADA */
        .products-container.enhanced {
          flex: 1;
          min-height: 300px;
          max-height: 400px;
          overflow: hidden;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--primary-light);
          background: white;
          position: relative;
        }
        
        .products-table-container {
          height: 100%;
          overflow-y: auto;
        }
        
        .products-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
        }
        
        .products-table thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .products-table th {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          white-space: nowrap;
        }
        
        .products-table th:last-child {
          border-right: none;
        }
        
        .products-table td {
          padding: 12px;
          border-bottom: 1px solid var(--primary-light);
          color: var(--dark-color);
          font-size: 13px;
          vertical-align: middle;
          transition: var(--transition);
        }
        
        .products-table tr {
          transition: var(--transition);
          cursor: pointer;
        }
        
        .products-table tr:hover {
          background-color: var(--primary-bg);
          transform: translateX(2px);
        }
        
        .products-table tr.selected {
          background-color: var(--primary-bg);
          position: relative;
        }
        
        .products-table tr.selected::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--primary-color);
        }
        
        .table-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
          text-align: center;
          min-width: 80px;
        }
        
        .table-badge.secondary {
          background: var(--primary-light);
          color: var(--secondary-color);
        }
        
        .table-badge.warning {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        .table-badge.info {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .add-product-table-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        .add-product-table-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        
        /* PLANTAS SELECCIONADAS MEJORADA */
        .selected-products-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .selected-products-list {
          flex: 1;
          max-height: 300px;
          overflow-y: auto;
          padding: 16px;
          background: var(--light-color);
          border-radius: var(--border-radius-sm);
          border: 2px dashed var(--primary-light);
          min-height: 200px;
          transition: var(--transition);
        }
        
        .selected-products-list:empty {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--accent-color);
        }
        
        .empty-icon {
          font-size: 48px;
          color: var(--primary-light);
          margin-bottom: 16px;
        }
        
        .empty-content h5 {
          color: var(--secondary-color);
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .empty-content p {
          color: var(--gray);
          margin: 0 0 16px 0;
          font-size: 14px;
          max-width: 300px;
          margin: 0 auto 16px;
        }
        
        .selected-product-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: var(--border-radius-sm);
          margin-bottom: 12px;
          border: 1px solid var(--primary-light);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          animation: slideIn 0.3s ease;
        }
        
        .selected-product-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-color);
        }
        
        .product-info h6 {
          margin: 0 0 6px 0;
          color: var(--secondary-color);
          font-size: 15px;
          font-weight: 600;
        }
        
        .product-info small {
          color: var(--gray);
          font-size: 13px;
          display: block;
          margin-bottom: 4px;
        }
        
        .plant-details {
          font-size: 11px;
          color: var(--primary-color);
          background: var(--primary-bg);
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-top: 8px;
          font-weight: 500;
        }
        
        .product-controls {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }
        
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--primary-bg);
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--primary-light);
        }
        
        .quantity-input {
          width: 70px;
          text-align: center;
          padding: 8px 10px;
          border: 1px solid var(--primary-light);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          background: white;
          transition: var(--transition);
        }
        
        .quantity-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
        }
        
        .btn-icon-sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: white;
          color: var(--secondary-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          font-size: 14px;
          box-shadow: var(--shadow-sm);
        }
        
        .btn-icon-sm:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .btn-icon-sm.remove {
          color: var(--danger-color);
          background: #ffebee;
        }
        
        .selected-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        
        /* PANEL DERECHO MEJORADO */
        .quick-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--primary-light);
          transition: var(--transition);
        }
        
        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
          border-color: var(--primary-color);
        }
        
        .summary-icon {
          width: 40px;
          height: 40px;
          background: var(--primary-bg);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          font-size: 18px;
        }
        
        .summary-content {
          flex: 1;
        }
        
        .summary-label {
          color: var(--gray);
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .summary-value {
          color: var(--secondary-color);
          font-size: 14px;
          font-weight: 600;
          word-break: break-word;
        }
        
        /* VISTA PREVIA DE PLANTAS */
        .products-preview-list {
          max-height: 250px;
          overflow-y: auto;
          padding: 16px;
          background: var(--light-color);
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--primary-light);
        }
        
        .product-summary-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid var(--primary-light);
        }
        
        .product-summary-item:last-child {
          border-bottom: none;
        }
        
        .product-summary-item:hover {
          background: var(--primary-bg);
          margin: 0 -10px;
          padding: 12px 10px;
          border-radius: 6px;
        }
        
        .no-items-preview {
          text-align: center;
          padding: 40px 20px;
          color: var(--gray);
        }
        
        .no-items-preview i {
          font-size: 48px;
          color: var(--primary-light);
          margin-bottom: 16px;
        }
        
        .no-items-preview p {
          margin: 0 0 8px 0;
          color: var(--gray-dark);
          font-weight: 500;
        }
        
        /* TOTALES MEJORADOS */
        .totals-section {
          background: var(--primary-bg);
          border-radius: var(--border-radius-sm);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .totals-container {
          padding: 16px 0;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(200, 230, 201, 0.8);
          font-size: 14px;
        }
        
        .total-row:last-child {
          border-bottom: none;
        }
        
        .total-label {
          color: var(--gray-dark);
          font-weight: 500;
        }
        
        .total-value {
          color: var(--dark-color);
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }
        
        .total-value.discount {
          color: var(--danger-color);
        }
        
        .total-value.tax {
          color: var(--info-color);
        }
        
        .total-value.shipping {
          color: var(--warning-color);
        }
        
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: var(--secondary-color);
          border-top: 2px solid var(--secondary-color);
          margin-top: 12px;
          padding-top: 16px;
        }
        
        .totals-info {
          margin-top: 12px;
          padding: 12px;
          background: white;
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          color: var(--gray);
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* CONDICIONES RESUMEN */
        .conditions-preview {
          padding: 20px;
          background: white;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--primary-light);
        }
        
        .conditions-summary {
          padding: 12px;
          background: #e3f2fd;
          border-radius: var(--border-radius-sm);
          border-left: 4px solid var(--info-color);
        }
        
        .condition-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1565c0;
          font-size: 13px;
        }
        
        .condition-item i {
          color: var(--info-color);
        }
        
        /* BOTONES DE ACCIÓN MEJORADOS */
        .action-buttons.enhanced {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 24px;
          border-top: 1px solid var(--primary-light);
          background: linear-gradient(135deg, var(--light-color) 0%, white 100%);
        }
        
        .btn-action {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: none;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }
        
        .btn-action:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .btn-action .btn-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          flex-shrink: 0;
        }
        
        .btn-action .btn-content {
          flex: 1;
        }
        
        .btn-title {
          display: block;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .btn-subtitle {
          display: block;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .btn-action.preview {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
        }
        
        .btn-action.preview .btn-icon {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .btn-action.generate {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
        }
        
        .btn-action.generate .btn-icon {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .btn-action.clear {
          background: white;
          color: var(--secondary-color);
          border: 2px solid var(--primary-light);
        }
        
        .btn-action.clear .btn-icon {
          background: var(--primary-bg);
          color: var(--primary-color);
        }
        
        .btn-action.clear .btn-subtitle {
          color: var(--gray);
        }
        
        .btn-action.export {
          background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
          color: white;
        }
        
        .btn-action.export .btn-icon {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* BOTONES GENERALES MEJORADOS */
        .btn-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: none;
          background: white;
          color: var(--secondary-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          font-size: 16px;
          box-shadow: var(--shadow-sm);
        }
        
        .btn-icon:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: var(--primary-color);
          color: white;
        }
        
        .btn-outline {
          padding: 12px 24px;
          background: white;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-outline:hover {
          background: var(--primary-color);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        
        .btn-primary {
          padding: 14px 28px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          border: none;
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
        }
        
        /* MODALES MEJORADOS */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 2000;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.3s ease;
          padding: 20px;
        }
        
        .modal.active {
          display: flex;
        }
        
        .modal-content.enhanced {
          background: white;
          border-radius: var(--border-radius-lg);
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 30px;
          background: linear-gradient(135deg, var(--primary-bg) 0%, white 100%);
          border-bottom: 1px solid var(--primary-light);
        }
        
        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .modal-title i {
          color: var(--primary-color);
          font-size: 24px;
        }
        
        .modal-title h4 {
          margin: 0;
          color: var(--secondary-color);
          font-size: 20px;
          font-weight: 600;
        }
        
        .modal-body {
          padding: 30px;
          overflow-y: auto;
          max-height: calc(80vh - 120px);
        }
        
        .modal-info-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #e3f2fd;
          border-radius: var(--border-radius-sm);
          margin-bottom: 20px;
          border-left: 4px solid var(--info-color);
        }
        
        .modal-info-note i {
          color: var(--info-color);
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .modal-info-note strong {
          display: block;
          margin-bottom: 4px;
          color: #1565c0;
        }
        
        .modal-info-note p {
          margin: 0;
          color: #1565c0;
          font-size: 13px;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--primary-light);
        }
        
        /* CONDICIONES EN MODAL */
        .conditions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .condition-item {
          padding: 16px;
          background: var(--light-color);
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--primary-light);
          transition: var(--transition);
        }
        
        .condition-item:hover {
          border-color: var(--primary-color);
          background: var(--primary-bg);
        }
        
        .condition-item textarea {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 1px solid var(--primary-light);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          resize: vertical;
          transition: var(--transition);
          font-family: inherit;
        }
        
        .condition-item textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }
        
        /* ANIMACIONES */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* RESPONSIVE */
        @media (max-width: 1400px) {
          .single-page-quote {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .quote-controls {
            padding: 16px;
          }
          
          .section-header {
            padding: 20px;
            flex-direction: column;
            gap: 16px;
          }
          
          .header-badges {
            justify-content: flex-start;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-summary {
            grid-template-columns: 1fr;
          }
          
          .action-buttons.enhanced {
            grid-template-columns: 1fr;
          }
          
          .selected-product-item {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .product-controls {
            justify-content: space-between;
          }
          
          .modal-content.enhanced {
            margin: 0;
            max-height: 90vh;
          }
        }
        
        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 24px;
          }
          
          .panel-header h3 {
            font-size: 18px;
          }
          
          .badge {
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .btn-action {
            padding: 16px;
          }
          
          .btn-action .btn-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
        }
        
        /* UTILIDADES */
        .selection-info {
          display: flex;
          gap: 8px;
        }
        
        .highlight {
          color: var(--secondary-color);
          font-weight: 600;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        .loading {
          position: relative;
          pointer-events: none;
        }
        
        .loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          z-index: 1;
          margin: -15px 0 0 -15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* TOOLTIPS */
        [data-tooltip] {
          position: relative;
        }
        
        [data-tooltip]::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--dark-color);
          color: white;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          white-space: nowrap;
          z-index: 1000;
          margin-bottom: 8px;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition);
          box-shadow: var(--shadow-md);
        }
        
        [data-tooltip]::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: var(--dark-color);
          margin-bottom: 3px;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition);
        }
        
        [data-tooltip]:hover::before,
        [data-tooltip]:hover::after {
          opacity: 1;
          visibility: visible;
        }
        
        /* SCROLLBAR PERSONALIZADA */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--primary-bg);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--secondary-color);
        }
      </style>
    `;

    // Inicializar después de renderizar
    setTimeout(() => {
      this.init();
    }, 100);
  }

  init() {
    console.log('🌿 Inicializando módulo de Cotizaciones de Plantas - Solo Plantas');
    window.plantQuotationManager = this;
    this.bindEvents();
    this.updateQuoteDate();
    this.loadAvailablePlants();
    this.updateQuoteCounterBadge();
    this.updateSummary();
    this.updateTaxDisplay();
    this.updateCounters();
  }

  // MÉTODO FALTANTE: Actualizar badge del contador
  updateQuoteCounterBadge() {
    const badge = document.getElementById('quoteCounterBadge');
    if (badge) {
      badge.innerHTML = `<i class="fas fa-file-invoice"></i> COT ${this.formatQuoteNumber(this.quoteCounter)}`;
    }
  }

  // MÉTODO FALTANTE: Actualizar fecha de cotización
  updateQuoteDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const dateInput = document.getElementById('quoteDate');
    if (dateInput) {
      dateInput.value = formattedDate;
      dateInput.min = formattedDate;
    }
  }

  bindEvents() {
    // Búsqueda de plantas
    document.getElementById('productSearch')?.addEventListener('input', (e) => {
      this.searchPlants(e.target.value);
    });

    document.getElementById('clearSearch')?.addEventListener('click', () => {
      document.getElementById('productSearch').value = '';
      this.searchPlants('');
    });

    // Botones de acción principales
    document.getElementById('generateQuoteBtn')?.addEventListener('click', () => this.generateQuotation());
    document.getElementById('previewQuoteBtn')?.addEventListener('click', () => this.showFullPreview());
    document.getElementById('clearQuoteBtn')?.addEventListener('click', () => this.clearQuote());
    document.getElementById('exportQuoteBtn')?.addEventListener('click', () => this.exportToPDF());

    // Botones para limpiar y reordenar
    document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAllProducts());
    document.getElementById('reorderBtn')?.addEventListener('click', () => this.reorderProducts());

    // Botones de incremento/decremento para días de vigencia
    document.querySelectorAll('.btn-input-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.closest('.btn-input-action').getAttribute('data-action');
        const input = document.getElementById('validityDays');
        let value = parseInt(input.value) || 10;

        if (action === 'increase' && value < 365) {
          value++;
        } else if (action === 'decrease' && value > 1) {
          value--;
        }

        input.value = value;
        this.updateSummary();
      });
    });

    // Filtros de búsqueda
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.filter-btn').classList.add('active');
        const filter = e.target.closest('.filter-btn').getAttribute('data-filter');
        this.applyFilter(filter);
      });
    });

    // Botón para editar condiciones
    document.getElementById('editConditionsBtn')?.addEventListener('click', () => this.showConditionsModal());
    document.getElementById('addConditionBtn')?.addEventListener('click', () => this.addNewCondition());
    document.getElementById('saveConditionsBtn')?.addEventListener('click', () => this.saveConditions());

    // Botón para editar descuento/IVA/envío
    document.getElementById('editTaxDiscountBtn')?.addEventListener('click', () => this.showTaxDiscountModal());
    document.getElementById('saveTaxDiscountBtn')?.addEventListener('click', () => this.saveTaxDiscount());
    document.getElementById('cancelTaxDiscountBtn')?.addEventListener('click', () => this.hideTaxDiscountModal());
    document.getElementById('discountType')?.addEventListener('change', (e) => this.updateDiscountType(e.target.value));

    // Input de IVA - actualizar en tiempo real
    document.getElementById('taxRate')?.addEventListener('input', (e) => {
      this.taxRate = parseFloat(e.target.value) || 0;
      this.updateTaxDisplay();
    });

    // Cerrar modales
    document.querySelector('.modal-close')?.addEventListener('click', () => this.hideConditionsModal());
    document.querySelector('.modal-close-tax')?.addEventListener('click', () => this.hideTaxDiscountModal());
    document.querySelector('.close-plant-details')?.addEventListener('click', () => this.hidePlantDetailsModal());

    // Modal de detalles de planta
    document.getElementById('cancelPlantDetails')?.addEventListener('click', () => this.hidePlantDetailsModal());
    document.getElementById('savePlantDetails')?.addEventListener('click', () => this.savePlantDetails());

    // Eventos de clic fuera de modales
    document.getElementById('conditionsModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideConditionsModal();
    });

    document.getElementById('taxDiscountModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideTaxDiscountModal();
    });

    document.getElementById('plantDetailsModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hidePlantDetailsModal();
    });

    // Ayuda
    document.getElementById('helpBtn')?.addEventListener('click', () => this.showHelp());

    // Actualizar resumen al cambiar datos
    const updateSummaryElements = ['clientName', 'clientAddress', 'validityDays', 'quoteDate'];
    updateSummaryElements.forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.updateSummary());
    });

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.generateQuotation();
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        this.showFullPreview();
      }
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.active');
        if (modals.length > 0) {
          modals.forEach(modal => modal.classList.remove('active'));
        }
      }
    });
  }

  // MÉTODO MEJORADO: Actualizar contadores
  updateCounters() {
    const totalPlants = this.quoteItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalItems = this.quoteItems.length;

    document.getElementById('totalPlantsCount').textContent = totalPlants;
    document.getElementById('totalItemsCount').textContent = totalItems;
    document.getElementById('totalQuantityBadge').textContent = `${totalPlants} unidades`;
    document.getElementById('previewItemsCount').textContent = `${totalItems} ítems`;

    if (document.getElementById('availableCount')) {
      document.getElementById('availableCount').textContent = this.plants.length;
    }

    if (document.getElementById('lastQuoteNumber')) {
      document.getElementById('lastQuoteNumber').textContent = this.formatQuoteNumber(this.quoteCounter - 1);
    }
  }

  // NUEVO MÉTODO: Actualizar visualización del IVA
  updateTaxDisplay() {
    document.getElementById('currentTaxDisplay').textContent = `${this.taxRate}%`;

    const taxStatusBadge = document.getElementById('taxStatusBadge');
    if (taxStatusBadge) {
      taxStatusBadge.innerHTML = `<i class="fas fa-percentage"></i> IVA: ${this.taxRate}%`;
    }

    document.getElementById('summaryTaxLabel').textContent = `IVA (${this.taxRate}%):`;

    // Actualizar condiciones automáticamente
    const updatedConditions = this.getUpdatedConditions();
    if (this.defaultConditions[1]) {
      this.defaultConditions[1] = updatedConditions[1];
    }

    this.updateSummary();
  }

  loadAvailablePlants() {
    const container = document.getElementById('availableProductsContainer');
    if (!container) return;

    if (this.plants.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-inbox"></i>
          </div>
          <div class="empty-content">
            <h5>No hay plantas disponibles</h5>
            <p>Ve al módulo de plantas para agregar plantas al inventario</p>
            <button class="btn-outline" onclick="window.app.navigateToModule('plantas')">
              <i class="fas fa-external-link-alt"></i> Ir a Módulo de Plantas
            </button>
          </div>
        </div>
      `;
      document.getElementById('availablePlantsCount').textContent = '0 plantas disponibles';
      return;
    }

    const availablePlants = this.plants;

    container.innerHTML = `
      <div class="products-table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nombre Común</th>
              <th>Nombre Científico</th>
              <th>Bolsa</th>
              <th>Altura</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${availablePlants.map((plant, index) => `
              <tr class="product-row" data-id="${plant.id}" title="Haz clic para agregar esta planta">
                <td><strong>${index + 1}</strong></td>
                <td><strong>${plant.commonName || 'Sin nombre común'}</strong></td>
                <td><em>${plant.scientificName || 'Sin nombre científico'}</em></td>
                <td><span class="table-badge secondary">Seleccionar</span></td>
                <td><span class="table-badge secondary">Seleccionar</span></td>
                <td><span class="table-badge secondary">1</span></td>
                <td><span class="table-badge warning">Ingresar</span></td>
                <td><span class="table-badge info">Calcular</span></td>
                <td>
                  <button class="add-product-table-btn" data-id="${plant.id}" title="Agregar a cotización">
                    <i class="fas fa-plus"></i> Agregar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('availablePlantsCount').textContent = `${availablePlants.length} plantas disponibles`;
    document.getElementById('searchResultsCount').textContent = `Mostrando ${availablePlants.length} plantas`;

    // Agregar eventos a los botones de la tabla
    container.querySelectorAll('.add-product-table-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const plantId = e.target.closest('.add-product-table-btn').getAttribute('data-id');
        this.showPlantDetailsModal(plantId);

        // Efecto visual
        const row = e.target.closest('.product-row');
        row.classList.add('selected');
        setTimeout(() => row.classList.remove('selected'), 1000);
      });
    });

    // Hacer las filas clickeables también
    container.querySelectorAll('.product-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (!e.target.closest('.add-product-table-btn')) {
          const plantId = row.getAttribute('data-id');
          this.showPlantDetailsModal(plantId);

          // Efecto visual
          row.classList.add('selected');
          setTimeout(() => row.classList.remove('selected'), 1000);
        }
      });
    });
  }

  applyFilter(filter) {
    // Esta función se puede implementar para filtrar plantas
    // Por ahora solo recarga todas las plantas
    this.loadAvailablePlants();
  }

  clearAllProducts() {
    if (this.quoteItems.length === 0) return;

    if (confirm('¿Estás seguro de que deseas eliminar todas las plantas de la cotización?')) {
      this.quoteItems = [];
      this.updateSelectedProducts();
      this.updateSummary();
      window.app?.showNotification?.('Todas las plantas han sido eliminadas', 'success');
    }
  }

  reorderProducts() {
    // Reordenar alfabéticamente por nombre común
    this.quoteItems.sort((a, b) => a.commonName.localeCompare(b.commonName));
    this.updateSelectedProducts();
    window.app?.showNotification?.('Plantas reordenadas alfabéticamente', 'info');
  }

  exportToPDF() {
    // Esta función se puede implementar para exportar a PDF
    // Por ahora solo muestra un mensaje
    window.app?.showNotification?.('Funcionalidad de exportación PDF en desarrollo', 'info');
  }

  showPlantDetailsModal(plantId) {
    this.currentPlantId = plantId;
    const modal = document.getElementById('plantDetailsModal');
    const plant = this.plants.find(p => p.id == plantId);

    if (!plant) return;

    const content = document.getElementById('plantDetailsContent');
    content.innerHTML = `
      <div class="form-section">
        <div class="form-info-note success" style="margin-bottom: 20px;">
          <i class="fas fa-leaf"></i>
          <div>
            <strong>${plant.commonName}</strong>
            ${plant.scientificName ? `<p><em>${plant.scientificName}</em></p>` : ''}
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group enhanced">
            <label for="plantBagSize" class="form-label">
              <i class="fas fa-shopping-bag"></i>
              <span>Tamaño de Bolsa *</span>
            </label>
            <div class="select-container">
              <select id="plantBagSize" required>
                <option value="">Seleccionar tamaño</option>
                ${this.bagSizes.map(size => `<option value="${size}">${size}</option>`).join('')}
              </select>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="form-hint">Seleccione el tamaño de bolsa para la planta</div>
          </div>
          
          <div class="form-group enhanced">
            <label for="plantHeight" class="form-label">
              <i class="fas fa-ruler-vertical"></i>
              <span>Altura (cm) *</span>
            </label>
            <div class="select-container">
              <select id="plantHeight" required>
                <option value="">Seleccionar altura</option>
                ${this.heightOptions.map(height => `<option value="${height}">${height} cm</option>`).join('')}
              </select>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="form-hint">Seleccione la altura aproximada de la planta</div>
          </div>
          
          <div class="form-group enhanced">
            <label for="plantUnitPrice" class="form-label">
              <i class="fas fa-dollar-sign"></i>
              <span>Precio Unitario ($) *</span>
            </label>
            <div class="input-container">
              <input type="number" id="plantUnitPrice" step="0.01" min="0" required 
                     placeholder="0.00" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1')">
              <div class="input-suffix">$</div>
            </div>
            <div class="form-hint">Precio por unidad de planta</div>
          </div>
          
          <div class="form-group enhanced">
            <label for="plantQuantity" class="form-label">
              <i class="fas fa-hashtag"></i>
              <span>Cantidad *</span>
            </label>
            <div class="input-container">
              <input type="number" id="plantQuantity" value="1" min="1" step="1" required
                     oninput="if(this.value < 1) this.value = 1">
            </div>
            <div class="form-hint">Número de plantas a cotizar</div>
          </div>
        </div>
        
        <div class="price-preview" style="margin-top: 20px; padding: 20px; background: var(--primary-bg); border-radius: var(--border-radius-sm); display: none;" id="pricePreview">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--gray);">Subtotal estimado</div>
              <div style="font-size: 11px; color: var(--gray);">IVA (${this.taxRate}%) no incluido</div>
            </div>
            <strong id="estimatedSubtotal" style="color: var(--secondary-color); font-size: 24px;">$0.00</strong>
          </div>
        </div>
      </div>
    `;

    // Actualizar preview del precio en tiempo real
    const unitPriceInput = document.getElementById('plantUnitPrice');
    const quantityInput = document.getElementById('plantQuantity');
    const pricePreview = document.getElementById('pricePreview');
    const estimatedSubtotal = document.getElementById('estimatedSubtotal');

    const updatePricePreview = () => {
      const unitPrice = parseFloat(unitPriceInput.value) || 0;
      const quantity = parseInt(quantityInput.value) || 1;
      const subtotal = unitPrice * quantity;

      if (unitPrice > 0 && quantity > 0) {
        pricePreview.style.display = 'block';
        estimatedSubtotal.textContent = `$${this.formatNumberWithCommas(subtotal.toFixed(2))}`;
      } else {
        pricePreview.style.display = 'none';
      }
    };

    unitPriceInput.addEventListener('input', updatePricePreview);
    quantityInput.addEventListener('input', updatePricePreview);

    modal.classList.add('active');
    setTimeout(() => document.getElementById('plantBagSize')?.focus(), 100);
  }

  savePlantDetails() {
    const bagSize = document.getElementById('plantBagSize').value;
    const height = document.getElementById('plantHeight').value;
    const unitPrice = parseFloat(document.getElementById('plantUnitPrice').value);
    const quantity = parseInt(document.getElementById('plantQuantity').value);

    if (!bagSize || !height || isNaN(unitPrice) || unitPrice <= 0 || isNaN(quantity) || quantity <= 0) {
      window.app?.showNotification?.('Completa todos los campos requeridos con valores válidos', 'error');

      // Resaltar campos inválidos
      const invalidClass = 'input-error';
      if (!bagSize) document.getElementById('plantBagSize').classList.add(invalidClass);
      if (!height) document.getElementById('plantHeight').classList.add(invalidClass);
      if (isNaN(unitPrice) || unitPrice <= 0) document.getElementById('plantUnitPrice').classList.add(invalidClass);
      if (isNaN(quantity) || quantity <= 0) document.getElementById('plantQuantity').classList.add(invalidClass);

      setTimeout(() => {
        document.querySelectorAll('.' + invalidClass).forEach(el => el.classList.remove(invalidClass));
      }, 2000);

      return;
    }

    const plant = this.plants.find(p => p.id == this.currentPlantId);
    if (!plant) return;

    const subtotal = unitPrice * quantity;

    const newItem = {
      id: plant.id,
      scientificName: plant.scientificName || '',
      commonName: plant.commonName || 'Planta sin nombre',
      bagSize: bagSize,
      height: height,
      unitPrice: unitPrice,
      quantity: quantity,
      subtotal: subtotal,
      type: 'plantas'
    };

    // Verificar si ya está en la cotización
    const existingItem = this.quoteItems.find(item =>
      item.id === plant.id &&
      item.bagSize === bagSize &&
      item.height === height
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.unitPrice * existingItem.quantity;
      window.app?.showNotification?.(`Cantidad actualizada para "${plant.commonName}"`, 'success');
    } else {
      this.quoteItems.push(newItem);
      window.app?.showNotification?.(`"${plant.commonName}" agregada a la cotización`, 'success');
    }

    this.hidePlantDetailsModal();
    this.updateSelectedProducts();
    this.updateSummary();
  }

  updateSelectedProducts() {
    const container = document.getElementById('selectedProductsList');
    const selectedCount = document.getElementById('selectedCount');

    if (!container) return;

    const totalItems = this.quoteItems.length;
    const totalPlants = this.quoteItems.reduce((sum, item) => sum + item.quantity, 0);

    selectedCount.textContent = `${totalItems} seleccionadas`;
    this.updateCounters();

    if (this.quoteItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-cart-plus"></i>
          </div>
          <div class="empty-content">
            <h5>Carrito de plantas vacío</h5>
            <p>Busca y selecciona plantas del inventario para agregarlas a la cotización</p>
            <button class="btn-outline" onclick="document.getElementById('productSearch').focus()">
              <i class="fas fa-search"></i> Buscar plantas
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.quoteItems.map(item => `
      <div class="selected-product-item" data-id="${item.id}">
        <div class="product-info">
          <h6>${item.commonName}</h6>
          <small><em>${item.scientificName}</em></small>
          <div class="plant-details">
            <small><i class="fas fa-shopping-bag"></i> ${item.bagSize} | 
                   <i class="fas fa-ruler-vertical"></i> ${item.height} cm | 
                   <i class="fas fa-dollar-sign"></i> ${this.formatNumberWithCommas(item.unitPrice.toFixed(2))} c/u</small>
          </div>
        </div>
        <div class="product-controls">
          <div class="quantity-controls">
            <button class="btn-icon-sm decrease-qty" data-id="${item.id}" title="Reducir cantidad">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" 
                   class="quantity-input" 
                   value="${item.quantity}" 
                   min="1" 
                   step="1"
                   data-id="${item.id}"
                   title="Cantidad en plantas">
            <button class="btn-icon-sm increase-qty" data-id="${item.id}" title="Aumentar cantidad">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div style="font-weight: bold; color: var(--secondary-color); min-width: 100px; text-align: right; font-size: 16px;">
            $${this.formatNumberWithCommas(item.subtotal.toFixed(2))}
          </div>
          <button class="btn-icon-sm remove remove-product" data-id="${item.id}" title="Eliminar de la cotización">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Agregar eventos para los botones de incremento/decremento
    container.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const plantId = e.target.closest('.decrease-qty').getAttribute('data-id');
        const item = this.quoteItems.find(item => item.id === plantId);
        if (item && item.quantity > 1) {
          this.updateProductQuantity(plantId, item.quantity - 1);
        }
      });
    });

    container.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const plantId = e.target.closest('.increase-qty').getAttribute('data-id');
        const item = this.quoteItems.find(item => item.id === plantId);
        if (item) {
          this.updateProductQuantity(plantId, item.quantity + 1);
        }
      });
    });

    // Agregar eventos para los inputs de cantidad
    container.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const plantId = e.target.getAttribute('data-id');
        const newQuantity = parseInt(e.target.value);
        const item = this.quoteItems.find(item => item.id === plantId);

        if (isNaN(newQuantity) || newQuantity <= 0) {
          e.target.value = item.quantity;
          return;
        }

        this.updateProductQuantity(plantId, newQuantity);
      });
    });

    // Agregar eventos para el botón de eliminar
    container.querySelectorAll('.remove-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const plantId = e.target.closest('.remove-product').getAttribute('data-id');
        this.removeProductFromQuote(plantId);
      });
    });
  }

  updateSummary() {
    // Actualizar información básica
    const clientName = document.getElementById('clientName')?.value || '';
    const clientAddress = document.getElementById('clientAddress')?.value || '';
    const quoteDate = document.getElementById('quoteDate')?.value;
    const validityDays = parseInt(document.getElementById('validityDays')?.value) || 10;

    document.getElementById('summaryClientName').textContent = clientName || '-';
    document.getElementById('summaryDate').textContent = this.formatDateForDisplay(quoteDate);
    document.getElementById('summaryShipping').textContent = `$${this.formatNumberWithCommas(this.shippingCost.toFixed(2))}`;

    if (quoteDate) {
      const validUntil = new Date(quoteDate);
      validUntil.setDate(validUntil.getDate() + validityDays);
      document.getElementById('summaryValidUntil').textContent = this.formatDateForDisplay(validUntil.toISOString());
    }

    // Actualizar condiciones en el resumen
    const conditionsSummary = document.getElementById('conditionsSummary');
    if (conditionsSummary) {
      conditionsSummary.innerHTML = `
        <div class="condition-item">
          <i class="fas fa-check-circle"></i>
          <span>IVA: ${this.taxRate}% | Vigencia: ${validityDays} días | Envío: $${this.formatNumberWithCommas(this.shippingCost.toFixed(2))}</span>
        </div>
      `;
    }

    // Actualizar tabla de plantas
    const table = document.getElementById('productsSummaryTable');
    if (this.quoteItems.length === 0) {
      table.innerHTML = `
        <div class="no-items-preview">
          <i class="fas fa-seedling"></i>
          <p>No hay plantas en la cotización</p>
          <small>Agrega plantas desde el panel izquierdo</small>
        </div>
      `;
      this.updateTotalsDisplay();
      return;
    }

    table.innerHTML = this.quoteItems.map(item => `
      <div class="product-summary-item">
        <div>
          <strong>${item.commonName}</strong>
          ${item.scientificName ? `<br><small><em>${item.scientificName}</em></small>` : ''}
          <br><small class="plant-details">${item.bagSize} | ${item.height} cm</small>
          <br><small>${this.formatNumberWithCommas(item.quantity)} × $${this.formatNumberWithCommas(item.unitPrice.toFixed(2))}</small>
        </div>
        <strong style="color: var(--secondary-color); font-size: 16px;">$${this.formatNumberWithCommas(item.subtotal.toFixed(2))}</strong>
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
    const taxAmount = taxableAmount * (this.taxRate / 100); // IVA calculado dinámicamente
    const total = taxableAmount + taxAmount + this.shippingCost;

    return { subtotal, discount, taxAmount, shippingCost: this.shippingCost, total };
  }

  updateTotalsDisplay() {
    const totals = this.calculateTotals();
    document.getElementById('summarySubtotal').textContent = `$${this.formatNumberWithCommas(totals.subtotal.toFixed(2))}`;

    // Mostrar/ocultar fila de descuento
    const discountRow = document.getElementById('discountRow');
    if (totals.discount > 0) {
      discountRow.style.display = 'flex';
      document.getElementById('summaryDiscountLabel').textContent = this.discountType === 'percentage'
        ? `Descuento (${this.discountValue}%):`
        : 'Descuento:';
      document.getElementById('summaryDiscount').textContent = `-$${this.formatNumberWithCommas(totals.discount.toFixed(2))}`;
    } else {
      discountRow.style.display = 'none';
    }

    // Mostrar/ocultar fila de envío
    const shippingRow = document.getElementById('shippingRow');
    if (this.shippingCost > 0) {
      shippingRow.style.display = 'flex';
      document.getElementById('summaryShippingCost').textContent = `$${this.formatNumberWithCommas(totals.shippingCost.toFixed(2))}`;
    } else {
      shippingRow.style.display = 'none';
    }

    document.getElementById('summaryTax').textContent = `$${this.formatNumberWithCommas(totals.taxAmount.toFixed(2))}`;
    document.getElementById('summaryTotal').textContent = `$${this.formatNumberWithCommas(totals.total.toFixed(2))}`;
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

  saveTaxDiscount() {
    const newTaxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const newDiscountType = document.getElementById('discountType').value;
    const newDiscountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const newShippingCost = parseFloat(document.getElementById('modalShippingCost').value) || 0;

    // Actualizar IVA
    this.taxRate = newTaxRate;

    // Actualizar condiciones con nuevo IVA
    const validityDays = parseInt(document.getElementById('validityDays')?.value) || 10;
    if (this.defaultConditions[1]) {
      this.defaultConditions[1] = `Para la facturación: es necesario que envíe el CIF (cédula de identificación fiscal). En el caso del IVA por ser únicamente plantas, la tasa es ${this.taxRate}%`;
    }

    this.discountType = newDiscountType;
    this.discountValue = newDiscountValue;
    this.shippingCost = newShippingCost;

    this.hideTaxDiscountModal();
    this.updateTaxDisplay();
    this.updateSummary();

    window.app?.showNotification?.(`Configuración actualizada. IVA: ${this.taxRate}%`, 'success');
  }

  showConditionsModal() {
    const modal = document.getElementById('conditionsModal');
    const conditionsList = document.getElementById('conditionsList');

    conditionsList.innerHTML = this.defaultConditions.map((condition, index) => `
      <div class="condition-item">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <strong style="color: var(--primary-color); font-size: 13px;">Condición ${index + 1}</strong>
          ${index !== 1 ? `<button class="btn-icon-sm remove remove-condition" data-index="${index}" title="Eliminar condición">
            <i class="fas fa-trash"></i>
          </button>` : ''}
        </div>
        <textarea class="condition-text" data-index="${index}" rows="3">${condition}</textarea>
      </div>
    `).join('');

    // Agregar eventos para eliminar condiciones
    conditionsList.querySelectorAll('.remove-condition').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.remove-condition').getAttribute('data-index'));
        this.removeCondition(index);
      });
    });

    // Actualizar condiciones en tiempo real
    conditionsList.querySelectorAll('.condition-text').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.defaultConditions[index] = e.target.value;
      });
    });

    modal.classList.add('active');
  }

  hideConditionsModal() {
    document.getElementById('conditionsModal').classList.remove('active');
    this.updateSummary();
  }

  hideTaxDiscountModal() {
    document.getElementById('taxDiscountModal').classList.remove('active');
  }

  hidePlantDetailsModal() {
    document.getElementById('plantDetailsModal').classList.remove('active');
    this.currentPlantId = null;
  }

  addNewCondition() {
    this.defaultConditions.push("Nueva condición - edite este texto");
    this.showConditionsModal();
  }

  saveConditions() {
    this.hideConditionsModal();
    window.app?.showNotification?.('Condiciones guardadas correctamente', 'success');
  }

  updateDiscountType(type) {
    const container = document.getElementById('discountValueContainer');
    const helper = document.getElementById('discountHelper');

    if (type === 'none') {
      container.style.display = 'none';
      document.getElementById('discountValue').value = 0;
    } else {
      container.style.display = 'block';
      helper.textContent = type === 'percentage' ? '%' : '$';
    }
  }

  // MÉTODOS DE PRODUCTOS
  updateProductQuantity(plantId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;

    const item = this.quoteItems.find(item => item.id === plantId);
    if (item) {
      item.quantity = newQuantity;
      item.subtotal = item.unitPrice * newQuantity;
      this.updateSelectedProducts();
      this.updateSummary();
    }
  }

  removeProductFromQuote(plantId) {
    const index = this.quoteItems.findIndex(item => item.id === plantId);
    if (index !== -1) {
      const removedItem = this.quoteItems.splice(index, 1)[0];
      window.app?.showNotification?.(`"${removedItem.commonName}" eliminada de la cotización`, 'info');
      this.updateSelectedProducts();
      this.updateSummary();
    }
  }

  searchPlants(searchTerm) {
    const container = document.getElementById('availableProductsContainer');
    if (!container) return;

    if (!searchTerm.trim()) {
      this.loadAvailablePlants();
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filteredPlants = this.plants.filter(plant => {
      return (
        (plant.commonName?.toLowerCase().includes(searchLower)) ||
        (plant.scientificName?.toLowerCase().includes(searchLower)) ||
        (plant.id?.toString().includes(searchLower))
      );
    });

    if (filteredPlants.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <div class="empty-content">
            <h5>No se encontraron plantas</h5>
            <p>Intenta con otro término de búsqueda</p>
          </div>
        </div>
      `;
      document.getElementById('availablePlantsCount').textContent = '0 plantas encontradas';
      document.getElementById('searchResultsCount').textContent = '0 plantas encontradas';
      return;
    }

    container.innerHTML = `
      <div class="products-table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nombre Común</th>
              <th>Nombre Científico</th>
              <th>Bolsa</th>
              <th>Altura</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPlants.map((plant, index) => `
              <tr class="product-row" data-id="${plant.id}">
                <td><strong>${index + 1}</strong></td>
                <td><strong>${plant.commonName || 'Sin nombre común'}</strong></td>
                <td><em>${plant.scientificName || 'Sin nombre científico'}</em></td>
                <td><span class="table-badge secondary">Seleccionar</span></td>
                <td><span class="table-badge secondary">Seleccionar</span></td>
                <td><span class="table-badge secondary">1</span></td>
                <td><span class="table-badge warning">Ingresar</span></td>
                <td><span class="table-badge info">Calcular</span></td>
                <td>
                  <button class="add-product-table-btn" data-id="${plant.id}">
                    <i class="fas fa-plus"></i> Agregar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('availablePlantsCount').textContent = `${filteredPlants.length} plantas encontradas`;
    document.getElementById('searchResultsCount').textContent = `Mostrando ${filteredPlants.length} plantas`;

    // Agregar eventos a los botones de la tabla
    container.querySelectorAll('.add-product-table-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const plantId = e.target.closest('.add-product-table-btn').getAttribute('data-id');
        this.showPlantDetailsModal(plantId);
      });
    });

    // Hacer las filas clickeables también
    container.querySelectorAll('.product-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (!e.target.closest('.add-product-table-btn')) {
          const plantId = row.getAttribute('data-id');
          this.showPlantDetailsModal(plantId);
        }
      });
    });
  }

  // MÉTODOS DE COTIZACIÓN
  generateQuotation() {
    const clientName = document.getElementById('clientName')?.value.trim();
    const quoteDate = document.getElementById('quoteDate')?.value;

    if (!clientName || !quoteDate) {
      window.app?.showNotification?.('Completa los campos requeridos: Cliente y Fecha', 'error');
      return;
    }

    if (this.quoteItems.length === 0) {
      window.app?.showNotification?.('Agrega al menos una planta a la cotización', 'error');
      return;
    }

    const totals = this.calculateTotals();
    const validityDays = parseInt(document.getElementById('validityDays')?.value) || 10;

    const quotation = {
      id: Date.now(),
      quoteNumber: this.formatQuoteNumber(this.quoteCounter),
      clientName: clientName,
      clientAddress: document.getElementById('clientAddress')?.value || '',
      date: quoteDate,
      validityDays: validityDays,
      items: [...this.quoteItems],
      conditions: this.getUpdatedConditions(),
      financial: {
        subtotal: totals.subtotal,
        discountAmount: totals.discount,
        taxAmount: totals.taxAmount,
        shippingCost: totals.shippingCost,
        total: totals.total,
        taxRate: this.taxRate,
        discountType: this.discountType,
        discountValue: this.discountValue
      },
      companyInfo: this.companyInfo,
      signatures: this.signatures,
      type: 'plantas',
      createdAt: new Date().toISOString()
    };

    // Guardar en localStorage
    this.quotations.push(quotation);
    localStorage.setItem('mexicoprimero_cotizaciones', JSON.stringify(this.quotations));

    // Incrementar contador para la próxima cotización
    this.quoteCounter++;
    this.updateQuoteCounterBadge();

    // Mostrar notificación de éxito
    window.app?.showNotification?.(`Cotización ${this.formatQuoteNumber(this.quoteCounter - 1)} guardada exitosamente`, 'success');

    // Opcional: Limpiar formulario o mostrar vista previa
    this.showFullPreview(quotation);
  }

  showFullPreview(quoteData = null) {
    if (!quoteData) {
      const clientName = document.getElementById('clientName')?.value;
      const quoteDate = document.getElementById('quoteDate')?.value;

      if (!clientName || !quoteDate) {
        window.app?.showNotification?.('Completa los campos requeridos: Cliente y Fecha', 'error');
        return;
      }

      if (this.quoteItems.length === 0) {
        window.app?.showNotification?.('Agrega al menos una planta a la cotización', 'error');
        return;
      }

      const totals = this.calculateTotals();
      const validityDays = parseInt(document.getElementById('validityDays')?.value) || 10;

      quoteData = {
        quoteNumber: this.formatQuoteNumber(this.quoteCounter),
        clientName: clientName,
        clientAddress: document.getElementById('clientAddress')?.value || '',
        date: quoteDate,
        validityDays: validityDays,
        items: [...this.quoteItems],
        conditions: this.getUpdatedConditions(),
        financial: {
          subtotal: totals.subtotal,
          discountAmount: totals.discount,
          taxAmount: totals.taxAmount,
          shippingCost: totals.shippingCost,
          total: totals.total
        },
        companyInfo: this.companyInfo,
        signatures: this.signatures,
        type: 'plantas'
      };
    }

    const printHTML = this.getPrintHTML(quoteData);

    // Abrir ventana de impresión/vista previa
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Opcional: Auto-imprimir después de un breve retraso
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  getPrintHTML(quoteData) {
    const itemsHTML = quoteData.items?.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.commonName || 'Planta'}</strong></td>
        <td><em>${item.scientificName || '-'}</em></td>
        <td>${item.bagSize || '-'}</td>
        <td>${item.height || '-'} cm</td>
        <td>${this.formatNumberWithCommas(item.quantity || 1)} plantas</td>
        <td>$${this.formatNumberWithCommas((item.unitPrice || 0).toFixed(2))}</td>
        <td><strong>$${this.formatNumberWithCommas((item.subtotal || 0).toFixed(2))}</strong></td>
      </tr>
    `).join('') || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">No hay plantas en la cotización</td></tr>';

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
    const shippingCost = financial.shippingCost || 0;
    const total = financial.total || 0;

    let discountText = '';
    if (financial.discountType === 'fixed' && discountAmount > 0) {
      discountText = `Descuento: $${this.formatNumberWithCommas(discountAmount.toFixed(2))}`;
    } else if (financial.discountType === 'percentage' && discountAmount > 0) {
      discountText = `Descuento (${financial.discountValue}%): $${this.formatNumberWithCommas(discountAmount.toFixed(2))}`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vista Previa - Cotización ${quoteData.quoteNumber}</title>
        <style>${this.getPrintStyles()}</style>
      </head>
      <body>
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
              <div class="print-quote-title-section">COTIZACIÓN DE PLANTAS</div>
            </div>
            
            <div class="print-quote-details-row">
              <div class="print-folio-section" style="color: #ff0000; font-size: 14px; font-weight: bold;">
                COTIZACIÓN No. ${quoteData.quoteNumber}
              </div>
              <div class="print-date-section">
                ${this.formatDocumentDate(quoteData.date)}
              </div>
              <div class="print-cot-section">
                Válido hasta: <span class="print-dynamic-field">${this.formatDate(this.calculateValidUntil(quoteData.date, quoteData.validityDays))}</span>
              </div>
            </div>
            
            <div class="print-client-info">
              <strong>CLIENTE:</strong> <span class="print-dynamic-field">${quoteData.clientName}</span>
              ${quoteData.clientAddress ? `<br><strong>DIRECCIÓN:</strong> <span class="print-dynamic-field">${quoteData.clientAddress}</span>` : ''}
            </div>
            
            <div class="print-intro-text">
              De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:
            </div>
          </div>

          <table class="print-products-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre Común</th>
                <th>Nombre Científico</th>
                <th>Tamaño de Bolsa</th>
                <th>Altura</th>
                <th>Cantidad<br>(plantas)</th>
                <th>Precio<br>Unitario</th>
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
              <span>IVA (${financial.taxRate || this.taxRate || 0}%):</span>
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
      </body>
      </html>
    `;
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
      
      /* TABLA DE PRODUCTOS CON 8 COLUMNAS - MODIFICADO PARA PLANTAS */
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
      .print-products-table th:nth-child(2) { width: 20%; } /* Nombre Común */
      .print-products-table th:nth-child(3) { width: 20%; } /* Nombre Científico */
      .print-products-table th:nth-child(4) { width: 12%; } /* Tamaño de Bolsa */
      .print-products-table th:nth-child(5) { width: 10%; } /* Altura */
      .print-products-table th:nth-child(6) { width: 10%; } /* Cantidad */
      .print-products-table th:nth-child(7) { width: 10%; } /* Precio Unitario */
      .print-products-table th:nth-child(8) { width: 14%; } /* Subtotal */
      
      /* Ajuste para columnas con precios */
      .print-products-table td:nth-child(6),
      .print-products-table td:nth-child(7),
      .print-products-table td:nth-child(8) {
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

  formatDocumentDate(dateString) {
    if (!dateString) return 'Mérida, Yucatán, a [Fecha no especificada]';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Mérida, Yucatán, a [Fecha inválida]';

      const day = date.getDate();
      const month = date.toLocaleString('es-ES', { month: 'long' });
      const year = date.getFullYear();

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

  calculateValidUntil(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  clearQuote() {
    if (confirm('¿Estás seguro de que deseas limpiar toda la cotización actual? Esta acción no se puede deshacer.')) {
      this.quoteItems = [];
      document.getElementById('clientName').value = '';
      document.getElementById('clientAddress').value = '';
      document.getElementById('validityDays').value = '10';

      this.updateQuoteDate();
      this.updateSelectedProducts();
      this.updateSummary();
      this.loadAvailablePlants();

      window.app?.showNotification?.('Cotización limpiada correctamente', 'success');
    }
  }

  removeCondition(index) {
    // No permitir eliminar la condición del IVA (índice 1)
    if (index === 1) {
      window.app?.showNotification?.('La condición del IVA no puede ser eliminada', 'warning');
      return;
    }

    if (this.defaultConditions.length > 1) {
      this.defaultConditions.splice(index, 1);
      this.showConditionsModal();
    } else {
      window.app?.showNotification?.('Debe haber al menos una condición', 'warning');
    }
  }

  showHelp() {
    window.app?.showNotification?.(`
      <strong>Atajos de teclado:</strong><br>
      • Ctrl+S: Guardar cotización<br>
      • Ctrl+P: Vista previa<br>
      • Escape: Cerrar modales<br><br>
      <strong>Funciones principales:</strong><br>
      • Haz clic en cualquier planta para agregarla<br>
      • Usa los filtros para encontrar plantas específicas<br>
      • Configura IVA y descuentos en el botón de configuración
    `, 'info', 10000);
  }
}

// Exportar para el sistema principal
window.PlantQuotationManager = PlantQuotationManager;

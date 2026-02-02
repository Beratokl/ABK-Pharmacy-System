// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        window.location.href = '/login';
    }
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        showSection(section);
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    // Load data for the section
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'receiving':
            loadReceiving();
            break;
        case 'sales':
            loadSales();
            break;
        case 'scanner':
            loadScanner();
            break;
        case 'personnel':
            loadPersonnel();
            break;
    }
}

// API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// Dashboard
async function loadDashboard() {
    const [inventory, alerts, salesSummary] = await Promise.all([
        apiCall('/inventory'),
        apiCall('/alerts'),
        apiCall('/sales/summary')
    ]);
    
    document.getElementById('total-items').textContent = inventory.length;
    document.getElementById('daily-revenue').textContent = `$${salesSummary.total_revenue || 0}`;
    
    const lowStock = alerts.filter(a => a.alert_type === 'low_stock');
    const expiring = alerts.filter(a => a.alert_type === 'expiring');
    
    document.getElementById('low-stock-count').textContent = lowStock.length;
    document.getElementById('expiring-count').textContent = expiring.length;
    
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = alerts.slice(0, 5).map(alert => `
        <div class="alert-item ${alert.quantity === 0 ? 'critical' : ''}">
            <strong>${alert.name}</strong> - 
            ${alert.alert_type === 'low_stock' ? `Low stock: ${alert.quantity} remaining` : `Expires: ${alert.expiry_date}`}
        </div>
    `).join('');
}

// Inventory
async function loadInventory() {
    const items = await apiCall('/inventory');
    const table = document.getElementById('inventory-table');
    
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Supplier</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.category || '-'}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.unit_price || 0}</td>
                        <td>${item.supplier || '-'}</td>
                        <td>${item.expiry_date || '-'}</td>
                        <td>
                            <button onclick="editItem(${item.id})">Edit</button>
                            <button onclick="deleteItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddItemForm() {
    showModal(`
        <h3>Add New Item</h3>
        <form onsubmit="addItem(event)">
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Category:</label>
                <input type="text" name="category">
            </div>
            <div class="form-group">
                <label>Quantity:</label>
                <input type="number" name="quantity" value="0">
            </div>
            <div class="form-group">
                <label>Unit Price:</label>
                <input type="number" step="0.01" name="unit_price">
            </div>
            <div class="form-group">
                <label>Supplier:</label>
                <input type="text" name="supplier">
            </div>
            <div class="form-group">
                <label>Expiry Date:</label>
                <input type="date" name="expiry_date">
            </div>
            <div class="form-group">
                <label>Reorder Level:</label>
                <input type="number" name="reorder_level" value="10">
            </div>
            <button type="submit" class="btn-primary">Add Item</button>
        </form>
    `);
}

async function addItem(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    await apiCall('/inventory', 'POST', data);
    hideModal();
    loadInventory();
}

async function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        await apiCall(`/inventory/${id}`, 'DELETE');
        loadInventory();
    }
}

async function loadSales() {
    try {
        const sales = await apiCall('/sales');
        const table = document.getElementById('sales-table');
        
        if (!sales || sales.length === 0) {
            table.innerHTML = '<p>No sales records found.</p>';
            return;
        }
        
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Customer</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales.map(sale => `
                        <tr>
                            <td>${sale.item_name}</td>
                            <td>${sale.quantity}</td>
                            <td>$${sale.unit_price}</td>
                            <td>$${sale.total_amount}</td>
                            <td>${sale.customer_name || '-'}</td>
                            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading sales:', error);
        document.getElementById('sales-table').innerHTML = '<p>Error loading sales data.</p>';
    }
}

async function showSaleForm() {
    const items = await apiCall('/inventory');
    showModal(`
        <h3>Record Sale</h3>
        <form onsubmit="recordSale(event)">
            <div class="form-group">
                <label>Item:</label>
                <select name="item_id" required onchange="updateSalePrice(this)">
                    <option value="">Select Item</option>
                    ${items.map(item => `<option value="${item.id}" data-price="${item.unit_price}" data-stock="${item.quantity}">${item.name} (Stock: ${item.quantity})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantity:</label>
                <input type="number" name="quantity" required min="1" onchange="calculateTotal()">
            </div>
            <div class="form-group">
                <label>Unit Price:</label>
                <input type="number" step="0.01" name="unit_price" required onchange="calculateTotal()">
            </div>
            <div class="form-group">
                <label>Total Amount:</label>
                <input type="number" step="0.01" name="total_amount" readonly>
            </div>
            <div class="form-group">
                <label>Customer Name:</label>
                <input type="text" name="customer_name">
            </div>
            <button type="submit" class="btn-primary">Record Sale</button>
        </form>
    `);
}

function updateSalePrice(select) {
    const option = select.selectedOptions[0];
    if (option) {
        document.querySelector('input[name="unit_price"]').value = option.dataset.price || '';
        calculateTotal();
    }
}

function calculateTotal() {
    const quantity = document.querySelector('input[name="quantity"]').value;
    const unitPrice = document.querySelector('input[name="unit_price"]').value;
    const total = quantity * unitPrice;
    document.querySelector('input[name="total_amount"]').value = total.toFixed(2);
}

async function recordSale(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Sale recording failed');
        }
        
        const result = await response.json();
        alert(`Sale recorded! Total: $${result.total_amount}`);
        hideModal();
        loadSales();
        loadDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Receiving
async function loadReceiving() {
    const records = await apiCall('/receiving');
    const table = document.getElementById('receiving-table');
    
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Supplier</th>
                    <th>Date Received</th>
                </tr>
            </thead>
            <tbody>
                ${records.map(record => `
                    <tr>
                        <td>${record.item_name}</td>
                        <td>${record.quantity}</td>
                        <td>${record.supplier || '-'}</td>
                        <td>${new Date(record.received_date).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function showReceivingForm() {
    const items = await apiCall('/inventory');
    showModal(`
        <h3>Record Receiving</h3>
        <form onsubmit="addReceiving(event)">
            <div class="form-group">
                <label>Item:</label>
                <select name="item_id" required>
                    <option value="">Select Item</option>
                    ${items.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantity Received:</label>
                <input type="number" name="quantity" required min="1">
            </div>
            <div class="form-group">
                <label>Supplier:</label>
                <input type="text" name="supplier">
            </div>
            <button type="submit" class="btn-primary">Record Receiving</button>
        </form>
    `);
}

async function addReceiving(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    await apiCall('/receiving', 'POST', data);
    hideModal();
    loadReceiving();
}

// Reports
async function loadReports() {
    // Set up report tabs
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadReportData(tab.dataset.report);
        });
    });
    
    // Load default report
    loadReportData('summary');
}

async function loadReportData(reportType) {
    const content = document.getElementById('report-content');
    content.innerHTML = '<p>Loading...</p>';
    
    try {
        switch(reportType) {
            case 'summary':
                await loadSummaryReport(content);
                break;
            case 'sales':
                await loadSalesReport(content);
                break;
            case 'top-items':
                await loadTopItemsReport(content);
                break;
            case 'inventory':
                await loadInventoryReport(content);
                break;
            case 'profit':
                await loadProfitReport(content);
                break;
        }
    } catch (error) {
        console.error('Report error:', error);
        content.innerHTML = `<p>Error loading report: ${error.message}</p>`;
    }
}

async function loadSummaryReport(content) {
    try {
        const summary = await apiCall('/reports/summary');
        content.innerHTML = `
            <div class="report-grid">
                <div class="report-card">
                    <h3>Total Items</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #3498db;">${summary.total_items || 0}</div>
                </div>
                <div class="report-card">
                    <h3>Inventory Value</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #27ae60;">$${(summary.inventory_value || 0).toFixed(2)}</div>
                </div>
                <div class="report-card">
                    <h3>Total Sales</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #f39c12;">${summary.total_sales || 0}</div>
                </div>
                <div class="report-card">
                    <h3>Total Revenue</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;">$${(summary.total_revenue || 0).toFixed(2)}</div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<p>Error loading summary report</p>';
    }
}

async function loadSalesReport(content) {
    const [daily, weekly, monthly] = await Promise.all([
        apiCall('/reports/sales/daily'),
        apiCall('/reports/sales/weekly'),
        apiCall('/reports/sales/monthly')
    ]);
    
    content.innerHTML = `
        <div class="report-grid">
            <div class="report-card">
                <h3>Today's Sales</h3>
                <p>Transactions: ${daily[0]?.transactions || 0}</p>
                <p>Revenue: $${daily[0]?.revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div class="report-card">
                <h3>This Week</h3>
                <p>Transactions: ${weekly.reduce((sum, day) => sum + day.transactions, 0)}</p>
                <p>Revenue: $${weekly.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}</p>
            </div>
            <div class="report-card">
                <h3>This Month</h3>
                <p>Transactions: ${monthly.reduce((sum, day) => sum + day.transactions, 0)}</p>
                <p>Revenue: $${monthly.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}</p>
            </div>
        </div>
        <div class="chart-container">
            <h3>Weekly Sales Trend</h3>
            <table>
                <thead>
                    <tr><th>Date</th><th>Transactions</th><th>Items Sold</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                    ${weekly.map(day => `
                        <tr>
                            <td>${day.date}</td>
                            <td>${day.transactions}</td>
                            <td>${day.items_sold}</td>
                            <td>$${day.revenue.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadTopItemsReport(content) {
    try {
        const topItems = await apiCall('/reports/top-items/10');
        if (!topItems || topItems.length === 0) {
            content.innerHTML = '<p>No sales data available for top items report.</p>';
            return;
        }
        content.innerHTML = `
            <div class="chart-container">
                <h3>Top 10 Selling Items</h3>
                <table>
                    <thead>
                        <tr><th>Rank</th><th>Item</th><th>Category</th><th>Units Sold</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>
                        ${topItems.map((item, index) => `
                            <tr>
                                <td><strong>#${index + 1}</strong></td>
                                <td>${item.name}</td>
                                <td>${item.category || '-'}</td>
                                <td>${item.total_sold}</td>
                                <td>$${(item.total_revenue || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<p>Error loading top items report</p>';
    }
}

async function loadInventoryReport(content) {
    const inventory = await apiCall('/reports/inventory-status');
    content.innerHTML = `
        <div class="chart-container">
            <h3>Inventory Status by Category</h3>
            <table>
                <thead>
                    <tr><th>Category</th><th>Total Items</th><th>Stock Quantity</th><th>Stock Value</th><th>Low Stock Items</th></tr>
                </thead>
                <tbody>
                    ${inventory.map(cat => `
                        <tr>
                            <td><strong>${cat.category}</strong></td>
                            <td>${cat.total_items}</td>
                            <td>${cat.total_stock}</td>
                            <td>$${cat.stock_value?.toFixed(2) || '0.00'}</td>
                            <td style="color: ${cat.low_stock_items > 0 ? '#e74c3c' : '#27ae60'}">${cat.low_stock_items}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadProfitReport(content) {
    const profit = await apiCall('/reports/profit-analysis');
    content.innerHTML = `
        <div class="chart-container">
            <h3>Profit Analysis</h3>
            <table>
                <thead>
                    <tr><th>Item</th><th>Cost Price</th><th>Avg Selling Price</th><th>Profit/Unit</th><th>Units Sold</th><th>Total Profit</th></tr>
                </thead>
                <tbody>
                    ${profit.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>$${item.cost_price?.toFixed(2) || '0.00'}</td>
                            <td>$${item.avg_selling_price?.toFixed(2) || '0.00'}</td>
                            <td style="color: ${item.profit_per_unit > 0 ? '#27ae60' : '#e74c3c'}">$${item.profit_per_unit?.toFixed(2) || '0.00'}</td>
                            <td>${item.units_sold}</td>
                            <td style="color: ${item.total_profit > 0 ? '#27ae60' : '#e74c3c'}">$${item.total_profit?.toFixed(2) || '0.00'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Barcode Scanner
function loadScanner() {
    document.getElementById('barcode-input').focus();
    
    // Auto-scan on Enter key
    document.getElementById('barcode-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            scanBarcode();
        }
    });
}

async function scanBarcode() {
    const barcode = document.getElementById('barcode-input').value.trim();
    const resultDiv = document.getElementById('scan-result');
    
    if (!barcode) {
        resultDiv.innerHTML = '<p>Please enter a barcode</p>';
        return;
    }
    
    resultDiv.innerHTML = '<p>Scanning...</p>';
    
    try {
        const response = await fetch(`/api/barcode/scan/${barcode}`);
        
        if (response.ok) {
            const item = await response.json();
            displayScannedItem(item);
        } else {
            resultDiv.innerHTML = `
                <div class="item-card">
                    <h3>❌ Item Not Found</h3>
                    <p>Barcode: <strong>${barcode}</strong></p>
                    <p>This item is not in the inventory.</p>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = '<p>Error scanning barcode</p>';
    }
    
    // Clear input for next scan
    document.getElementById('barcode-input').value = '';
    document.getElementById('barcode-input').focus();
}

function displayScannedItem(item) {
    const resultDiv = document.getElementById('scan-result');
    const stockStatus = item.quantity <= item.reorder_level ? '🔴 Low Stock' : '✅ In Stock';
    const stockColor = item.quantity <= item.reorder_level ? '#e74c3c' : '#27ae60';
    
    resultDiv.innerHTML = `
        <div class="item-card">
            <h3>📦 ${item.name}</h3>
            <div class="item-details">
                <div class="detail-item">
                    <span>Barcode:</span>
                    <strong>${item.barcode}</strong>
                </div>
                <div class="detail-item">
                    <span>Category:</span>
                    <span>${item.category || '-'}</span>
                </div>
                <div class="detail-item">
                    <span>Stock:</span>
                    <span style="color: ${stockColor}">${item.quantity} units</span>
                </div>
                <div class="detail-item">
                    <span>Price:</span>
                    <span>$${item.unit_price || '0.00'}</span>
                </div>
                <div class="detail-item">
                    <span>Supplier:</span>
                    <span>${item.supplier || '-'}</span>
                </div>
                <div class="detail-item">
                    <span>Expiry:</span>
                    <span>${item.expiry_date || '-'}</span>
                </div>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                <span style="color: ${stockColor}; font-weight: bold;">${stockStatus}</span>
            </div>
            <div style="margin-top: 1rem;">
                <button onclick="quickSale(${item.id}, '${item.name}', ${item.unit_price})" class="btn-primary">Quick Sale</button>
            </div>
        </div>
    `;
}

function quickSale(itemId, itemName, unitPrice) {
    const quantity = prompt(`Quick Sale: ${itemName}\nEnter quantity:`, '1');
    if (!quantity || quantity <= 0) return;
    
    const customerName = prompt('Customer name (optional):', '');
    
    // Record the sale
    fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            item_id: itemId,
            quantity: parseInt(quantity),
            unit_price: unitPrice,
            customer_name: customerName
        })
    }).then(response => response.json())
    .then(data => {
        if (data.message) {
            const total = data.total_amount;
            alert(`Sale recorded! Total: $${total}`);
            
            // Ask if user wants to print receipt
            if (confirm('Print receipt?')) {
                printReceipt({
                    item: itemName,
                    quantity: quantity,
                    unit_price: unitPrice,
                    total: total,
                    customer: customerName || 'Walk-in Customer',
                    date: new Date().toLocaleString()
                });
            }
            
            // Refresh the scanned item to show updated stock
            document.getElementById('barcode-input').value = document.querySelector('.detail-item strong').textContent;
            scanBarcode();
        } else {
            alert('Error: ' + (data.error || 'Sale failed'));
        }
    });
}

// Shelf Management
function loadShelves() {
    document.querySelectorAll('.shelf-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.shelf-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadShelfData(tab.dataset.shelf);
        });
    });
    
    loadShelfData('overview');
}

async function loadShelfData(shelfType) {
    const content = document.getElementById('shelf-content');
    content.innerHTML = '<p>Loading...</p>';
    
    try {
        switch(shelfType) {
            case 'overview':
                await loadShelfOverview(content);
                break;
            case 'alerts':
                await loadCapacityAlerts(content);
                break;
            case 'misplaced':
                await loadMisplacedItems(content);
                break;
        }
    } catch (error) {
        content.innerHTML = '<p>Error loading shelf data.</p>';
    }
}

async function loadShelfOverview(content) {
    const shelves = await apiCall('/shelves');
    
    if (shelves.length === 0) {
        content.innerHTML = '<p>No shelves configured. Add shelves to get started.</p>';
        return;
    }
    
    content.innerHTML = `
        <div class="shelf-grid">
            ${shelves.map(shelf => {
                const capacityClass = shelf.capacity_percentage > 90 ? 'high' : 
                                    shelf.capacity_percentage < 10 ? 'low' : 'medium';
                const cardClass = shelf.capacity_percentage > 90 ? 'high-capacity' : 
                                shelf.capacity_percentage < 10 ? 'low-capacity' : '';
                
                return `
                    <div class="shelf-card ${cardClass}">
                        <h3>📦 ${shelf.shelf_code}</h3>
                        <p><strong>Location:</strong> ${shelf.location || '-'}</p>
                        <p><strong>Category:</strong> ${shelf.category || 'General'}</p>
                        <p><strong>Items:</strong> ${shelf.item_count}</p>
                        
                        ${shelf.items && shelf.items.length > 0 ? `<p><strong>Items:</strong> ${shelf.items.join(', ')}</p>` : '<p><em>No items assigned</em></p>'}
                        
                        <div class="capacity-bar">
                            <div class="capacity-fill ${capacityClass}" style="width: ${shelf.capacity_percentage}%"></div>
                        </div>
                        
                        <p><strong>Capacity:</strong> ${shelf.item_count}/${shelf.max_capacity} (${shelf.capacity_percentage}%)</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function loadCapacityAlerts(content) {
    const alerts = await apiCall('/shelves/alerts');
    
    if (alerts.length === 0) {
        content.innerHTML = '<p>✅ No capacity alerts. All shelves are within normal range.</p>';
        return;
    }
    
    content.innerHTML = `
        <div class="alerts-section">
            <h3>⚠️ Capacity Alerts</h3>
            ${alerts.map(alert => `
                <div class="alert-item ${alert.alert_type === 'high' ? 'critical' : ''}">
                    <strong>${alert.shelf_code}</strong> - ${alert.location || 'Unknown Location'}<br>
                    <span style="color: ${alert.alert_type === 'high' ? '#e74c3c' : '#f39c12'}">
                        ${alert.alert_type === 'high' ? '🔴 OVERCAPACITY' : '🟡 LOW STOCK'}: 
                        ${alert.actual_items}/${alert.max_capacity} (${alert.capacity_percentage}%)
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadMisplacedItems(content) {
    const misplaced = await apiCall('/shelves/misplaced');
    
    if (misplaced.length === 0) {
        content.innerHTML = '<p>✅ No misplaced items found. All items are in correct shelves.</p>';
        return;
    }
    
    content.innerHTML = `
        <div class="chart-container">
            <h3>🔄 Misplaced Items</h3>
            <table>
                <thead>
                    <tr><th>Item</th><th>Current Shelf</th><th>Correct Shelf</th><th>Category</th><th>Action</th></tr>
                </thead>
                <tbody>
                    ${misplaced.map(item => `
                        <tr>
                            <td><strong>${item.name}</strong></td>
                            <td style="color: #e74c3c;">${item.current_shelf || 'Unassigned'}</td>
                            <td style="color: #27ae60;">${item.correct_shelf}</td>
                            <td>${item.category}</td>
                            <td><button onclick="moveItem(${item.id}, '${item.correct_shelf}')" class="btn-primary">Move</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showAddShelfForm() {
    showModal(`
        <h3>Add New Shelf</h3>
        <form onsubmit="addShelf(event)">
            <div class="form-group">
                <label>Shelf Code:</label>
                <input type="text" name="shelf_code" required placeholder="e.g., A1, B2, C3">
            </div>
            <div class="form-group">
                <label>Location:</label>
                <input type="text" name="location" placeholder="e.g., Main Floor, Storage Room">
            </div>
            <div class="form-group">
                <label>Category:</label>
                <select name="category">
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cold & Flu">Cold & Flu</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Gastro">Gastro</option>
                    <option value="Allergy">Allergy</option>
                </select>
            </div>
            <div class="form-group">
                <label>Max Capacity:</label>
                <input type="number" name="max_capacity" value="100" min="1">
            </div>
            <button type="submit" class="btn-primary">Add Shelf</button>
        </form>
    `);
}

async function addShelf(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        await apiCall('/shelves', 'POST', data);
        hideModal();
        loadShelfData('overview');
    } catch (error) {
        alert('Error adding shelf: ' + error.message);
    }
}

function updateShelfCapacity(shelfId, shelfCode) {
    const currentStock = prompt(`Update stock count for shelf ${shelfCode}:`, '0');
    if (currentStock === null || currentStock < 0) return;
    
    fetch(`/api/shelves/${shelfId}/capacity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_stock: parseInt(currentStock) })
    }).then(response => response.json())
    .then(data => {
        if (data.message) {
            loadShelfData('overview');
        } else {
            alert('Error updating capacity');
        }
    });
}

// Minimal Shelves
async function loadShelves() {
    try {
        const shelves = await apiCall('/shelves');
        const content = document.getElementById('shelf-content');
        
        if (shelves.length === 0) {
            content.innerHTML = '<p>No shelves found.</p>';
            return;
        }
        
        content.innerHTML = `
            <div class="shelf-grid">
                ${shelves.map(shelf => `
                    <div class="shelf-card">
                        <h3>📦 ${shelf.shelf_code}</h3>
                        <p><strong>Location:</strong> ${shelf.location || '-'}</p>
                        <p><strong>Category:</strong> ${shelf.category || 'General'}</p>
                        <p><strong>Items:</strong> ${shelf.item_count}</p>
                        ${shelf.items.length > 0 ? `<p><strong>Contains:</strong> ${shelf.items.join(', ')}</p>` : '<p><em>No items</em></p>'}
                        <p><strong>Capacity:</strong> ${shelf.item_count}/${shelf.max_capacity} (${shelf.capacity_percentage}%)</p>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        document.getElementById('shelf-content').innerHTML = '<p>Error loading shelves.</p>';
    }
}

// Customers
async function loadCustomers() {
    try {
        const customers = await apiCall('/customers');
        const table = document.getElementById('customers-table');
        
        if (customers.length === 0) {
            table.innerHTML = '<p>No customers found. Add customers to get started.</p>';
            return;
        }
        
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(customer => `
                        <tr>
                            <td><strong>${customer.name}</strong></td>
                            <td>${customer.phone || '-'}</td>
                            <td>${customer.email || '-'}</td>
                            <td>${customer.address || '-'}</td>
                            <td>
                                <button onclick="viewCustomer(${customer.id})">View</button>
                                <button onclick="editCustomer(${customer.id})">Edit</button>
                                <button onclick="deleteCustomer(${customer.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        document.getElementById('customers-table').innerHTML = '<p>Error loading customers.</p>';
    }
}

function showAddCustomerForm() {
    showModal(`
        <h3>Add New Customer</h3>
        <form onsubmit="addCustomer(event)">
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Phone:</label>
                <input type="tel" name="phone">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email">
            </div>
            <div class="form-group">
                <label>Address:</label>
                <textarea name="address" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Date of Birth:</label>
                <input type="date" name="date_of_birth">
            </div>
            <button type="submit" class="btn-primary">Add Customer</button>
        </form>
    `);
}

async function addCustomer(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        await apiCall('/customers', 'POST', data);
        hideModal();
        loadCustomers();
    } catch (error) {
        alert('Error adding customer: ' + error.message);
    }
}

async function viewCustomer(id) {
    try {
        const customer = await apiCall(`/customers/${id}`);
        
        showModal(`
            <h3>👤 ${customer.name}</h3>
            <div class="customer-details">
                <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
                <p><strong>Email:</strong> ${customer.email || 'Not provided'}</p>
                <p><strong>Address:</strong> ${customer.address || 'Not provided'}</p>
                <p><strong>Date of Birth:</strong> ${customer.date_of_birth || 'Not provided'}</p>
                <p><strong>Customer Since:</strong> ${new Date(customer.created_at).toLocaleDateString()}</p>
                
                <hr style="margin: 1rem 0;">
                
                <h4>📊 Purchase Summary</h4>
                <p><strong>Total Purchases:</strong> ${customer.total_purchases}</p>
                <p><strong>Total Spent:</strong> $${customer.total_spent.toFixed(2)}</p>
                
                ${customer.purchases.length > 0 ? `
                    <h4>📋 Recent Purchases</h4>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${customer.purchases.slice(0, 5).map(purchase => `
                            <div style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                                <strong>${purchase.item_name}</strong> - Qty: ${purchase.quantity} - $${purchase.total_amount.toFixed(2)}<br>
                                <small>${new Date(purchase.sale_date).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p><em>No purchases yet</em></p>'}
            </div>
        `);
    } catch (error) {
        alert('Error loading customer details');
    }
}

async function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            await apiCall(`/customers/${id}`, 'DELETE');
            loadCustomers();
        } catch (error) {
            alert('Error deleting customer');
        }
    }
}

// Print Receipt
function printReceipt(sale) {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    receiptWindow.document.write(`
        <html>
        <head>
            <title>Receipt</title>
            <style>
                body { font-family: monospace; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .item { margin: 10px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>ABK PHARMACY</h2>
                <p>Your Health, Our Priority</p>
                <p>Date: ${sale.date}</p>
            </div>
            
            <div class="item">
                <p><strong>Customer:</strong> ${sale.customer}</p>
                <p><strong>Item:</strong> ${sale.item}</p>
                <p><strong>Quantity:</strong> ${sale.quantity}</p>
                <p><strong>Unit Price:</strong> $${sale.unit_price}</p>
            </div>
            
            <div class="total">
                <p><strong>TOTAL: $${sale.total}</strong></p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing ABK Pharmacy!</p>
                <p>Keep this receipt for your records</p>
            </div>
        </body>
        </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
}

// Database Backup
async function downloadBackup() {
    try {
        const response = await fetch('/api/backup/export');
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abk-pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('✅ Backup downloaded successfully!');
    } catch (error) {
        alert('❌ Error creating backup');
    }
}

// Email Alerts (Simulated)
async function sendLowStockAlert() {
    try {
        const alerts = await apiCall('/alerts/low-stock');
        
        if (alerts.length === 0) {
            alert('✅ No low stock items found!');
            return;
        }
        
        const alertList = alerts.map(item => `• ${item.name}: ${item.quantity} remaining`).join('\n');
        
        // Simulate email alert
        const emailContent = `LOW STOCK ALERT - ABK Pharmacy\n\nThe following items need restocking:\n\n${alertList}\n\nPlease reorder these items soon.`;
        
        // In a real system, this would send an actual email
        console.log('Email Alert:', emailContent);
        
        alert(`📧 Low Stock Alert Generated!\n\n${alerts.length} items need restocking:\n${alertList}\n\n(In production, this would send an email)`);
    } catch (error) {
        alert('❌ Error generating alert');
    }
}

// Personnel
async function loadPersonnel() {
    const personnel = await apiCall('/personnel');
    const table = document.getElementById('personnel-table');
    
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${personnel.map(person => `
                    <tr>
                        <td>${person.name}</td>
                        <td>${person.role || '-'}</td>
                        <td>${person.email || '-'}</td>
                        <td>${person.phone || '-'}</td>
                        <td>
                            <button onclick="deletePersonnel(${person.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddPersonnelForm() {
    showModal(`
        <h3>Add Personnel</h3>
        <form onsubmit="addPersonnel(event)">
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Role:</label>
                <input type="text" name="role">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email">
            </div>
            <div class="form-group">
                <label>Phone:</label>
                <input type="tel" name="phone">
            </div>
            <button type="submit" class="btn-primary">Add Personnel</button>
        </form>
    `);
}

async function addPersonnel(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    await apiCall('/personnel', 'POST', data);
    hideModal();
    loadPersonnel();
}

async function deletePersonnel(id) {
    if (confirm('Are you sure you want to delete this personnel record?')) {
        await apiCall(`/personnel/${id}`, 'DELETE');
        loadPersonnel();
    }
}

// Modal functions
function showModal(content) {
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking X or outside
document.querySelector('.close').onclick = hideModal;
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        hideModal();
    }
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
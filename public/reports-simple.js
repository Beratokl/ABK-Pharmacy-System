// Simple Reports Functions
async function loadReports() {
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadReportData(tab.dataset.report);
        });
    });
    
    loadReportData('summary');
}

async function loadReportData(reportType) {
    const content = document.getElementById('report-content');
    content.innerHTML = '<p>Loading...</p>';
    
    try {
        if (reportType === 'summary') {
            const summary = await apiCall('/reports/summary');
            content.innerHTML = `
                <div class="report-grid">
                    <div class="report-card">
                        <h3>Total Items</h3>
                        <div style="font-size: 2rem; font-weight: bold; color: #3498db;">${summary.total_items}</div>
                    </div>
                    <div class="report-card">
                        <h3>Total Sales</h3>
                        <div style="font-size: 2rem; font-weight: bold; color: #f39c12;">${summary.total_sales}</div>
                    </div>
                    <div class="report-card">
                        <h3>Total Revenue</h3>
                        <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;">$${summary.total_revenue.toFixed(2)}</div>
                    </div>
                </div>
            `;
        } else if (reportType === 'top-items') {
            const topItems = await apiCall('/reports/top-items');
            if (topItems.length === 0) {
                content.innerHTML = '<p>No sales data available.</p>';
                return;
            }
            content.innerHTML = `
                <div class="chart-container">
                    <h3>Top Selling Items</h3>
                    <table>
                        <thead>
                            <tr><th>Item</th><th>Units Sold</th><th>Revenue</th></tr>
                        </thead>
                        <tbody>
                            ${topItems.map((item, index) => `
                                <tr>
                                    <td><strong>#${index + 1}</strong> ${item.name}</td>
                                    <td>${item.total_sold}</td>
                                    <td>$${item.total_revenue.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            content.innerHTML = '<p>Report not available yet.</p>';
        }
    } catch (error) {
        content.innerHTML = '<p>Error loading report data.</p>';
    }
}
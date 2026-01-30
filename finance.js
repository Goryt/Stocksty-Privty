// Finance & Reporting Functions
let financeChart = null;
let profitLossChart = null;

function initializeFinance() {
    loadFinanceData();
    setupFinanceEventListeners();
    updateFinanceCharts();
    generateFinancialReports();
}

function setupFinanceEventListeners() {
    const financePeriod = document.getElementById('financePeriod');
    const reportType = document.getElementById('reportType');
    const exportBtn = document.getElementById('exportFinanceBtn');
    
    if (financePeriod) {
        financePeriod.addEventListener('change', updateFinanceCharts);
    }
    
    if (reportType) {
        reportType.addEventListener('change', generateFinancialReports);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportFinancialReport);
    }
}

function loadFinanceData() {
    // Load financial data from transactions
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate monthly financial summary
    const monthlyData = calculateMonthlyFinance(currentMonth, currentYear);
    
    // Update financial summary cards
    updateFinancialSummary(monthlyData);
}

function calculateMonthlyFinance(month, year) {
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month && 
               transactionDate.getFullYear() === year;
    });
    
    const totalRevenue = monthlyTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalProfit = monthlyTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalExpenses = totalRevenue - totalProfit;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    
    return {
        revenue: totalRevenue,
        profit: totalProfit,
        expenses: totalExpenses,
        margin: profitMargin,
        transactionCount: monthlyTransactions.length,
        averageTransaction: totalRevenue / monthlyTransactions.length || 0
    };
}

function updateFinancialSummary(data) {
    const summaryElements = {
        monthlyRevenue: 'monthlyRevenueSummary',
        monthlyProfit: 'monthlyProfitSummary',
        monthlyExpenses: 'monthlyExpensesSummary',
        profitMargin: 'profitMarginSummary',
        transactionCount: 'transactionCountSummary',
        averageTransaction: 'averageTransactionSummary'
    };
    
    Object.entries(summaryElements).forEach(([key, elementId]) => {
        const element = document.getElementById(elementId);
        if (element) {
            let value = '';
            switch(key) {
                case 'monthlyRevenue':
                case 'monthlyProfit':
                case 'monthlyExpenses':
                case 'averageTransaction':
                    value = formatCurrency(data[key.replace('monthly', '').toLowerCase()] || data[key] || 0);
                    break;
                case 'profitMargin':
                    value = (data.margin || 0).toFixed(1) + '%';
                    break;
                case 'transactionCount':
                    value = formatNumber(data.transactionCount || 0);
                    break;
            }
            element.textContent = value;
        }
    });
}

function updateFinanceCharts() {
    const period = document.getElementById('financePeriod')?.value || 'daily';
    
    // Update main finance chart
    updateFinanceChart(period);
    
    // Update profit loss chart
    updateProfitLossChart(period);
}

function updateFinanceChart(period) {
    const ctx = document.getElementById('financeChart');
    if (!ctx) return;
    
    if (window.financeChart) {
        window.financeChart.destroy();
    }
    
    const chartData = generateFinanceChartData(period);
    
    window.financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Pendapatan',
                data: chartData.revenue,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Pengeluaran',
                data: chartData.expenses,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Laporan Keuangan - ${getPeriodLabel(period)}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateProfitLossChart(period) {
    const ctx = document.getElementById('profitLossChart');
    if (!ctx) return;
    
    if (profitLossChart) {
        profitLossChart.destroy();
    }
    
    const chartData = generateProfitLossData(period);
    
    profitLossChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Profit',
                data: chartData.profit,
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: '#28a745',
                borderWidth: 1
            }, {
                label: 'Loss',
                data: chartData.loss,
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: '#dc3545',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Profit & Loss Analysis'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(Math.abs(value));
                        }
                    }
                }
            }
        }
    });
}

function generateFinanceChartData(period) {
    const labels = [];
    const revenue = [];
    const expenses = [];
    
    if (period === 'daily') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.toDateString() === date.toDateString();
            });
            
            const dayRevenue = dayTransactions.reduce((sum, t) => sum + t.total, 0);
            const dayProfit = dayTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
            const dayExpenses = dayRevenue - dayProfit;
            
            labels.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));
            revenue.push(dayRevenue);
            expenses.push(dayExpenses);
        }
    } else if (period === 'weekly') {
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });
            
            const weekRevenue = weekTransactions.reduce((sum, t) => sum + t.total, 0);
            const weekProfit = weekTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
            const weekExpenses = weekRevenue - weekProfit;
            
            labels.push(`Minggu ${4-i}`);
            revenue.push(weekRevenue);
            expenses.push(weekExpenses);
        }
    } else if (period === 'monthly') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === date.getMonth() && 
                       transactionDate.getFullYear() === date.getFullYear();
            });
            
            const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.total, 0);
            const monthProfit = monthTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
            const monthExpenses = monthRevenue - monthProfit;
            
            labels.push(date.toLocaleDateString('id-ID', { month: 'short' }));
            revenue.push(monthRevenue);
            expenses.push(monthExpenses);
        }
    }
    
    return { labels, revenue, expenses };
}

function generateProfitLossData(period) {
    const labels = [];
    const profit = [];
    const loss = [];
    
    if (period === 'daily') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.toDateString() === date.toDateString();
            });
            
            const dayProfit = dayTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
            
            labels.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));
            profit.push(dayProfit);
            loss.push(dayProfit < 0 ? dayProfit : 0); // Negative values for loss
        }
    } else if (period === 'weekly') {
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });
            
            const weekProfit = weekTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
            
            labels.push(`Minggu ${4-i}`);
            profit.push(weekProfit);
            loss.push(weekProfit < 0 ? weekProfit : 0);
        }
    } else if (period === 'monthly') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === date.getMonth() && 
                       transactionDate.getFullYear() === date.getFullYear();
            });
            
            const monthProfit = monthTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
            
            labels.push(date.toLocaleDateString('id-ID', { month: 'short' }));
            profit.push(monthProfit);
            loss.push(monthProfit < 0 ? monthProfit : 0);
        }
    }
    
    return { labels, profit, loss };
}

function generateFinancialReports() {
    const reportType = document.getElementById('reportType')?.value || 'summary';
    const period = document.getElementById('financePeriod')?.value || 'daily';
    
    const reportContainer = document.getElementById('financialReports');
    if (!reportContainer) return;
    
    let reportHTML = '';
    
    switch (reportType) {
        case 'summary':
            reportHTML = generateSummaryReport(period);
            break;
        case 'detailed':
            reportHTML = generateDetailedReport(period);
            break;
        case 'profit_loss':
            reportHTML = generateProfitLossReport(period);
            break;
        case 'cash_flow':
            reportHTML = generateCashFlowReport(period);
            break;
    }
    
    reportContainer.innerHTML = reportHTML;
}

function generateSummaryReport(period) {
    const data = getFinancialDataForPeriod(period);
    
    return `
        <div class="card">
            <div class="card-header">
                <h5>Laporan Keuangan Ringkasan - ${getPeriodLabel(period)}</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-3">
                        <div class="text-center">
                            <h4 class="text-success">${formatCurrency(data.revenue)}</h4>
                            <small class="text-muted">Total Pendapatan</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h4 class="text-danger">${formatCurrency(data.expenses)}</h4>
                            <small class="text-muted">Total Pengeluaran</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h4 class="text-primary">${formatCurrency(data.profit)}</h4>
                            <small class="text-muted">Total Profit</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h4 class="text-info">${data.margin.toFixed(1)}%</h4>
                            <small class="text-muted">Margin Profit</small>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Periode</th>
                                <th>Pendapatan</th>
                                <th>Pengeluaran</th>
                                <th>Profit</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.details.map(detail => `
                                <tr>
                                    <td>${detail.period}</td>
                                    <td>${formatCurrency(detail.revenue)}</td>
                                    <td>${formatCurrency(detail.expenses)}</td>
                                    <td>${formatCurrency(detail.profit)}</td>
                                    <td>${detail.margin.toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function generateDetailedReport(period) {
    const data = getFinancialDataForPeriod(period);
    
    return `
        <div class="card">
            <div class="card-header">
                <h5>Laporan Keuangan Detail - ${getPeriodLabel(period)}</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <h6>Analisis Pendapatan</h6>
                    <p>Total pendapatan untuk periode ini adalah <strong>${formatCurrency(data.revenue)}</strong></p>
                    <p>Rata-rata transaksi: <strong>${formatCurrency(data.averageTransaction)}</strong></p>
                    <p>Jumlah transaksi: <strong>${data.transactionCount}</strong></p>
                </div>
                
                <div class="mb-3">
                    <h6>Analisis Profitabilitas</h6>
                    <p>Total profit: <strong>${formatCurrency(data.profit)}</strong></p>
                    <p>Margin profit: <strong>${data.margin.toFixed(1)}%</strong></p>
                    <p>ROI: <strong>${(data.profit / data.expenses * 100).toFixed(1)}%</strong></p>
                </div>
                
                <div class="mb-3">
                    <h6>Rekomendasi</h6>
                    ${generateFinanceRecommendations(data)}
                </div>
            </div>
        </div>
    `;
}

function generateFinanceRecommendations(data) {
    let recommendations = [];
    
    if (data.margin < 30) {
        recommendations.push('📉 Margin profit masih rendah. Pertimbangkan untuk menaikkan harga jual atau menurunkan biaya produksi.');
    }
    
    if (data.margin > 70) {
        recommendations.push('📈 Margin profit sangat baik! Pertahankan kualitas produk dan layanan.');
    }
    
    if (data.transactionCount < 10) {
        recommendations.push('🛒 Jumlah transaksi masih sedikit. Lakukan promosi untuk meningkatkan penjualan.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ Kinerja keuangan dalam kondisi baik. Terus pertahankan dan kembangkan strategi bisnis.');
    }
    
    return recommendations.map(rec => `<p>${rec}</p>`).join('');
}

function getFinancialDataForPeriod(period) {
    // This is a simplified version - in real app, this would calculate actual data
    const chartData = generateFinanceChartData(period);
    
    const totalRevenue = chartData.revenue.reduce((sum, val) => sum + val, 0);
    const totalExpenses = chartData.expenses.reduce((sum, val) => sum + val, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    
    const details = chartData.labels.map((label, index) => ({
        period: label,
        revenue: chartData.revenue[index],
        expenses: chartData.expenses[index],
        profit: chartData.revenue[index] - chartData.expenses[index],
        margin: chartData.revenue[index] > 0 ? ((chartData.revenue[index] - chartData.expenses[index]) / chartData.revenue[index] * 100) : 0
    }));
    
    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalProfit,
        margin: margin,
        details: details,
        transactionCount: transactions.length,
        averageTransaction: totalRevenue / transactions.length || 0
    };
}

function getPeriodLabel(period) {
    const labels = {
        daily: 'Harian',
        weekly: 'Mingguan',
        monthly: 'Bulanan'
    };
    return labels[period] || period;
}

function exportFinancialReport() {
    const period = document.getElementById('financePeriod')?.value || 'daily';
    const reportType = document.getElementById('reportType')?.value || 'summary';
    
    const data = getFinancialDataForPeriod(period);
    
    const reportData = {
        period: period,
        reportType: reportType,
        generatedAt: new Date().toISOString(),
        summary: {
            revenue: data.revenue,
            expenses: data.expenses,
            profit: data.profit,
            margin: data.margin,
            transactionCount: data.transactionCount
        },
        details: data.details
    };
    
    // Create and download file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `financial-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Laporan keuangan berhasil diekspor', 'success');
}

// Inventory Management Functions
function initializeInventory() {
    checkLowStockProducts();
    setupInventoryNotifications();
    updateInventoryDisplay();
}

function checkLowStockProducts() {
    const lowStockProducts = products.filter(product => product.stock <= 10);
    
    if (lowStockProducts.length > 0) {
        showLowStockNotification(lowStockProducts);
    }
}

function showLowStockNotification(lowStockProducts) {
    const productList = lowStockProducts.map(product => 
        `<li>${product.name} (Stok: ${product.stock})</li>`
    ).join('');
    
    Swal.fire({
        title: 'Peringatan Stok Menipis!',
        html: `
            <div class="text-start">
                <p>Produk berikut memiliki stok yang menipis:</p>
                <ul>${productList}</ul>
                <p>Silahkan restock segera untuk menghindari kehabisan stok.</p>
            </div>
        `,
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: 'Lihat Inventory',
        showCancelButton: true,
        cancelButtonText: 'Nanti'
    }).then((result) => {
        if (result.isConfirmed) {
            showSection('inventory');
        }
    });
}

function setupInventoryNotifications() {
    // Check low stock every hour
    setInterval(checkLowStockProducts, 3600000); // 1 hour in milliseconds
}

function updateInventoryDisplay() {
    const inventoryList = document.getElementById('inventoryList');
    if (!inventoryList) return;
    
    const inventoryData = products.map(product => ({
        ...product,
        status: getStockStatus(product.stock),
        daysRemaining: estimateDaysRemaining(product)
    }));
    
    inventoryList.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Stok</th>
                        <th>Status</th>
                        <th>Estimasi Habis</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventoryData.map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                <br><small class="text-muted">${item.category}</small>
                            </td>
                            <td>
                                <span class="badge ${item.status.class}">${item.stock}</span>
                            </td>
                            <td>
                                <span class="badge ${item.status.class}">${item.status.label}</span>
                            </td>
                            <td>${item.daysRemaining} hari</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="restockProduct('${item.id}')">
                                    <i class="bi bi-plus-circle"></i> Restock
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getStockStatus(stock) {
    if (stock <= 5) {
        return { label: 'Kritis', class: 'bg-danger' };
    } else if (stock <= 10) {
        return { label: 'Menipis', class: 'bg-warning' };
    } else if (stock <= 20) {
        return { label: 'Cukup', class: 'bg-info' };
    } else {
        return { label: 'Aman', class: 'bg-success' };
    }
}

function estimateDaysRemaining(product) {
    // Simple estimation based on average sales
    // In real app, this would use historical sales data
    const averageDailySales = Math.random() * 5 + 1; // Mock data
    return Math.ceil(product.stock / averageDailySales);
}

function restockProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    Swal.fire({
        title: `Restock ${product.name}`,
        html: `
            <div class="text-start">
                <p>Stok saat ini: <strong>${product.stock}</strong></p>
                <div class="mb-3">
                    <label class="form-label">Jumlah Restock:</label>
                    <input type="number" class="form-control" id="restockQuantity" value="10" min="1">
                </div>
                <div class="mb-3">
                    <label class="form-label">Catatan:</label>
                    <textarea class="form-control" id="restockNote" rows="2" placeholder="Catatan tambahan..."></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Restock',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const quantity = parseInt(document.getElementById('restockQuantity').value);
            if (quantity <= 0) {
                Swal.showValidationMessage('Jumlah restock harus lebih dari 0');
                return false;
            }
            return quantity;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const quantity = result.value;
            const note = document.getElementById('restockNote').value;
            
            // Update product stock
            product.stock += quantity;
            saveProducts();
            
            // Update display
            updateInventoryDisplay();
            updateProductTable();
            updateProductList();
            
            showNotification(`Berhasil restock ${quantity} unit ${product.name}`, 'success');
            
            // Log restock activity
            logRestockActivity(productId, quantity, note);
        }
    });
}

function logRestockActivity(productId, quantity, note) {
    const restockLog = {
        id: generateId(),
        productId: productId,
        quantity: quantity,
        note: note,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage (in real app, this would be sent to server)
    const existingLogs = loadFromLocalStorage('restock_logs', []);
    existingLogs.push(restockLog);
    saveToLocalStorage('restock_logs', existingLogs);
}

// Export functions
window.exportFinancialReport = exportFinancialReport;
window.initializeInventory = initializeInventory;
window.restockProduct = restockProduct;

// Initialize inventory when finance section loads
if (currentSection === 'inventory') {
    initializeInventory();
}
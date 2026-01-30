// Additional Features for UMKM Dashboard

// ==================== AUTO BACKUP FEATURE ====================
let autoBackupInterval = null;

function initializeAutoBackup() {
    // Check if auto backup is enabled
    const autoBackupEnabled = loadFromLocalStorage('auto_backup_enabled', false);
    const backupInterval = loadFromLocalStorage('backup_interval', 60); // minutes
    
    if (autoBackupEnabled) {
        startAutoBackup(backupInterval);
    }
}

function startAutoBackup(intervalMinutes) {
    // Clear existing interval
    if (autoBackupInterval) {
        clearInterval(autoBackupInterval);
    }
    
    // Set new interval
    autoBackupInterval = setInterval(() => {
        performAutoBackup();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Auto backup started: every ${intervalMinutes} minutes`);
}

function stopAutoBackup() {
    if (autoBackupInterval) {
        clearInterval(autoBackupInterval);
        autoBackupInterval = null;
    }
}

function performAutoBackup() {
    const data = {
        products: products,
        transactions: transactions,
        aiRecommendations: aiRecommendations,
        timestamp: new Date().toISOString(),
        type: 'auto_backup'
    };
    
    // Save to localStorage with timestamp
    const backupKey = `auto_backup_${Date.now()}`;
    saveToLocalStorage(backupKey, data);
    
    // Keep only last 10 backups
    cleanupOldBackups();
    
    console.log('Auto backup completed:', backupKey);
}

function cleanupOldBackups() {
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('auto_backup_'));
    
    if (backupKeys.length > 10) {
        // Sort by timestamp and remove oldest
        backupKeys.sort();
        const keysToRemove = backupKeys.slice(0, backupKeys.length - 10);
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

function showBackupSettings() {
    const autoBackupEnabled = loadFromLocalStorage('auto_backup_enabled', false);
    const backupInterval = loadFromLocalStorage('backup_interval', 60);
    
    Swal.fire({
        title: 'Pengaturan Backup Otomatis',
        html: `
            <div class="text-start">
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="autoBackupEnabled" ${autoBackupEnabled ? 'checked' : ''}>
                    <label class="form-check-label" for="autoBackupEnabled">
                        Aktifkan Backup Otomatis
                    </label>
                </div>
                <div class="mb-3">
                    <label class="form-label">Interval Backup (menit)</label>
                    <input type="number" class="form-control" id="backupInterval" value="${backupInterval}" min="5" max="1440">
                </div>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Backup akan disimpan secara lokal di browser Anda.
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            return {
                enabled: document.getElementById('autoBackupEnabled').checked,
                interval: parseInt(document.getElementById('backupInterval').value) || 60
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveToLocalStorage('auto_backup_enabled', result.value.enabled);
            saveToLocalStorage('backup_interval', result.value.interval);
            
            if (result.value.enabled) {
                startAutoBackup(result.value.interval);
                showNotification('Backup otomatis diaktifkan', 'success');
            } else {
                stopAutoBackup();
                showNotification('Backup otomatis dinonaktifkan', 'info');
            }
        }
    });
}

// ==================== LOW STOCK NOTIFICATIONS ====================
let lowStockCheckInterval = null;

function initializeLowStockNotifications() {
    // Check immediately
    checkLowStockAndNotify();
    
    // Then check every 30 minutes
    lowStockCheckInterval = setInterval(checkLowStockAndNotify, 30 * 60 * 1000);
}

function checkLowStockAndNotify() {
    const lowStockProducts = products.filter(p => p.stock <= 5);
    
    if (lowStockProducts.length > 0) {
        const productList = lowStockProducts.map(p => 
            `<li class="list-group-item d-flex justify-content-between align-items-center">
                ${p.name}
                <span class="badge bg-danger rounded-pill">${p.stock}</span>
            </li>`
        ).join('');
        
        Swal.fire({
            title: '⚠️ Stok Produk Menipis',
            html: `
                <div class="text-start">
                    <p>Produk berikut memerlukan perhatian:</p>
                    <ul class="list-group">${productList}</ul>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Restock Sekarang',
            cancelButtonText: 'Nanti',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                showSection('inventory');
            }
        });
    }
}

// ==================== DARK MODE TOGGLE ====================
function initializeDarkMode() {
    // Check for saved dark mode preference
    const darkModeEnabled = loadFromLocalStorage('dark_mode_enabled', false);
    
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    saveToLocalStorage('dark_mode_enabled', isDarkMode);
    
    // Update charts if they exist
    updateChartsForDarkMode(isDarkMode);
    
    // Show notification
    showNotification(isDarkMode ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan', 'success');
}

function updateChartsForDarkMode(isDarkMode) {
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const titleColor = isDarkMode ? '#f8fafc' : '#1e293b';
    
    // Update all charts
    [salesChart, topProductsChart, window.financeChart, window.profitLossChart].forEach(chart => {
        if (chart) {
            // Update legend
            if (chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            // Update tooltip
            if (chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.backgroundColor = isDarkMode ? '#1e293b' : '#fff';
                chart.options.plugins.tooltip.titleColor = titleColor;
                chart.options.plugins.tooltip.bodyColor = textColor;
                chart.options.plugins.tooltip.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            }
            
            // Update scales
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.y.grid.color = gridColor;
            }
            
            chart.update('none');
        }
    });
}

// ==================== EXPORT TO CSV/EXCEL ====================
function exportToCSV(data, filename) {
    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
            const value = row[h];
            // Escape values with commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function exportProductsToCSV() {
    if (products.length === 0) {
        showNotification('Tidak ada data produk untuk diekspor', 'warning');
        return;
    }
    
    const data = products.map(p => ({
        ID: p.id,
        Nama: p.name,
        Kategori: getCategoryLabel(p.category),
        'Harga Jual': p.price,
        HPP: p.hpp,
        Stok: p.stock,
        Deskripsi: p.description || '',
        'Tanggal Dibuat': new Date(p.created_at).toLocaleDateString('id-ID')
    }));
    
    exportToCSV(data, `produk-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Data produk berhasil diekspor ke CSV', 'success');
}

function exportTransactionsToCSV() {
    if (transactions.length === 0) {
        showNotification('Tidak ada data transaksi untuk diekspor', 'warning');
        return;
    }
    
    const data = transactions.map(t => ({
        ID: t.id,
        Tanggal: new Date(t.date).toLocaleDateString('id-ID'),
        'Jam': new Date(t.date).toLocaleTimeString('id-ID'),
        Total: t.total,
        Profit: t.profit || 0,
        'Metode Pembayaran': t.payment_method,
        Status: t.status,
        'Jumlah Item': t.items ? t.items.length : 0
    }));
    
    exportToCSV(data, `transaksi-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Data transaksi berhasil diekspor ke CSV', 'success');
}

function showExportOptions() {
    Swal.fire({
        title: 'Export Data',
        html: `
            <div class="text-start">
                <p>Pilih data yang ingin diekspor:</p>
                <div class="d-grid gap-2">
                    <button class="btn btn-outline-primary" onclick="exportProductsToCSV()">
                        <i class="bi bi-box-seam"></i> Export Produk
                    </button>
                    <button class="btn btn-outline-success" onclick="exportTransactionsToCSV()">
                        <i class="bi bi-receipt"></i> Export Transaksi
                    </button>
                    <button class="btn btn-outline-info" onclick="exportData()">
                        <i class="bi bi-download"></i> Export Semua Data (JSON)
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
    });
}

// ==================== KEYBOARD SHORTCUTS ====================
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    showSection('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    showSection('pos');
                    break;
                case '3':
                    e.preventDefault();
                    showSection('products');
                    break;
                case 'b':
                    e.preventDefault();
                    showBackupSettings();
                    break;
                case 'e':
                    e.preventDefault();
                    showExportOptions();
                    break;
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modalInstance = bootstrap.Modal.getInstance(openModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }
    });
}

// ==================== PRODUCT QUICK SEARCH ====================
function initializeQuickSearch() {
    // Add keyboard shortcut for quick search
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            showQuickSearch();
        }
    });
}

function showQuickSearch() {
    Swal.fire({
        title: 'Cari Produk Cepat',
        html: `
            <div class="mb-3">
                <input type="text" class="form-control" id="quickSearchInput" placeholder="Ketik nama produk..." autofocus>
            </div>
            <div id="quickSearchResults" class="list-group">
                <p class="text-muted text-center">Ketik untuk mencari produk</p>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: () => {
            const input = document.getElementById('quickSearchInput');
            input.focus();
            
            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const results = products.filter(p => 
                    p.name.toLowerCase().includes(searchTerm) ||
                    p.category.toLowerCase().includes(searchTerm)
                ).slice(0, 5);
                
                const resultsDiv = document.getElementById('quickSearchResults');
                if (results.length === 0) {
                    resultsDiv.innerHTML = '<p class="text-muted text-center">Tidak ada hasil</p>';
                } else {
                    resultsDiv.innerHTML = results.map(p => `
                        <button class="list-group-item list-group-item-action" onclick="addToCart('${p.id}'); Swal.close();">
                            <div class="d-flex justify-content-between">
                                <span>${p.name}</span>
                                <span class="text-success">${formatCurrency(p.price)}</span>
                            </div>
                            <small class="text-muted">Stok: ${p.stock}</small>
                        </button>
                    `).join('');
                }
            });
        }
    });
}

// ==================== SALES TARGET ====================
function setSalesTarget() {
    const currentTarget = loadFromLocalStorage('monthly_sales_target', 0);
    
    Swal.fire({
        title: 'Target Penjualan Bulanan',
        html: `
            <div class="mb-3">
                <label class="form-label">Target Penjualan (Rp)</label>
                <input type="number" class="form-control" id="salesTargetInput" value="${currentTarget}" placeholder="0">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            return parseFloat(document.getElementById('salesTargetInput').value) || 0;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveToLocalStorage('monthly_sales_target', result.value);
            showNotification('Target penjualan berhasil disimpan', 'success');
            updateSalesTargetDisplay();
        }
    });
}

function updateSalesTargetDisplay() {
    const target = loadFromLocalStorage('monthly_sales_target', 0);
    
    // Calculate current month sales
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, t) => sum + t.total, 0);
    
    const percentage = target > 0 ? Math.min((monthlySales / target) * 100, 100) : 0;
    
    // Update dashboard elements
    const targetDisplay = document.getElementById('salesTargetDisplay');
    const targetPercentage = document.getElementById('targetPercentage');
    const targetProgressBar = document.getElementById('targetProgressBar');
    const currentSales = document.getElementById('currentSales');
    const targetSales = document.getElementById('targetSales');
    
    if (targetDisplay) {
        if (target > 0) {
            targetDisplay.style.display = 'block';
            if (targetPercentage) targetPercentage.textContent = percentage.toFixed(1) + '%';
            if (targetProgressBar) targetProgressBar.style.width = percentage + '%';
            if (currentSales) currentSales.textContent = formatCurrency(monthlySales);
            if (targetSales) targetSales.textContent = formatCurrency(target);
        } else {
            targetDisplay.style.display = 'none';
        }
    }
}

// ==================== INITIALIZE ALL FEATURES ====================
function initializeAdditionalFeatures() {
    initializeAutoBackup();
    initializeLowStockNotifications();
    initializeDarkMode();
    initializeKeyboardShortcuts();
    initializeQuickSearch();
    updateSalesTargetDisplay();
}

// Export functions
window.showBackupSettings = showBackupSettings;
window.toggleDarkMode = toggleDarkMode;
window.exportToCSV = exportToCSV;
window.exportProductsToCSV = exportProductsToCSV;
window.exportTransactionsToCSV = exportTransactionsToCSV;
window.showExportOptions = showExportOptions;
window.showQuickSearch = showQuickSearch;
window.setSalesTarget = setSalesTarget;
window.initializeAdditionalFeatures = initializeAdditionalFeatures;

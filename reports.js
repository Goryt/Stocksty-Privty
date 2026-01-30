// Additional Functions for Reports and Business Ideas

// Business Ideas Functions
function initializeBusinessIdeas() {
    loadBusinessIdeas();
    displayBusinessIdeas();
}

function loadBusinessIdeas() {
    // Load from AI recommendations or generate new ones
    const businessIdeas = window.aiRecommendations.filter(item => item.type === 'business_idea');
    
    if (businessIdeas.length === 0) {
        generateDefaultBusinessIdeas();
    }
}

function generateDefaultBusinessIdeas() {
    const defaultIdeas = [
        {
            id: generateId(),
            type: 'business_idea',
            title: 'Warung Makan Padang Mini',
            content: 'Modal kecil, untung besar. HPP per porsi Rp 8.000, harga jual Rp 18.000. Target: karyawan dan keluarga. Buka di area perkantoran.',
            category: 'makanan',
            priority: 'high',
            profit: 55,
            capital: 'low',
            difficulty: 'easy',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            type: 'business_idea',
            title: 'Es Kopi Susu Gula Aren Viral',
            content: 'Favorit anak muda! Bisa dijual di kampus dan area perkantoran. HPP Rp 4.000/cangkir, harga jual Rp 12.000. Bisa delivery.',
            category: 'minuman',
            priority: 'high',
            profit: 66,
            capital: 'low',
            difficulty: 'easy',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            type: 'business_idea',
            title: 'Chiki Balls Homemade',
            content: 'Snack sehat untuk anak-anak. Bisa dijual online dan offline. HPP Rp 3.000/pack, harga jual Rp 8.000. Tahan lama.',
            category: 'snack',
            priority: 'medium',
            profit: 62,
            capital: 'low',
            difficulty: 'easy',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            type: 'business_idea',
            title: 'Jasa Cuci & Setrika',
            content: 'Permintaan tinggi, kompetitor sedang. Modal Rp 3 juta untuk mesin cuci. Target: ibu rumah tangga dan karyawan.',
            category: 'jasa',
            priority: 'medium',
            profit: 45,
            capital: 'medium',
            difficulty: 'medium',
            created_at: new Date().toISOString()
        }
    ];
    
    defaultIdeas.forEach(idea => {
        window.aiRecommendations.push(idea);
    });
    
    window.saveAIRecommendations && window.saveAIRecommendations();
}

function displayBusinessIdeas(filterCategory = null) {
    const container = document.getElementById('businessIdeasContainer');
    if (!container) return;
    
    const filteredIdeas = filterCategory 
        ? window.aiRecommendations.filter(item => item.type === 'business_idea' && item.category === filterCategory)
        : window.aiRecommendations.filter(item => item.type === 'business_idea');
    
    if (filteredIdeas.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-2">Tidak ada ide bisnis untuk kategori ini.</p>
                <button class="btn btn-primary" onclick="showBusinessIdeasAI()">
                    <i class="bi bi-robot"></i> Generate dengan AI
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredIdeas.map(idea => `
        <div class="col-lg-6 mb-4">
            <div class="card idea-card h-100">
                <div class="card-body">
                    <div class="row">
                        <div class="col-8">
                            <h6 class="mb-2">${idea.title}</h6>
                            <p class="mb-3">${idea.content}</p>
                            <div class="d-flex gap-2 mb-2">
                                <span class="badge bg-success">Profit ${idea.profit}%</span>
                                <span class="badge bg-primary">${getCapitalLabel(idea.capital)}</span>
                                <span class="badge bg-warning">${getDifficultyLabel(idea.difficulty)}</span>
                            </div>
                            <small class="text-muted">
                                <i class="bi bi-tag"></i> ${getCategoryLabel(idea.category)}
                            </small>
                        </div>
                        <div class="col-4 text-end">
                            <div class="mb-2">
                                <i class="bi bi-lightbulb text-warning fs-1"></i>
                            </div>
                            <button class="btn btn-outline-primary btn-sm" onclick="saveBusinessIdea('${idea.title}', '${idea.content.replace(/'/g, "\\'")}')">
                                <i class="bi bi-save"></i> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterBusinessIdeas(category) {
    displayBusinessIdeas(category);
    
    // Update active state
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.closest('.category-item').classList.add('active');
}

function refreshBusinessIdeas() {
    displayBusinessIdeas();
    showNotification('Ide bisnis berhasil diperbarui', 'success');
}

// Reports Functions
function initializeReports() {
    generateCompleteReport();
    updateBusinessInsights();
}

function generateCompleteReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate monthly summary
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const totalSales = monthlyTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalProfit = monthlyTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
    const transactionCount = monthlyTransactions.length;
    
    // Calculate growth vs last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonth && 
               transactionDate.getFullYear() === lastMonthYear;
    });
    
    const lastMonthSales = lastMonthTransactions.reduce((sum, t) => sum + t.total, 0);
    const growth = lastMonthSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales * 100) : 0;
    
    // Update UI
    document.getElementById('totalSalesReport').textContent = formatCurrency(totalSales);
    document.getElementById('performanceReport').textContent = (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
    
    // Update report table
    const reportTableBody = document.getElementById('reportTableBody');
    if (reportTableBody) {
        const categoryData = generateCategoryReport();
        
        reportTableBody.innerHTML = categoryData.map(item => `
            <tr>
                <td>
                    <strong>${item.category}</strong>
                    <br><small class="text-muted">${item.count} produk</small>
                </td>
                <td>
                    <strong>${formatCurrency(item.sales)}</strong>
                    <br><small class="text-muted">${item.percentage}% dari total</small>
                </td>
                <td>
                    <span class="badge ${item.growth >= 0 ? 'bg-success' : 'bg-danger'}">
                        ${item.growth >= 0 ? '+' : ''}${item.growth.toFixed(1)}%
                    </span>
                </td>
                <td>
                    <span class="badge ${getStatusBadge(item.status)}">${item.status}</span>
                </td>
            </tr>
        `).join('');
    }
}

function generateCategoryReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const categoryData = {};
    
    // Group by category
    monthlyTransactions.forEach(transaction => {
        if (transaction.items && Array.isArray(transaction.items)) {
            transaction.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const category = getCategoryLabel(product.category);
                    
                    if (!categoryData[category]) {
                        categoryData[category] = {
                            category: category,
                            sales: 0,
                            count: 0,
                            lastMonthSales: 0
                        };
                    }
                    
                    categoryData[category].sales += item.total;
                    categoryData[category].count++;
                }
            });
        }
    });
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonth && 
               transactionDate.getFullYear() === lastMonthYear;
    });
    
    // Calculate last month sales for each category
    lastMonthTransactions.forEach(transaction => {
        if (transaction.items && Array.isArray(transaction.items)) {
            transaction.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const category = getCategoryLabel(product.category);
                    if (categoryData[category]) {
                        categoryData[category].lastMonthSales += item.total;
                    }
                }
            });
        }
    });
    
    // Calculate totals and percentages
    const totalSales = Object.values(categoryData).reduce((sum, item) => sum + item.sales, 0);
    
    return Object.values(categoryData).map(item => {
        const percentage = totalSales > 0 ? (item.sales / totalSales * 100) : 0;
        const growth = item.lastMonthSales > 0 ? ((item.sales - item.lastMonthSales) / item.lastMonthSales * 100) : 0;
        
        let status = 'Stabil';
        if (growth > 20) status = 'Tumbuh Pesat';
        else if (growth > 10) status = 'Berkembang';
        else if (growth < -10) status = 'Menurun';
        
        return {
            ...item,
            percentage: percentage.toFixed(1),
            growth: growth,
            status: status
        };
    }).sort((a, b) => b.sales - a.sales);
}

function updateBusinessInsights() {
    // Top products insight
    const topProductsInsight = document.getElementById('topProductsInsight');
    if (topProductsInsight) {
        const topProducts = getTopProducts(3);
        topProductsInsight.innerHTML = topProducts.map(product => `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small>${product.name}</small>
                <small class="text-success">${formatCurrency(product.sales)}</small>
            </div>
        `).join('');
    }
    
    // Opportunities insight
    const opportunitiesInsight = document.getElementById('opportunitiesInsight');
    if (opportunitiesInsight) {
        const opportunities = getOpportunities();
        opportunitiesInsight.innerHTML = opportunities.map(opp => `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small>${opp.category}</small>
                <small class="text-success">+${opp.potential}%</small>
            </div>
        `).join('');
    }
    
    // Warnings insight
    const warningsInsight = document.getElementById('warningsInsight');
    if (warningsInsight) {
        const warnings = getWarnings();
        warningsInsight.innerHTML = warnings.length > 0 ? warnings.map(warning => `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small>${warning.issue}</small>
                <small class="text-danger">${warning.urgency}</small>
            </div>
        `).join('') : '<small class="text-success">Tidak ada masalah yang perlu perhatian</small>';
    }
}

function getTopProducts(limit = 3) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const productSales = {};
    
    monthlyTransactions.forEach(transaction => {
        if (transaction.items && Array.isArray(transaction.items)) {
            transaction.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    if (!productSales[product.id]) {
                        productSales[product.id] = {
                            id: product.id,
                            name: product.name,
                            sales: 0
                        };
                    }
                    productSales[product.id].sales += item.total;
                }
            });
        }
    });
    
    return Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
}

function getOpportunities() {
    // Simple opportunity detection based on trends
    const opportunities = [];
    
    // Check for growing categories
    const categoryData = generateCategoryReport();
    categoryData.forEach(item => {
        if (item.growth > 15) {
            opportunities.push({
                category: item.category,
                potential: item.growth
            });
        }
    });
    
    return opportunities;
}

function getWarnings() {
    const warnings = [];
    
    // Check for low stock products
    const lowStockProducts = products.filter(p => p.stock <= 10);
    if (lowStockProducts.length > 0) {
        warnings.push({
            issue: `${lowStockProducts.length} produk stok menipis`,
            urgency: 'Segera'
        });
    }
    
    // Check for declining categories
    const categoryData = generateCategoryReport();
    const decliningCategories = categoryData.filter(item => item.growth < -10);
    if (decliningCategories.length > 0) {
        warnings.push({
            issue: `${decliningCategories.length} kategori penjualan menurun`,
            urgency: 'Perhatian'
        });
    }
    
    return warnings;
}

function exportCompleteReport() {
    const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
            totalProfit: transactions.reduce((sum, t) => sum + (t.profit || 0), 0),
            totalTransactions: transactions.length,
            totalProducts: products.length
        },
        topProducts: getTopProducts(5),
        categoryReport: generateCategoryReport(),
        opportunities: getOpportunities(),
        warnings: getWarnings()
    };
    
    // Create and download file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `complete-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Laporan lengkap berhasil diekspor', 'success');
}

// Helper functions
function getCapitalLabel(capital) {
    const labels = {
        low: 'Modal Kecil',
        medium: 'Modal Menengah',
        high: 'Modal Besar'
    };
    return labels[capital] || capital;
}

function getStatusBadge(status) {
    const badges = {
        'Tumbuh Pesat': 'bg-success',
        'Berkembang': 'bg-info',
        'Stabil': 'bg-secondary',
        'Menurun': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
}

// Export functions
window.displayBusinessIdeas = displayBusinessIdeas;
window.filterBusinessIdeas = filterBusinessIdeas;
window.refreshBusinessIdeas = refreshBusinessIdeas;
window.generateCompleteReport = generateCompleteReport;
window.exportCompleteReport = exportCompleteReport;
window.initializeReports = initializeReports;
window.initializeBusinessIdeas = initializeBusinessIdeas;
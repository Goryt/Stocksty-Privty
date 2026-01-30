// Dashboard Functions
let salesChart = null;
let topProductsChart = null;
let financeChart = null;
let profitLossChart = null;

function initializeDashboard() {
    updateDashboardStats();
    initializeSalesChart();
    initializeTopProductsChart();
    loadDashboardData();
}

function updateDashboardStats() {
    const today = new Date();
    const todayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === today.toDateString();
    });

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const todayProfit = todayTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);

    // Monthly stats
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.total, 0);
    const monthlyProfit = monthlyTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);

    // Calculate profit margin
    const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue * 100) : 0;

    // Update UI
    updateElement('todaySales', formatCurrency(todaySales));
    updateElement('monthlyRevenue', formatCurrency(monthlyRevenue));
    updateElement('totalTransactions', formatNumber(todayTransactions.length));
    updateElement('profitMargin', profitMargin.toFixed(1) + '%');

    // Update change indicators
    updateChangeIndicator('todaySales', calculateChange(todaySales, getYesterdaySales()));
    updateChangeIndicator('monthlyRevenue', calculateChange(monthlyRevenue, getLastMonthRevenue()));
}

function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function updateChangeIndicator(elementId, change) {
    const element = document.getElementById(elementId);
    if (element) {
        const changeElement = element.parentElement.querySelector('.stat-change');
        if (changeElement) {
            const changeText = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
            const changeClass = change >= 0 ? 'text-success' : 'text-danger';
            changeElement.textContent = changeText;
            changeElement.className = `stat-change ${changeClass}`;
        }
    }
}

function calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100);
}

function getYesterdaySales() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === yesterday.toDateString();
    });

    return yesterdayTransactions.reduce((sum, t) => sum + t.total, 0);
}

function getLastMonthRevenue() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonth.getMonth() && 
               transactionDate.getFullYear() === lastMonth.getFullYear();
    });

    return lastMonthTransactions.reduce((sum, t) => sum + t.total, 0);
}

function initializeSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }

    const chartData = generateSalesChartData();
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Penjualan',
                data: chartData.sales,
                borderColor: '#6366f1',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Profit',
                data: chartData.profit,
                borderColor: '#10b981',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    titleColor: isDarkMode ? '#f8fafc' : '#1e293b',
                    bodyColor: isDarkMode ? '#94a3b8' : '#64748b',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function initializeTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (topProductsChart) {
        topProductsChart.destroy();
    }

    const chartData = generateTopProductsData();
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    
    topProductsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: [
                    '#6366f1',
                    '#8b5cf6',
                    '#d946ef',
                    '#06b6d4',
                    '#10b981'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    titleColor: isDarkMode ? '#f8fafc' : '#1e293b',
                    bodyColor: isDarkMode ? '#94a3b8' : '#64748b',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function generateSalesChartData() {
    const period = document.getElementById('salesPeriod')?.value || '7';
    const days = parseInt(period);
    
    const labels = [];
    const sales = [];
    const profit = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.toDateString() === date.toDateString();
        });
        
        const daySales = dayTransactions.reduce((sum, t) => sum + t.total, 0);
        const dayProfit = dayTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
        
        labels.push(date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }));
        sales.push(daySales);
        profit.push(dayProfit);
    }
    
    return { labels, sales, profit };
}

function generateTopProductsData() {
    const productSales = {};
    
    // Calculate total sales per product
    transactions.forEach(transaction => {
        if (transaction.items && Array.isArray(transaction.items)) {
            transaction.items.forEach(item => {
                if (item.productId) {
                    productSales[item.productId] = (productSales[item.productId] || 0) + (item.quantity || 0);
                }
            });
        }
    });
    
    // Sort and get top 5
    const sortedProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const labels = sortedProducts.map(([productId]) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    });
    
    const values = sortedProducts.map(([,quantity]) => quantity);
    
    return { labels, values };
}

function updateSalesChart() {
    if (salesChart) {
        const newData = generateSalesChartData();
        salesChart.data.labels = newData.labels;
        salesChart.data.datasets[0].data = newData.sales;
        salesChart.data.datasets[1].data = newData.profit;
        salesChart.update();
    }
    
    if (topProductsChart) {
        const topData = generateTopProductsData();
        topProductsChart.data.labels = topData.labels;
        topProductsChart.data.datasets[0].data = topData.values;
        topProductsChart.update();
    }
}

function loadDashboardData() {
    // Simulate loading data
    setTimeout(() => {
        updateDashboardStats();
        
        // Update charts if they exist
        if (salesChart) {
            const newData = generateSalesChartData();
            salesChart.data = {
                labels: newData.labels,
                datasets: [{
                    label: 'Penjualan',
                    data: newData.sales,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Profit',
                    data: newData.profit,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            };
            salesChart.update();
        }
        
        if (topProductsChart) {
            const topData = generateTopProductsData();
            topProductsChart.data.labels = topData.labels;
            topProductsChart.data.datasets[0].data = topData.values;
            topProductsChart.update();
        }
    }, 1000);
}

// Financial Dashboard Functions
function initializeFinance() {
    const financePeriod = document.getElementById('financePeriod');
    if (financePeriod) {
        financePeriod.addEventListener('change', updateFinanceChart);
    }
    
    updateFinanceChart();
}

function updateFinanceChart() {
    const period = document.getElementById('financePeriod')?.value || 'daily';
    const ctx = document.getElementById('financeChart');
    
    if (!ctx) return;
    
    const chartData = generateFinanceChartData(period);
    
    if (window.financeChart) {
        window.financeChart.destroy();
    }
    
    window.financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Pendapatan',
                data: chartData.revenue,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 1
            }, {
                label: 'Pengeluaran',
                data: chartData.expenses,
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: '#dc3545',
                borderWidth: 1
            }, {
                label: 'Profit',
                data: chartData.profit,
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: '#28a745',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
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

function generateFinanceChartData(period) {
    const labels = [];
    const revenue = [];
    const expenses = [];
    const profit = [];
    
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
            profit.push(dayProfit);
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
            profit.push(weekProfit);
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
            profit.push(monthProfit);
        }
    }
    
    return { labels, revenue, expenses, profit };
}

// Export functions for use in other modules
window.updateDashboardStats = updateDashboardStats;
window.initializeDashboard = initializeDashboard;
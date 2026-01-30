// Global Variables
let currentSection = 'dashboard';
let products = [];
let cart = [];
let transactions = [];
let salesData = [];
let charts = {};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
        loadInitialData();
        setupEventListeners();
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Initialize dashboard only to avoid conflicts
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        }
        
        // Initialize additional features
        if (typeof initializeAdditionalFeatures === 'function') {
            initializeAdditionalFeatures();
        }
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Simple load transactions function
function loadTransactions() {
    transactions = loadFromLocalStorage('transactions', []);
    if (transactions.length === 0) {
        transactions = createSampleTransactions();
        saveToLocalStorage('transactions', transactions);
    }
}


// Create sample transactions
function createSampleTransactions() {
    const sampleTransactions = [];
    const today = new Date();
    
    // Create transactions for the last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Create 1-2 transactions per day
        const transactionsPerDay = Math.floor(Math.random() * 2) + 1;
        
        for (let j = 0; j < transactionsPerDay; j++) {
            const transactionDate = new Date(date);
            transactionDate.setHours(Math.floor(Math.random() * 24));
            
            const items = [];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            let total = 0;
            let profit = 0;
            
            for (let k = 0; k < itemCount; k++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const itemTotal = product.price * quantity;
                const itemProfit = (product.price - product.hpp) * quantity;
                
                items.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: quantity,
                    price: product.price,
                    total: itemTotal
                });
                
                total += itemTotal;
                profit += itemProfit;
            }
            
            sampleTransactions.push({
                id: 'trans-' + Date.now() + '-' + i + j,
                date: transactionDate.toISOString(),
                total: total,
                profit: profit,
                payment_method: 'cash',
                items: items,
                status: 'completed'
            });
        }
    }
    
    return sampleTransactions;
}

// Simple load products function
function loadProducts() {
    products = loadFromLocalStorage('products', []);
    if (products.length === 0) {
        products = createSampleProducts();
        saveToLocalStorage('products', products);
    }
}

// Simple search products function
function searchProducts(searchTerm) {
    // This function will be implemented in products.js
    console.log('Search products:', searchTerm);
}

// Create sample products
function createSampleProducts() {
    return [
        {
            id: 'prod-001',
            name: 'Nasi Goreng Special',
            category: 'makanan',
            price: 15000,
            hpp: 8000,
            stock: 50,
            description: 'Nasi goreng dengan topping telur dan ayam',
            created_at: new Date().toISOString()
        },
        {
            id: 'prod-002',
            name: 'Es Teh Manis',
            category: 'minuman',
            price: 5000,
            hpp: 1500,
            stock: 100,
            description: 'Es teh manis segar',
            created_at: new Date().toISOString()
        },
        {
            id: 'prod-003',
            name: 'Mie Goreng',
            category: 'makanan',
            price: 12000,
            hpp: 6000,
            stock: 30,
            description: 'Mie goreng dengan sayuran',
            created_at: new Date().toISOString()
        }
    ];
}

// Initialize Application
function initializeApp() {
    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Initialize navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Initialize responsive behavior
    handleResize();
    window.addEventListener('resize', handleResize);
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load products
        await loadProducts();
        
        // Load transactions
        await loadTransactions();
        
        // Initialize dashboard
        if (currentSection === 'dashboard') {
            initializeDashboard();
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Error loading data', 'error');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Product search
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(searchProducts, 300));
    }

    // Sales period filter
    const salesPeriod = document.getElementById('salesPeriod');
    if (salesPeriod) {
        salesPeriod.addEventListener('change', updateSalesChart);
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
}

// Navigation Functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update nav link
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Update page title
    updatePageTitle(sectionName);
    
    // Initialize section-specific functionality
    initializeSection(sectionName);
    
    currentSection = sectionName;
}

function updatePageTitle(sectionName) {
    const titles = {
        dashboard: 'Dashboard',
        pos: 'Kasir POS',
        products: 'Manajemen Produk',
        finance: 'Keuangan',
        inventory: 'Inventory',
        'ai-tools': 'AI Tools',
        reports: 'Laporan',
        'business-ideas': 'Ide Bisnis'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }
}

function initializeSection(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'pos':
            initializePOS();
            break;
        case 'products':
            initializeProducts();
            break;
        case 'ai-tools':
            initializeAITools();
            break;
        case 'finance':
            initializeFinance();
            initializeInventory();
            break;
        case 'business-ideas':
            initializeBusinessIdeas();
            break;
        case 'reports':
            initializeReports();
            break;
    }
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            mainContent.style.marginLeft = '0';
        } else {
            mainContent.style.marginLeft = '0';
        }
    }
}

function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        mainContent.style.marginLeft = '0';
    } else {
        sidebar.classList.remove('active');
        mainContent.style.marginLeft = '260px';
    }
}

// Date Time Functions
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Notification Functions
function showNotification(message, type = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
}

function showConfirmDialog(title, text, confirmButtonText = 'Ya', cancelButtonText = 'Batal') {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#6c757d',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText
    });
}

// Loading Functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"></div>';
    }
}

function hideLoading(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

// Settings Functions
function showSettings() {
    const darkModeEnabled = document.body.classList.contains('dark-mode');
    const autoBackupEnabled = loadFromLocalStorage('auto_backup_enabled', false);

    Swal.fire({
        title: 'Pengaturan',
        html: `
            <div class="text-start">
                <h6><i class="bi bi-palette"></i> Tampilan</h6>
                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="darkModeToggle" ${darkModeEnabled ? 'checked' : ''}>
                    <label class="form-check-label" for="darkModeToggle">
                        Mode Gelap
                    </label>
                </div>
                <hr>
                <h6><i class="bi bi-bell"></i> Notifikasi</h6>
                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="enableNotifications" checked>
                    <label class="form-check-label" for="enableNotifications">
                        Aktifkan Notifikasi Stok Menipis
                    </label>
                </div>
                <hr>
                <h6><i class="bi bi-cloud-arrow-up"></i> Backup & Export</h6>
                <div class="d-grid gap-2 mb-3">
                    <button class="btn btn-outline-primary btn-sm" onclick="showBackupSettings()">
                        <i class="bi bi-clock-history"></i> Pengaturan Backup Otomatis
                    </button>
                    <button class="btn btn-outline-success btn-sm" onclick="showExportOptions()">
                        <i class="bi bi-file-earmark-spreadsheet"></i> Export ke CSV/Excel
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="exportData()">
                        <i class="bi bi-download"></i> Export Data (JSON)
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="importData()">
                        <i class="bi bi-upload"></i> Import Data
                    </button>
                </div>
                <hr>
                <h6><i class="bi bi-bullseye"></i> Target</h6>
                <button class="btn btn-outline-warning btn-sm w-100" onclick="setSalesTarget()">
                    <i class="bi bi-graph-up"></i> Atur Target Penjualan
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: () => {
            // Add event listener for dark mode toggle
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.addEventListener('change', (e) => {
                    toggleDarkMode();
                });
            }
        }
    });
}

// Data Export/Import Functions
function exportData() {
    const data = {
        products: products,
        transactions: transactions,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `umkm-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Data berhasil diekspor', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.products) {
                        products = data.products;
                        saveProducts();
                    }
                    
                    if (data.transactions) {
                        transactions = data.transactions;
                        saveTransactions();
                    }
                    
                    showNotification('Data berhasil diimpor', 'success');
                    loadInitialData();
                } catch (error) {
                    showNotification('Error mengimpor data', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Storage Functions
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

// Initialize App
window.showSection = showSection;
window.exportData = exportData;
window.importData = importData;
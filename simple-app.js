// Simplified App Initialization - Emergency Version

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
        console.log('Starting UMKM Dashboard...');
        
        // Basic initialization
        initializeApp();
        
        // Load sample data
        loadSampleData();
        
        // Initialize dashboard only
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        }
        
        console.log('UMKM Dashboard loaded successfully!');
        
    } catch (error) {
        console.error('Critical error during initialization:', error);
        showErrorMessage('Terjadi kesalahan saat memuat aplikasi. Silakan refresh halaman.');
    }
});

// Simplified app initialization
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
    window.addEventListener('resize', handleResize);
    handleResize();
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Load sample data
function loadSampleData() {
    // Create sample products if none exist
    if (products.length === 0) {
        products = createSampleProducts();
        saveToLocalStorage('products', products);
    }
    
    // Create sample transactions if none exist
    if (transactions.length === 0) {
        transactions = createSampleTransactions();
        saveToLocalStorage('transactions', transactions);
    }
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

// Simplified functions
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

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('active');
}

function handleResize() {
    // Responsive behavior
}

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

function showErrorMessage(message) {
    Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

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

function loadInitialData() {
    // Load from localStorage
    products = loadFromLocalStorage('products', []);
    transactions = loadFromLocalStorage('transactions', []);
    
    // If no data, create sample data
    if (products.length === 0 && transactions.length === 0) {
        loadSampleData();
    }
}

function updateDashboardStats() {
    const today = new Date();
    const todayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === today.toDateString();
    });

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const monthlyRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = todayTransactions.length;
    const profitMargin = transactions.length > 0 ? 45 : 0; // Mock data

    // Update UI
    updateElement('todaySales', formatCurrency(todaySales));
    updateElement('monthlyRevenue', formatCurrency(monthlyRevenue));
    updateElement('totalTransactions', formatNumber(totalTransactions));
    updateElement('profitMargin', profitMargin.toFixed(1) + '%');
}

function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Export functions
window.showSection = showSection;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.generateId = generateId;
window.showNotification = showNotification;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;

// Initialize dashboard with simple version
if (typeof initializeDashboard === 'function') {
    window.initializeDashboard = function() {
        updateDashboardStats();
    };
}
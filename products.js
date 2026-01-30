// Product Management Functions
let currentProductId = null;
let productTable = null;

function initializeProducts() {
    loadProducts();
    initializeProductTable();
    
    // Setup modal event listeners
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('hidden.bs.modal', function () {
            resetProductForm();
        });
    }
}

async function loadProducts() {
    try {
        // Load from localStorage first
        products = loadFromLocalStorage('products', []);
        
        // If no products in localStorage, create sample data
        if (products.length === 0) {
            products = createSampleProducts();
            saveProducts();
        }
        
        // Try to load from API if available
        if (window.fetch) {
            const response = await fetch('tables/products');
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.data && apiData.data.length > 0) {
                    products = apiData.data;
                }
            }
        }
        
        updateProductTable();
        updateProductList();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error memuat produk', 'error');
    }
}

function createSampleProducts() {
    return [
        {
            id: generateId(),
            name: 'Nasi Goreng Special',
            category: 'makanan',
            price: 15000,
            hpp: 8000,
            stock: 50,
            description: 'Nasi goreng dengan topping telur dan ayam',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Es Teh Manis',
            category: 'minuman',
            price: 5000,
            hpp: 1500,
            stock: 100,
            description: 'Es teh manis segar',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Mie Goreng',
            category: 'makanan',
            price: 12000,
            hpp: 6000,
            stock: 30,
            description: 'Mie goreng dengan sayuran',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Kopi Hitam',
            category: 'minuman',
            price: 7000,
            hpp: 2500,
            stock: 80,
            description: 'Kopi hitam original',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Roti Bakar',
            category: 'snack',
            price: 8000,
            hpp: 3500,
            stock: 25,
            description: 'Roti bakar dengan topping coklat',
            created_at: new Date().toISOString()
        }
    ];
}

function initializeProductTable() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    // Add sorting functionality
    const headers = document.querySelectorAll('#productsTable th');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const column = this.textContent.trim();
            sortProducts(column);
        });
    });
}

function updateProductTable() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    products.forEach(product => {
        const row = createProductRow(product);
        tableBody.appendChild(row);
    });
}

function createProductRow(product) {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    
    const margin = calculateMargin(product.price, product.hpp);
    const marginClass = margin >= 50 ? 'text-success' : margin >= 30 ? 'text-warning' : 'text-danger';
    
    row.innerHTML = `
        <td>${product.id.substring(0, 8)}</td>
        <td>
            <strong>${product.name}</strong>
            <br><small class="text-muted">${product.description || '-'}</small>
        </td>
        <td>
            <span class="badge bg-primary">${getCategoryLabel(product.category)}</span>
        </td>
        <td><strong>${formatCurrency(product.price)}</strong></td>
        <td>${formatCurrency(product.hpp)}</td>
        <td>
            <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                ${product.stock}
            </span>
        </td>
        <td class="${marginClass}">
            <strong>${margin.toFixed(1)}%</strong>
        </td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-outline-info" onclick="duplicateProduct('${product.id}')" title="Duplicate">
                    <i class="bi bi-copy"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

function updateProductList() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
    
    const margin = calculateMargin(product.price, product.hpp);
    
    card.innerHTML = `
        <div class="card product-card h-100" onclick="addToCart('${product.id}')">
            <div class="product-image">
                <i class="bi bi-box-seam"></i>
            </div>
            <div class="product-info">
                <h6 class="product-name">${product.name}</h6>
                <small class="text-muted d-block mb-2">${getCategoryLabel(product.category)}</small>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                        Stok: ${product.stock}
                    </span>
                </div>
                <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar bg-success" style="width: ${margin}%"></div>
                </div>
                <small class="text-muted">Margin: ${margin.toFixed(1)}%</small>
            </div>
        </div>
    `;
    
    return card;
}

function showProductModal(productId = null) {
    currentProductId = productId;
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const title = document.getElementById('productModalTitle');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            title.textContent = 'Edit Produk';
            fillProductForm(product);
        }
    } else {
        title.textContent = 'Tambah Produk Baru';
        resetProductForm();
    }
    
    modal.show();
}

function fillProductForm(product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productHPP').value = product.hpp;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description || '';
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    currentProductId = null;
}

function saveProduct() {
    const formData = getProductFormData();
    
    if (!validateProductForm(formData)) {
        return;
    }
    
    if (currentProductId) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...formData };
            showNotification('Produk berhasil diupdate', 'success');
        }
    } else {
        // Create new product
        const newProduct = {
            id: generateId(),
            ...formData,
            created_at: new Date().toISOString()
        };
        products.push(newProduct);
        showNotification('Produk berhasil ditambahkan', 'success');
    }
    
    saveProducts();
    updateProductTable();
    updateProductList();
    updateDashboardStats();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();
    
    resetProductForm();
}

function getProductFormData() {
    return {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value) || 0,
        hpp: parseInt(document.getElementById('productHPP').value) || 0,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        description: document.getElementById('productDescription').value.trim()
    };
}

function validateProductForm(data) {
    if (!data.name) {
        showNotification('Nama produk harus diisi', 'error');
        return false;
    }
    
    if (!data.category) {
        showNotification('Kategori harus dipilih', 'error');
        return false;
    }
    
    if (data.price <= 0) {
        showNotification('Harga jual harus lebih dari 0', 'error');
        return false;
    }
    
    if (data.hpp <= 0) {
        showNotification('HPP harus lebih dari 0', 'error');
        return false;
    }
    
    if (data.price <= data.hpp) {
        showNotification('Harga jual harus lebih tinggi dari HPP', 'warning');
    }
    
    return true;
}

function editProduct(productId) {
    showProductModal(productId);
}

function deleteProduct(productId) {
    showConfirmDialog(
        'Hapus Produk',
        'Apakah Anda yakin ingin menghapus produk ini?'
    ).then((result) => {
        if (result.isConfirmed) {
            products = products.filter(p => p.id !== productId);
            saveProducts();
            updateProductTable();
            updateProductList();
            updateDashboardStats();
            showNotification('Produk berhasil dihapus', 'success');
        }
    });
}

function duplicateProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const duplicatedProduct = {
            ...product,
            id: generateId(),
            name: `${product.name} (Copy)`,
            created_at: new Date().toISOString()
        };
        
        products.push(duplicatedProduct);
        saveProducts();
        updateProductTable();
        updateProductList();
        showNotification('Produk berhasil diduplikasi', 'success');
    }
}

function searchProducts(searchTerm) {
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    updateFilteredProductList(filteredProducts);
}

function updateFilteredProductList(filteredProducts) {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

function sortProducts(column) {
    // Sort products based on column
    let sortedProducts = [...products];
    
    switch (column) {
        case 'Nama Produk':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'Harga Jual':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'HPP':
            sortedProducts.sort((a, b) => b.hpp - a.hpp);
            break;
        case 'Stok':
            sortedProducts.sort((a, b) => b.stock - a.stock);
            break;
        case 'Margin':
            sortedProducts.sort((a, b) => {
                const marginA = calculateMargin(a.price, a.hpp);
                const marginB = calculateMargin(b.price, b.hpp);
                return marginB - marginA;
            });
            break;
    }
    
    products = sortedProducts;
    updateProductTable();
}

// Utility Functions
function calculateMargin(price, hpp) {
    if (hpp === 0) return 100;
    return ((price - hpp) / price * 100);
}

function getCategoryLabel(category) {
    const labels = {
        makanan: 'Makanan',
        minuman: 'Minuman',
        snack: 'Snack',
        sembako: 'Sembako',
        lainnya: 'Lainnya'
    };
    return labels[category] || category;
}

function saveProducts() {
    saveToLocalStorage('products', products);
    
    // Save to API if available
    if (window.fetch && products.length > 0) {
        fetch('tables/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rows: products })
        }).catch(error => console.error('Error saving products to API:', error));
    }
}

function loadTransactions() {
    transactions = loadFromLocalStorage('transactions', []);
    
    // If no transactions, create sample data
    if (transactions.length === 0) {
        transactions = createSampleTransactions();
        saveTransactions();
    }
}

function saveTransactions() {
    saveToLocalStorage('transactions', transactions);
}

function createSampleTransactions() {
    const sampleTransactions = [];
    const today = new Date();
    
    // Create transactions for the last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Create 1-3 transactions per day
        const transactionsPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < transactionsPerDay; j++) {
            const transactionDate = new Date(date);
            transactionDate.setHours(Math.floor(Math.random() * 24));
            transactionDate.setMinutes(Math.floor(Math.random() * 60));
            
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
                id: generateId(),
                date: transactionDate.toISOString(),
                total: total,
                profit: profit,
                payment_method: ['cash', 'qris'][Math.floor(Math.random() * 2)],
                items: items,
                status: 'completed'
            });
        }
    }
    
    return sampleTransactions;
}

// Export functions
window.showProductModal = showProductModal;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.duplicateProduct = duplicateProduct;
window.searchProducts = searchProducts;
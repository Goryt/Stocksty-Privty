// POS (Point of Sale) Functions
let currentTransaction = null;

// Use global window.cart from app.js
function initializePOS() {
    loadProducts();
    updateCartDisplay();
    
    // Setup event listeners
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(searchPOSProducts, 300));
    }
}

function searchPOSProducts(searchTerm) {
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    updateFilteredPOSProducts(filteredProducts);
}

function updateFilteredPOSProducts(filteredProducts) {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        showNotification('Stok produk habis', 'error');
        return;
    }

    const existingItem = window.cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showNotification('Jumlah melebihi stok yang tersedia', 'warning');
            return;
        }
    } else {
        window.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            hpp: product.hpp,
            quantity: 1,
            category: product.category,
            maxStock: product.stock
        });
    }
    
    updateCartDisplay();
    showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;

    if (window.cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted">Keranjang kosong</p>';
        if (cartTotal) {
            cartTotal.style.display = 'none';
        }
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    window.cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'window.cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h6 class="mb-1">${item.name}</h6>
                <small class="text-muted">${formatCurrency(item.price)} × ${item.quantity}</small>
            </div>
            <div class="cart-item-actions">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" onclick="updateCartQuantity(${index}, -1)">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="px-2 d-flex align-items-center">${item.quantity}</span>
                    <button class="btn btn-outline-secondary" onclick="updateCartQuantity(${index}, 1)" 
                            ${item.quantity >= item.maxStock ? 'disabled' : ''}>
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
                <button class="btn btn-outline-danger btn-sm ms-2" onclick="removeFromCart(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update total
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    if (cartTotal) {
        cartTotal.style.display = 'block';
    }
}

function updateCartQuantity(index, change) {
    const item = window.cart[index];
    if (!item) return;

    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    if (newQuantity > item.maxStock) {
        showNotification('Jumlah melebihi stok yang tersedia', 'warning');
        return;
    }
    
    item.quantity = newQuantity;
    updateCartDisplay();
}

function removeFromCart(index) {
    const item = window.cart[index];
    if (!item) return;

    window.cart.splice(index, 1);
    updateCartDisplay();
    showNotification(`${item.name} dihapus dari keranjang`, 'info');
}

function clearCart() {
    window.cart = [];
    updateCartDisplay();
}

function processPayment() {
    if (window.cart.length === 0) {
        showNotification('Keranjang masih kosong', 'error');
        return;
    }

    // Calculate totals
    const subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalProfit = window.cart.reduce((sum, item) => sum + ((item.price - item.hpp) * item.quantity), 0);
    
    // Show payment modal
    showPaymentModal(subtotal, totalProfit);
}

function showPaymentModal(subtotal, profit) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Pembayaran</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Subtotal</label>
                        <input type="text" class="form-control" value="${formatCurrency(subtotal)}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Diskon (%)</label>
                        <input type="number" class="form-control" id="discountPercent" value="0" min="0" max="100">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Total Setelah Diskon</label>
                        <input type="text" class="form-control" id="totalAfterDiscount" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Metode Pembayaran</label>
                        <select class="form-select" id="paymentMethod">
                            <option value="cash">Cash</option>
                            <option value="qris">QRIS</option>
                            <option value="transfer">Transfer Bank</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Uang yang Diterima</label>
                        <input type="number" class="form-control" id="receivedAmount" placeholder="0">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Kembalian</label>
                        <input type="text" class="form-control" id="changeAmount" readonly>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="button" class="btn btn-success" onclick="completePayment(${subtotal}, ${profit})">
                        <i class="bi bi-check-circle"></i> Proses Pembayaran
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Setup event listeners
    const discountInput = modal.querySelector('#discountPercent');
    const receivedInput = modal.querySelector('#receivedAmount');
    
    function updateCalculations() {
        const discountPercent = parseFloat(discountInput.value) || 0;
        const discountAmount = subtotal * (discountPercent / 100);
        const totalAfterDiscount = subtotal - discountAmount;
        const receivedAmount = parseFloat(receivedInput.value) || 0;
        const change = receivedAmount - totalAfterDiscount;
        
        modal.querySelector('#totalAfterDiscount').value = formatCurrency(totalAfterDiscount);
        modal.querySelector('#changeAmount').value = formatCurrency(change);
    }
    
    discountInput.addEventListener('input', updateCalculations);
    receivedInput.addEventListener('input', updateCalculations);
    
    // Initial calculation
    updateCalculations();
    
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

function completePayment(subtotal, profit) {
    const discountPercent = parseFloat(document.getElementById('discountPercent')?.value) || 0;
    const paymentMethod = document.getElementById('paymentMethod')?.value || 'cash';
    const receivedAmount = parseFloat(document.getElementById('receivedAmount')?.value) || 0;
    
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAfterDiscount = subtotal - discountAmount;
    
    if (receivedAmount < totalAfterDiscount) {
        showNotification('Uang yang diterima kurang', 'error');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        total: totalAfterDiscount,
        profit: profit - (discountAmount * (profit / subtotal)), // Adjust profit for discount
        payment_method: paymentMethod,
        items: window.cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        status: 'completed'
    };
    
    // Add transaction
    transactions.push(transaction);
    saveTransactions();
    
    // Update product stock
    window.cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    
    saveProducts();
    
    // Clear window.cart
    clearCart();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
    if (modal) {
        modal.hide();
    }
    
    // Show success message
    const change = receivedAmount - totalAfterDiscount;
    showNotification(
        `Pembayaran berhasil! Kembalian: ${formatCurrency(change)}`,
        'success'
    );
    
    // Update dashboard
    updateDashboardStats();
    
    // Show receipt option
    showReceiptOption(transaction);
}

function showReceiptOption(transaction) {
    Swal.fire({
        title: 'Cetak Struk?',
        text: 'Pembayaran berhasil! Apakah Anda ingin mencetak struk?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Cetak Struk',
        cancelButtonText: 'Nanti'
    }).then((result) => {
        if (result.isConfirmed) {
            printReceipt(transaction);
        }
    });
}

function printReceipt(transaction) {
    const receiptWindow = window.open('', '_blank', 'width=300,height=600');
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Pembayaran</title>
            <style>
                body { font-family: monospace; font-size: 12px; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .item { margin: 5px 0; }
                .total { font-weight: bold; margin-top: 10px; }
                .footer { margin-top: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h3>UMKM TOKO</h3>
                <p>${new Date(transaction.date).toLocaleDateString('id-ID')}</p>
            </div>
            
            <div class="items">
                ${transaction.items.map(item => `
                    <div class="item">
                        ${item.productName} × ${item.quantity}
                        <span style="float: right">${formatCurrency(item.total)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="total">
                <hr>
                TOTAL: ${formatCurrency(transaction.total)}
                <br>Metode: ${transaction.payment_method.toUpperCase()}
            </div>
            
            <div class="footer">
                <p>Terima kasih atas pembelian Anda!</p>
            </div>
            
            <script>
                window.print();
                setTimeout(() => window.close(), 1000);
            </script>
        </body>
        </html>
    `;
    
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}

// Export functions for use in other modules
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.processPayment = processPayment;
window.completePayment = completePayment;
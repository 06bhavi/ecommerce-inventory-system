const API_URL = '/api/v1/products';
let products = [];
let isEditMode = false;
let currentView = 'list';
let currentCurrency = localStorage.getItem('inventory_currency') || 'USD';
const currencyRates = {
    'USD': 1,
    'EUR': 0.92,
    'INR': 83.50
};
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'INR': '₹'
};

// Chart instances
let categoryChart = null;
let trendChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize state
    initializeSettings();

    // Initial fetch
    fetchProducts();
    setupNavigation();
    setupViewToggles();
    setupSearch();

    // Form submit
    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
});

function initializeSettings() {
    const currencySelect = document.querySelector('#settings-section select');
    if (currencySelect) {
        currencySelect.value = Object.keys(currencySymbols).find(key => currencySymbols[key].includes(currencySelect.checkVisibility) ? key : null) || currentCurrency + ` (${currencySymbols[currentCurrency]})`;
        // match the format "USD ($)"
        // easier: just set by text index or value if values were standard. 
        // Let's loop options to set selected based on currentCurrency
        Array.from(currencySelect.options).forEach(opt => {
            if (opt.text.includes(currentCurrency)) {
                currencySelect.value = opt.text;
            }
        });

        currencySelect.addEventListener('change', (e) => {
            const val = e.target.value; // "USD ($)"
            if (val.includes('USD')) currentCurrency = 'USD';
            else if (val.includes('EUR')) currentCurrency = 'EUR';
            else if (val.includes('INR')) currentCurrency = 'INR';

            localStorage.setItem('inventory_currency', currentCurrency);
            // Re-render everything
            renderAllViews(products);
            renderStats(products);
        });
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const text = item.textContent.trim();
            let targetId = 'dashboard-section';

            if (text.includes('Dashboard')) targetId = 'dashboard-section';
            else if (text.includes('Products')) targetId = 'products-section';
            else if (text.includes('Analytics')) {
                targetId = 'analytics-section';
                renderAnalytics(products); // Refresh charts when entering
            }
            else if (text.includes('Settings')) targetId = 'settings-section';

            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
            }
        });
    });
}

function setupViewToggles() {
    const toggles = document.querySelectorAll('[data-view]');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view; // 'list' or 'grid'
            currentView = view;

            // Update UI buttons
            toggles.forEach(b => {
                if (b.dataset.view === view) b.classList.add('active');
                else b.classList.remove('active');
            });

            // Update Visibility
            toggleViewContainers();
        });
    });
}

function toggleViewContainers() {
    const listContainers = document.querySelectorAll('.table-container');
    const gridContainers = document.querySelectorAll('.inventory-grid');

    if (currentView === 'list') {
        listContainers.forEach(el => el.style.display = 'block');
        gridContainers.forEach(el => el.style.display = 'none');
    } else {
        listContainers.forEach(el => el.style.display = 'none');
        gridContainers.forEach(el => el.style.display = 'grid');
    }
}

function setupSearch() {
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.sku.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
        renderAllViews(filtered);
    };

    const dSearch = document.getElementById('searchInput');
    const pSearch = document.getElementById('productSearchInput');

    if (dSearch) dSearch.addEventListener('input', handleSearch);
    if (pSearch) pSearch.addEventListener('input', handleSearch);
}

async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.status === 'success') {
            products = data.data;
            renderAllViews(products);
            renderStats(products);
            renderAnalytics(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function formatPrice(amount) {
    const rate = currencyRates[currentCurrency];
    const val = amount * rate;
    return `${currencySymbols[currentCurrency]}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderAllViews(data) {
    renderTable(data, 'productTableBody');
    renderTable(data, 'allProductsTableBody');
    renderGrid(data, 'dashboard-grid-view');
    renderGrid(data, 'products-grid-view');
    toggleViewContainers(); // Ensure correct view is shown
}

function renderTable(data, elementId) {
    const tbody = document.getElementById(elementId);
    if (!tbody) return;

    tbody.innerHTML = '';

    data.forEach(p => {
        const stockStatus = getStockStatus(p.quantity);
        const row = `
            <tr>
                <td>
                    <div style="font-weight: 600;">${p.name}</div>
                    <div style="font-size: 0.8em; color: var(--text-muted);">${p.description ? p.description.substring(0, 30) + '...' : ''}</div>
                </td>
                <td style="font-family: monospace; color: var(--accent);">${p.sku}</td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; font-size: 0.85em;">${p.category || 'Uncategorized'}</span></td>
                <td>${formatPrice(p.price)}</td>
                <td>${p.quantity}</td>
                <td><span class="status-badge ${stockStatus.class}">${stockStatus.label}</span></td>
                <td>
                    <button class="action-btn" onclick="openEditModal(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderGrid(data, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = '';

    data.forEach(p => {
        const stockStatus = getStockStatus(p.quantity);
        const card = `
            <div class="product-card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${p.name}</div>
                        <div class="card-subtitle">${p.sku}</div>
                    </div>
                    <span class="status-badge ${stockStatus.class}">${stockStatus.label}</span>
                </div>
                <div class="card-description">${p.description ? p.description.substring(0, 50) + '...' : 'No description'}</div>
                
                <div class="card-stats">
                    <div class="card-stat-item">
                        <label>Price</label>
                        <span>${formatPrice(p.price)}</span>
                    </div>
                    <div class="card-stat-item">
                        <label>Stock</label>
                        <span>${p.quantity}</span>
                    </div>
                </div>

                <div class="card-footer">
                    <span class="card-category">${p.category || 'General'}</span>
                    <div class="card-actions">
                        <button class="action-btn" onclick="openEditModal(${p.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

function renderStats(data) {
    document.getElementById('totalProducts').innerText = data.length;

    const totalVal = data.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    document.getElementById('totalValue').innerText = formatPrice(totalVal);

    const lowStock = data.filter(p => p.quantity < 10).length;
    document.getElementById('lowStock').innerText = lowStock;
}

function renderAnalytics(data) {
    // 1. Category Distribution
    const categories = {};
    data.forEach(p => {
        const cat = p.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;
    });

    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        if (categoryChart) categoryChart.destroy();
        categoryChart = new Chart(categoryCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Items per Category',
                    data: Object.values(categories),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                        'rgba(20, 184, 166, 0.7)',
                        'rgba(251, 191, 36, 0.7)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Product Distribution', color: '#94a3b8' }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // 2. Stock Trends (Mock Data based on real stock levels)
    // In a real app, this would come from historical data endpoint.
    // We will generate a mock trend based on current stock.
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        // Mock randomized trend ending at current total stock
        const currentTotal = data.reduce((a, b) => a + b.quantity, 0);
        const trendData = months.map((_, i) => {
            if (i === 5) return currentTotal;
            return Math.floor(currentTotal * (0.5 + Math.random() * 0.5));
        });

        if (trendChart) trendChart.destroy();
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Total Stock Level',
                    data: trendData,
                    borderColor: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Stock History', color: '#94a3b8' }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}

function getStockStatus(qty) {
    if (qty === 0) return { label: 'Out of Stock', class: 'status-outstock' };
    if (qty < 10) return { label: 'Low Stock', class: 'status-lowstock' };
    return { label: 'In Stock', class: 'status-instock' };
}

// Modal Functions - Kept similar but simplified
function openModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('active');
}

function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    isEditMode = true;
    document.getElementById('modalTitle').innerText = 'Edit Product';

    // Populate form
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSku').value = product.sku;
    document.getElementById('productDescription').value = product.description;

    // Reverse currency conversion for editing? 
    // Usually we edit in base currency (USD). 
    // Assuming backend stores USD.
    document.getElementById('productPrice').value = product.price;

    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productCategory').value = product.category;

    document.getElementById('productModal').classList.add('active');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    isEditMode = false;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = Object.fromEntries(formData.entries());

    try {
        let url = API_URL;
        let method = 'POST';

        if (isEditMode) {
            url = `${API_URL}/${product.id}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            closeModal();
            fetchProducts();
        } else {
            console.error(await res.json());
            alert('Failed to save product.');
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    }
}

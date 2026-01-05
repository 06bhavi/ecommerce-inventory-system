// Main App Logic
// Main App Logic
// IMPORTANT: Replace this URL with your actual Railway Backend URL (e.g., https://nexusinv-production.up.railway.app)
// Do NOT include the trailing slash at the end.
const API_BASE_URL = 'https://nexusinv-production-c61e.up.railway.app';
const API_URL = `${API_BASE_URL}/api/v1/products`;
const PLACEHOLDER_IMG = 'https://placehold.co/400x300/1e293b/ffffff?text=No+Image';
let products = [];
let isEditMode = false;
let currentProductId = null;

// Currency Formatter
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Fetch Stats
async function fetchStats() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const items = data.data;

        document.getElementById('totalProducts').innerText = items.length;

        const totalVal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        document.getElementById('totalValue').innerText = formatCurrency(totalVal);

        const lowStock = items.filter(item => item.quantity < 5).length;
        document.getElementById('lowStock').innerText = lowStock;
    } catch (e) {
        console.error('Error fetching stats:', e);
    }
}

// Render Inventory List
async function renderInventory() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        products = data.data;

        const tbody = document.getElementById('productTableBody');
        tbody.innerHTML = '';

        products.slice(0, 5).forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="display:flex; align-items:center; gap:0.5rem;">
                    <div style="width:32px; height:32px; background:rgba(255,255,255,0.1); border-radius:6px; display:flex; align-items:center; justify-content:center;">
                        ${product.imageUrl ? `<img src="${product.imageUrl}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:contain; border-radius:6px;" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">` : `<img src="${PLACEHOLDER_IMG}" style="width:100%; height:100%; border-radius:6px;">`}
                    </div>
                    ${product.name}
                </td>
                <td>${product.sku}</td>
                <td><span style="background:rgba(99, 102, 241, 0.2); color:#818cf8; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${product.category || 'General'}</span></td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.quantity}</td>
                <td><span class="status-badge ${getStatusClass(product.quantity)}">${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <button class="action-btn" onclick="editProduct(${product.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Also render Grid View
        renderGridView(products.slice(0, 5), 'dashboard-grid-view');
    } catch (e) {
        console.error('Error rendering inventory:', e);
    }
}

// Fetch All Products for Products Page
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        products = data.data;
        renderProductsTable(products);
    } catch (e) {
        console.error(e);
    }
}

function renderProductsTable(items) {
    const tbody = document.getElementById('allProductsTableBody');
    tbody.innerHTML = '';
    items.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="display:flex; align-items:center; gap:0.5rem;">
                <div style="width:32px; height:32px; background:rgba(255,255,255,0.1); border-radius:6px; display:flex; align-items:center; justify-content:center;">
                    ${product.imageUrl ? `<img src="${product.imageUrl}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:contain; border-radius:6px;" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">` : `<img src="${PLACEHOLDER_IMG}" style="width:100%; height:100%; border-radius:6px;">`}
                </div>
                ${product.name}
            </td>
            <td>${product.sku}</td>
            <td><span style="background:rgba(99, 102, 241, 0.2); color:#818cf8; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${product.category || 'General'}</span></td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.quantity}</td>
            <td><span class="status-badge ${getStatusClass(product.quantity)}">${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
            <td>
                <button class="action-btn" onclick="editProduct(${product.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Also render Grid View
    renderGridView(items, 'products-grid-view');
}

function getStatusClass(qty) {
    if (qty <= 0) return 'status-outstock';
    if (qty < 10) return 'status-lowstock';
    return 'status-instock';
}

// Modal Functions
function openModal(edit = false) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    const submitBtn = document.getElementById('modalSubmitBtn');
    modal.classList.add('active');

    if (edit) {
        title.innerText = 'Edit Product';
        submitBtn.innerText = 'Update Product';
        isEditMode = true;
    } else {
        title.innerText = 'Add New Product';
        submitBtn.innerText = 'Create Product';
        form.reset();
        isEditMode = false;
        currentProductId = null;
    }
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

// Edit Product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSku').value = product.sku;
    document.getElementById('productCategory').value = product.category; // Now handled
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImageUrl').value = product.imageUrl || ''; // New field

    currentProductId = id;
    openModal(true);
}

// Form Submit
document.getElementById('productForm').addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const product = Object.fromEntries(formData.entries());

    // Fix types
    product.price = parseFloat(product.price);
    product.quantity = parseInt(product.quantity);

    try {
        let url = API_URL;
        let method = 'POST';

        if (isEditMode) {
            url = `${API_URL}/${product.id}`;
            method = 'PUT';
        } else {
            // Remove id if it's empty to avoid deserialization issues for new products
            delete product.id;
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            closeModal();
            fetchProducts();
            renderInventory(); // Refresh dashboard list too
            fetchStats();      // Refresh stats
        } else {
            const errorData = await res.json();
            console.error(errorData);
            alert(errorData.message || 'Failed to save product.');
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
            renderInventory();
            fetchStats();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    }
}

// --- Orders Logic ---
async function loadOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/products/orders`);
        const data = await response.json();
        const orders = data.data;

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerEmail || 'Guest'}</td>
                <td>${new Date(order.orderDate).toLocaleString()}</td>
                <td><span class="status-badge ${order.paymentMethod === 'ONLINE' ? 'status-instock' : 'status-lowstock'}">${order.paymentMethod || 'N/A'}</span></td>
                <td style="max-width: 200px; padding: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${order.shippingAddress || ''}">${order.shippingAddress || 'N/A'}</td>
                <td>$${order.totalAmount.toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading orders</td></tr>';
    }
}

// --- Navigation Logic ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (item.getAttribute('href').includes('.html')) return; // Allow external links like Storefront

        e.preventDefault();

        // Remove active class
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));

        // Add active
        item.classList.add('active');
        const targetId = item.dataset.target;
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');

        // Load data if needed
        if (targetId === 'products-section') {
            fetchProducts();
        } else if (targetId === 'orders-section') {
            loadOrders();
        } else if (targetId === 'analytics-section') {
            initCharts();
        }
    });
});

// --- Analytics Logic ---
let categoryChart = null;
let trendChart = null;
let viewsChart = null;
let ratingsChart = null;

async function initCharts() {
    // 1. Fetch Real MongoDB Data
    try {
        const [trendingRes, ratedRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/analytics/trending`),
            fetch(`${API_BASE_URL}/api/v1/analytics/top-rated`)
        ]);

        const trendingData = await trendingRes.json();
        const ratedData = await ratedRes.json();

        renderCategoryChart();
        renderTrendChart();
        renderViewsChart(trendingData);
        renderRatingsChart(ratedData);

    } catch (e) {
        console.error('Error fetching analytics:', e);
    }
}

function renderCategoryChart() {
    if (categoryChart) categoryChart.destroy();

    const categoryCounts = {};
    products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const ctx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                data: Object.values(categoryCounts),
                backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'],
                borderColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } }
            }
        }
    });
}

function renderTrendChart() {
    if (trendChart) trendChart.destroy();

    const ctx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Stock Level',
                data: [65, 59, 80, 81, 56, 55, products.length],
                borderColor: '#14b8a6',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(20, 184, 166, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderViewsChart(data) {
    if (viewsChart) viewsChart.destroy();

    // Top 5 viewed
    const top5 = data.slice(0, 5);

    const ctx = document.getElementById('viewsChart').getContext('2d');
    viewsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5.map(d => d.productName.substring(0, 15) + '...'),
            datasets: [{
                label: 'Total Views',
                data: top5.map(d => d.totalViewCount),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderRatingsChart(data) {
    if (ratingsChart) ratingsChart.destroy();

    // Top 5 rated
    const top5 = data.slice(0, 5);

    const ctx = document.getElementById('ratingsChart').getContext('2d');
    ratingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5.map(d => d.productName.substring(0, 15) + '...'),
            datasets: [{
                label: 'Rating (0-5)',
                data: top5.map(d => d.averageRating),
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { max: 5, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// Initial load
fetchStats();
renderInventory();

// Fix Navigation Visibility (Helper)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href && href.includes('.html')) return;

        e.preventDefault();

        // 1. Update Nav State
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // 2. Update Section Visibility
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none'; // Force hide
        });

        const targetId = item.dataset.target;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block'; // Force show overriding inline styles

            // Trigger data load
            if (targetId === 'dashboard-section') {
                fetchStats();
                renderInventory();
            }
            if (targetId === 'products-section') fetchProducts();
            if (targetId === 'orders-section') loadOrders();
            if (targetId === 'analytics-section') initCharts();
        }
    });
});

// --- Settings Logic ---
console.log('Initializing Settings Logic...');
const darkModeToggle = document.getElementById('darkModeToggle');
const notificationsToggle = document.getElementById('notificationsToggle');

if (darkModeToggle) console.log('Dark mode toggle found');
if (notificationsToggle) console.log('Notifications toggle found');

// 1. Dark Mode Init
if (darkModeToggle) {
    const isDarkMode = localStorage.getItem('darkMode') !== 'false'; // Default to true
    applyDarkMode(isDarkMode);
    darkModeToggle.checked = isDarkMode;

    darkModeToggle.addEventListener('change', (e) => {
        applyDarkMode(e.target.checked);
    });
}

function applyDarkMode(isDark) {
    if (isDark) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// 2. Notifications logic
if (notificationsToggle) {
    const areNotificationsEnabled = localStorage.getItem('notifications') === 'true'; // Default false? Or true?
    // Let's default to true as per UI "checked"
    notificationsToggle.checked = localStorage.getItem('notifications') !== 'false';

    notificationsToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        localStorage.setItem('notifications', enabled);
        if (enabled) {
            alert('Notifications enabled!');
        } else {
            console.log('Notifications disabled');
        }
    });
}

// --- View Toggle Logic ---
// Helper to render Grid View
function renderGridView(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    items.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="card-title">${product.name}</h3>
                    <span style="font-size: 0.8rem; color: #94a3b8;">${product.sku}</span>
                </div>
                <span class="card-category">${product.category || 'General'}</span>
            </div>
            
            <div style="margin-bottom: 1rem; height: 150px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                 ${product.imageUrl ? `<img src="${product.imageUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${PLACEHOLDER_IMG}'">` : `<img src="${PLACEHOLDER_IMG}" style="width:100%; height:100%; object-fit:cover;">`}
            </div>

            <div class="card-stats">
                <div class="card-stat-item">
                    <label>Price</label>
                    <span style="color: #10b981;">${formatCurrency(product.price)}</span>
                </div>
                <div class="card-stat-item">
                    <label>Stock</label>
                    <span class="${getStatusClass(product.quantity)}">${product.quantity}</span>
                </div>
            </div>

            <div class="card-footer">
                <span style="font-size: 0.8rem; color: #64748b;">${product.quantity > 0 ? 'Available' : 'Unavailable'}</span>
                <div class="card-actions">
                    <button class="action-btn" onclick="editProduct(${product.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Initialize View Toggles
document.querySelectorAll('.view-options .icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const button = e.currentTarget;

        // 1. Toggle Active State
        const parent = button.parentElement;
        parent.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        // 2. Determine Context (Dashboard or Products)
        const viewType = button.dataset.view; // 'list' or 'grid'
        const section = button.closest('.content-section');

        if (!section) return;

        const listView = section.querySelector('.table-container');
        const gridView = section.querySelector('.inventory-grid');

        if (viewType === 'grid') {
            if (listView) listView.style.display = 'none';
            if (gridView) gridView.style.display = 'grid';
        } else {
            if (listView) listView.style.display = 'block';
            if (gridView) gridView.style.display = 'none';
        }
    });
});

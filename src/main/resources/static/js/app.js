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

            // 1. Update active nav state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 2. Identify target section
            const targetId = item.dataset.target;
            console.log('Navigating to:', targetId);

            if (!targetId) return;

            // 3. Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

            // 4. Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
            } else {
                console.error('Target section not found:', targetId);
            }

            // 5. Special handlers
            if (targetId === 'analytics-section') {
                renderAnalytics(products);
            }
        });
    });
}

// ... existing code ...

function renderAnalytics(data) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded.');
        return;
    }

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

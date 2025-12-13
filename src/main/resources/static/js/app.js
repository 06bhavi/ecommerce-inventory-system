```javascript
const API_URL = '/api/v1/products';
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Search listener
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.sku.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    // Form submit
    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const section = item.innerText.trim();
            handleNavigation(section);
        });
    });
});

function handleNavigation(section) {
    const dashboard = document.querySelector('.content-section'); // First section is dashboard
    const analytics = document.getElementById('analyticsSection');
    const settings = document.getElementById('settingsSection');
    const statsGrid = document.querySelector('.stats-grid'); // Top stats

    // Hide all first
    dashboard.style.display = 'none';
    analytics.style.display = 'none';
    settings.style.display = 'none';
    statsGrid.style.display = 'none';

    if (section === 'Dashboard' || section === 'Products') {
        dashboard.style.display = 'flex';
        statsGrid.style.display = 'grid';
    } else if (section === 'Analytics') {
        analytics.style.display = 'block';
        renderAnalyticsCharts();
    } else if (section === 'Settings') {
        settings.style.display = 'block';
    }
}

async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.status === 'success') {
            products = data.data;
            renderTable(products);
            renderStats(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderTable(data) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    data.forEach(p => {
        const stockStatus = getStockStatus(p.quantity);
        const row = `
    < tr >
                <td>
                    <div style="font-weight: 600;">${p.name}</div>
                    <div style="font-size: 0.8em; color: var(--text-muted);">${p.description.substring(0, 30)}...</div>
                </td>
                <td style="font-family: monospace; color: var(--accent);">${p.sku}</td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; font-size: 0.85em;">${p.category || 'Uncategorized'}</span></td>
                <td>$${p.price.toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td><span class="status-badge ${stockStatus.class}">${stockStatus.label}</span></td>
                <td>
                    <button class="action-btn" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr >
    `;
        tbody.innerHTML += row;
    });
}

function renderStats(data) {
    document.getElementById('totalProducts').innerText = data.length;
    
    const totalVal = data.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    document.getElementById('totalValue').innerText = `$${ totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } `;

    const lowStock = data.filter(p => p.quantity < 10).length;
    document.getElementById('lowStock').innerText = lowStock;
}

function renderAnalyticsCharts() {
    // Determine categories
    const categories = {};
    products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        if(!categories[cat]) categories[cat] = { count: 0, value: 0 };
        categories[cat].count++;
        categories[cat].value += (p.price * p.quantity);
    });

    // Render Category Count Chart
    const catChart = document.getElementById('categoryChart');
    catChart.innerHTML = '';
    const maxCount = Math.max(...Object.values(categories).map(c => c.count));

    for (const [cat, data] of Object.entries(categories)) {
        const width = (data.count / maxCount) * 100;
        catChart.innerHTML += `
    < div style = "display: flex; align-items: center; gap: 1rem; width: 100%;" >
                <span style="width: 100px; font-size: 0.9em; text-align: right;">${cat}</span>
                <div style="flex: 1; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; height: 20px;">
                    <div style="width: ${width}%; background: var(--primary); height: 100%;"></div>
                </div>
                <span style="width: 30px; font-size: 0.9em;">${data.count}</span>
            </div >
    `;
    }

    // Render Value Chart
    const valChart = document.getElementById('valueChart');
    valChart.innerHTML = '';
    const maxValue = Math.max(...Object.values(categories).map(c => c.value));

    for (const [cat, data] of Object.entries(categories)) {
        const width = (data.value / maxValue) * 100;
        valChart.innerHTML += `
    < div style = "display: flex; align-items: center; gap: 1rem; width: 100%;" >
                <span style="width: 100px; font-size: 0.9em; text-align: right;">${cat}</span>
                <div style="flex: 1; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; height: 20px;">
                    <div style="width: ${width}%; background: var(--secondary); height: 100%;"></div>
                </div>
                <span style="width: 60px; font-size: 0.9em;">$${data.value < 1000 ? data.value.toFixed(0) : (data.value/1000).toFixed(1) + 'k'}</span>
            </div >
    `;
    }
}

function getStockStatus(qty) {
    if (qty === 0) return { label: 'Out of Stock', class: 'status-outstock' };
    if (qty < 10) return { label: 'Low Stock', class: 'status-lowstock' };
    return { label: 'In Stock', class: 'status-instock' };
}

// Modal Functions
function openModal(isEdit = false) {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('modalTitle').innerText = isEdit ? 'Edit Product' : 'Add New Product';
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = Object.fromEntries(formData.entries());
    const id = document.getElementById('productId').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${ API_URL }/${id}` : API_URL;

try {
    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });

    if (res.ok) {
        closeModal();
        fetchProducts();
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

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('productId').value = product.id;
        document.querySelector('[name="name"]').value = product.name;
        document.querySelector('[name="sku"]').value = product.sku;
        document.querySelector('[name="description"]').value = product.description;
        document.querySelector('[name="price"]').value = product.price;
        document.querySelector('[name="quantity"]').value = product.quantity;
        document.querySelector('[name="category"]').value = product.category;

        openModal(true);
    }
}
```

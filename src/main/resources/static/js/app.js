const API_URL = '/api/v1/products';
let products = [];
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupNavigation();

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
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Get target section from icon text content (simple mapping)
            const text = item.textContent.trim();
            let targetId = 'dashboard-section';

            if (text.includes('Dashboard')) targetId = 'dashboard-section';
            else if (text.includes('Products')) targetId = 'dashboard-section'; // Same view for now
            else if (text.includes('Analytics')) targetId = 'analytics-section';
            else if (text.includes('Settings')) targetId = 'settings-section';

            // Hide all sections and show target
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
            <tr>
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
                    <button class="action-btn" onclick="openEditModal(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderStats(data) {
    document.getElementById('totalProducts').innerText = data.length;

    const totalVal = data.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    document.getElementById('totalValue').innerText = `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const lowStock = data.filter(p => p.quantity < 10).length;
    document.getElementById('lowStock').innerText = lowStock;
}

function getStockStatus(qty) {
    if (qty === 0) return { label: 'Out of Stock', class: 'status-outstock' };
    if (qty < 10) return { label: 'Low Stock', class: 'status-lowstock' };
    return { label: 'In Stock', class: 'status-instock' };
}

// Modal Functions
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
            alert('Failed to save product. Please check console for details.');
            console.error(await res.json());
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

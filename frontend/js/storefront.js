let cart = [];
let allProducts = [];

let activeCategoryFilters = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    // Theme Check
    const isDarkMode = localStorage.getItem('darkMode') !== 'false';
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
    }

    // Initial Load
    await loadProducts();
    // After products are loaded, check if we can show trending
    loadTrending();

    // Attach listeners
    document.getElementById('storeSearch').addEventListener('input', applyFilters);
    document.getElementById('minPrice').addEventListener('input', applyFilters);
    document.getElementById('maxPrice').addEventListener('input', applyFilters);
    document.getElementById('stockFilter').addEventListener('change', applyFilters);
});

async function loadProducts() {
    try {
        const response = await fetch('/api/v1/storefront/products?page=0&size=100');
        const data = await response.json();
        allProducts = data.content;

        renderCategoryFilters();
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadTrending() {
    try {
        const res = await fetch('/api/v1/analytics/trending');
        const trendingData = await res.json();

        // Filter trendingData to only include items that we actually have in allProducts (to ensure we have image/price etc)
        // Or if analytics data has enough info, verify. Analytics has productId, productName, etc.
        // We'll map analytics items to product details from allProducts

        const trendingProducts = trendingData.map(t => {
            const product = allProducts.find(p => p.id === t.productId);
            return product; // If not found, it will be undefined, filter it out
        }).filter(Boolean);

        if (trendingProducts.length > 0) {
            document.getElementById('trendingSection').style.display = 'block';
            renderProducts(trendingProducts.slice(0, 4), 'trendingGrid');
        }
    } catch (e) {
        console.error("Error loading trending:", e);
    }
}

function renderCategoryFilters() {
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    const container = document.getElementById('categoryFilters');

    if (categories.length === 0) {
        container.innerHTML = '<span style="color:#94a3b8; font-size:0.875rem;">No categories found</span>';
        return;
    }

    container.innerHTML = categories.map(cat => `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" value="${cat}" onchange="toggleCategory('${cat}')" style="accent-color: #0f172a; width: 16px; height: 16px;">
            <span style="font-size: 0.9rem; color: #475569;">${cat}</span>
        </label>
    `).join('');
}

function toggleCategory(cat) {
    if (activeCategoryFilters.has(cat)) {
        activeCategoryFilters.delete(cat);
    } else {
        activeCategoryFilters.add(cat);
    }
    applyFilters();
}

function applyFilters() {
    const term = document.getElementById('storeSearch').value.toLowerCase().trim();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const showStockOnly = document.getElementById('stockFilter').checked;

    const filtered = allProducts.filter(p => {
        const matchesTerm = !term ||
            p.name.toLowerCase().includes(term) ||
            (p.category && p.category.toLowerCase().includes(term));
        const matchesCategory = activeCategoryFilters.size === 0 || activeCategoryFilters.has(p.category);
        const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
        const matchesStock = !showStockOnly || (p.quantity > 0 && p.status !== 'OUT_OF_STOCK');

        return matchesTerm && matchesCategory && matchesPrice && matchesStock;
    });

    renderProducts(filtered);
}

function renderProducts(products, containerId = 'productsGrid') {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #94a3b8;">No products found.</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const isOutOfStock = product.quantity === 0 || product.status === 'OUT_OF_STOCK';
        let imageHtml = `<div class="product-image"><img src="https://placehold.co/400x300/1e293b/ffffff?text=No+Image" alt="No Image"></div>`;
        if (product.imageUrl) {
            imageHtml = `<div class="product-image"><img src="${product.imageUrl}" alt="${product.name}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.onerror=null;this.src='https://placehold.co/400x300/1e293b/ffffff?text=Image+Error';"></div>`;
        }

        let badgeHtml = '';
        if (isOutOfStock) {
            badgeHtml = '<span class="stock-badge out"><i class="fas fa-times-circle"></i> Out of Stock</span>';
        } else if (product.quantity < 10) {
            badgeHtml = `<span class="stock-badge low"><i class="fas fa-exclamation-circle"></i> Only ${product.quantity} left</span>`;
        } else {
            badgeHtml = '<span class="stock-badge in"><i class="fas fa-check-circle"></i> In Stock</span>';
        }

        return `
            <div class="product-card" style="${isOutOfStock ? 'opacity: 0.8;' : ''}">
                ${imageHtml}
                <div class="product-details">
                    <div class="category-tag">${product.category || 'General'}</div>
                    <div class="product-title">${product.name}</div>
                    ${badgeHtml}
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                         <button onclick="viewDetails(${product.id})" class="add-btn" style="background: rgba(255,255,255,0.1); flex: 1; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.quantity}, '${product.imageUrl || ''}')" 
                                class="add-btn"
                                style="flex: 3;"
                                ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-bag"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- Product Details & Reviews ---
let currentReviewProductId = null;

function viewDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    currentReviewProductId = productId;

    // Populate Modal
    document.getElementById('reviewProductName').innerText = product.name;
    document.getElementById('reviewProductDesc').innerText = product.description || 'No description available.';
    document.getElementById('reviewProductPrice').innerText = '$' + product.price.toFixed(2);

    const imgContainer = document.getElementById('reviewProductImage');
    if (product.imageUrl) {
        imgContainer.innerHTML = `<img src="${product.imageUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
    } else {
        imgContainer.innerHTML = `<img src="https://placehold.co/400x300/1e293b/ffffff?text=No+Image" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
    }

    // Show Modal
    const overlay = document.getElementById('reviewOverlay');
    const modal = document.getElementById('reviewModal');
    overlay.style.display = 'block';
    modal.style.display = 'flex';

    // Log Activity
    logActivity(productId, 'PRODUCT_VIEW', { page: 'storefront' });

    // Fetch Reviews
    fetchReviews(productId);
}

function closeReviewModal() {
    document.getElementById('reviewOverlay').style.display = 'none';
    document.getElementById('reviewModal').style.display = 'none';
}

async function logActivity(productId, action, metadata) {
    try {
        await fetch('/api/v1/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: productId,
                userId: 'guest_user', // Simulating guest
                action: action,
                metadata: metadata,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error("Log activity failed", e);
    }
}

async function fetchReviews(productId) {
    const list = document.getElementById('reviewsList');
    list.innerHTML = '<div style="text-align: center; color: #64748b; padding-top: 2rem;">Loading reviews...</div>';

    try {
        const res = await fetch(`/api/v1/reviews/${productId}`);
        const reviews = await res.json();

        if (reviews.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: #94a3b8; padding-top: 1rem;">No reviews yet. Be the first!</div>';
            return;
        }

        list.innerHTML = reviews.map(r => `
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                    <span style="font-weight: 600; color: #e2e8f0;">${r.userId || 'Anonymous'}</span>
                    <span style="color: #f59e0b;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.5;">${r.reviewText || ''}</p>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">${new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
        `).join('');

    } catch (e) {
        list.innerHTML = '<div style="text-align: center; color: #ef4444; padding-top: 1rem;">Failed to load reviews.</div>';
    }
}

async function submitReview(e) {
    e.preventDefault();
    if (!currentReviewProductId) return;

    const rating = parseInt(document.getElementById('newReviewRating').value);
    const userId = document.getElementById('newReviewUser').value;
    const text = document.getElementById('newReviewText').value;

    const body = {
        rating: rating,
        userId: userId,
        reviewText: text,
        tags: [] // Optional
    };

    try {
        const res = await fetch(`/api/v1/reviews/${currentReviewProductId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            // Clear form
            document.getElementById('addReviewForm').reset();
            // Refresh Reviews
            fetchReviews(currentReviewProductId);
        } else {
            alert("Failed to submit review");
        }
    } catch (e) {
        console.error(e);
        alert("Error submitting review");
    }
}


function addToCart(id, name, price, maxQty, img) {
    const existing = cart.find(i => i.productId === id);
    if (existing) {
        if (existing.quantity >= maxQty) return alert('No more stock available!');
        existing.quantity++;
    } else {
        cart.push({ productId: id, name, price, quantity: 1, maxQty, img });
    }
    updateCartUI();
    toggleCart(true);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.productId !== id);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cartCount').textContent = cart.reduce((a, b) => a + b.quantity, 0);

    const container = document.getElementById('cartItems');
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:2rem;">Your cart is empty</div>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    ${item.img ? `<img src="${item.img}">` : '<i class="fas fa-cube" style="font-size:1.5rem; color:#cbd5e1;"></i>'}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600; margin-bottom:0.25rem;">${item.name}</div>
                    <div style="font-size:0.875rem; color:#64748b;">$${item.price} x ${item.quantity}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; justify-content:space-between;">
                    <div style="font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button onclick="removeFromCart(${item.productId})" style="color:#ef4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}

let currentStep = 0; // 0: Cart, 1: Payment, 2: Address
const STEPS = ['cart', 'payment', 'address'];

function toggleCart(forceOpen = false) {
    const modal = document.getElementById('cartModal');
    const overlay = document.getElementById('cartOverlay');
    if (forceOpen) {
        modal.classList.add('active');
        overlay.classList.add('active');
    } else {
        modal.classList.toggle('active');
        overlay.classList.toggle('active');
    }
    // Reset to step 0 when opening/closing
    if (!modal.classList.contains('active')) {
        setTimeout(() => setStep(0), 300);
    }
}

function setStep(stepIndex) {
    currentStep = stepIndex;

    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(el => el.style.display = 'none');

    // Show current step
    document.getElementById(`step-${STEPS[currentStep]}`).style.display = 'block';

    // Update Buttons & Title
    const backBtn = document.getElementById('backBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const title = document.getElementById('modalTitle');

    if (currentStep === 0) {
        title.innerText = 'Your Cart';
        backBtn.style.display = 'none';
        checkoutBtn.innerText = 'Proceed to Checkout';
        checkoutBtn.style.display = cart.length ? 'block' : 'none';
    } else if (currentStep === 1) {
        title.innerText = 'Payment Method';
        backBtn.style.display = 'block';
        checkoutBtn.innerText = 'Continue';
    } else if (currentStep === 2) {
        title.innerText = 'Shipping Details';
        backBtn.style.display = 'block';
        checkoutBtn.innerText = 'Place Order';
    }
}

function nextStep() {
    if (currentStep === 0) {
        if (cart.length === 0) return alert('Cart is empty');
        setStep(1);
    } else if (currentStep === 1) {
        // Validate Payment Step
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        if (paymentMethod === 'ONLINE') {
            const num = document.getElementById('cardNumber').value.trim();
            const exp = document.getElementById('cardExpiry').value.trim();
            const cvc = document.getElementById('cardCvc').value.trim();
            if (!num || !exp || !cvc) return alert('Please enter all card details');
        }
        setStep(2);
    } else if (currentStep === 2) {
        finalizeOrder();
    }
}

function prevStep() {
    if (currentStep > 0) setStep(currentStep - 1);
}

function selectPayment(method) {
    const form = document.getElementById('online-payment-form');
    if (method === 'ONLINE') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
        // Clear inputs just in case? optional
    }
}

async function finalizeOrder() {
    const email = document.getElementById('customerEmail').value;
    const address = document.getElementById('shippingAddress').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (!email || !address) return alert('Please fill in all fields');

    const body = {
        customerEmail: email,
        shippingAddress: address,
        paymentMethod: paymentMethod,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
    };

    try {
        const btn = document.getElementById('checkoutBtn');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        const res = await fetch('/api/v1/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert('Order placed successfully! Order ID: ' + (await res.json()).id);
            cart = [];
            updateCartUI();
            setStep(0);
            toggleCart(false);
            loadProducts(); // Refresh stock
        } else {
            const err = await res.json();
            alert('Order failed: ' + (err.message || 'Unknown error'));
        }

        btn.innerText = originalText;
        btn.disabled = false;
    } catch (e) {
        console.error(e);
        alert('System error during checkout');
        document.getElementById('checkoutBtn').disabled = false;
    }
}

// Order Tracking
function openOrderTrackModal() {
    document.getElementById('orderOverlay').style.display = 'block';
    document.getElementById('orderModal').style.display = 'block';
}

function closeOrderTrackModal() {
    document.getElementById('orderOverlay').style.display = 'none';
    document.getElementById('orderModal').style.display = 'none';
}

async function fetchMyOrders() {
    const email = document.getElementById('trackEmail').value;
    if (!email) return alert('Please enter email');

    const container = document.getElementById('orderListSection');
    container.innerHTML = '<div style="text-align:center; padding:1rem;">Loading...</div>';

    try {
        const res = await fetch(`/api/v1/storefront/my-orders?email=${encodeURIComponent(email)}`);
        const orders = await res.json();

        if (orders.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:1rem; color:#94a3b8;">No orders found for this email.</div>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span style="font-weight:600; color:#fff;">Order #${order.id}</span>
                    <span style="font-size:0.9rem; color:#94a3b8;">${new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div style="font-size:0.9rem; color:#cbd5e1; margin-bottom:0.5rem;">
                    ${order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:0.5rem; margin-top:0.5rem;">
                    <span style="font-weight:700; color:#fff;">$${order.totalAmount.toFixed(2)}</span>
                    <span style="font-size:0.8rem; background:rgba(16, 185, 129, 0.2); color:#34d399; padding:2px 8px; border-radius:12px;">${order.status}</span>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="text-align:center; padding:1rem; color:red;">Error fetching orders</div>';
    }
}

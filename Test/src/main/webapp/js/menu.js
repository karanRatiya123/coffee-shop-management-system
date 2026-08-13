// Operator State (loaded from sessionStorage safely)
let selectedOperator = {
    name: sessionStorage.getItem('operatorName') || 'Operator',
    avatar: sessionStorage.getItem('operatorAvatar') || ''
};

let allProducts = [];
let filteredProducts = [];
let searchFilter = '';
let currentCategoryFilter = 'All';

// On Page Load
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    await loadCategories();
    renderMenu();
});

async function loadProducts() {
    try {
        const response = await fetch("MenuServlet");
        if (response.ok) {
            allProducts = await response.json();
        } else {
            console.error("MenuServlet returned status:", response.status);
            allProducts = [];
        }
    } catch (error) {
        console.error('Failed to load products from database:', error);
        allProducts = [];
    }
}

async function loadCategories() {
    try {
        const response = await fetch("CategoryServlet");
        if (response.ok) {
            const categories = await response.json();
            const tabsContainer = document.getElementById('menu-category-tabs');
            if (tabsContainer && Array.isArray(categories) && categories.length > 0) {
                let tabsHtml = `<button class="view-menu-tab ${'All' === currentCategoryFilter ? 'active' : ''}" onclick="selectCategory('All', this)">All</button>`;
                categories.forEach(cat => {
                    tabsHtml += `<button class="view-menu-tab ${cat.categoryName === currentCategoryFilter ? 'active' : ''}" onclick="selectCategory('${cat.categoryName}', this)">${cat.categoryName}</button>`;
                });
                tabsContainer.innerHTML = tabsHtml;
            }
        }
    } catch (error) {
        console.warn('Failed to load categories:', error);
    }
}

function selectCategory(category, button) {
    currentCategoryFilter = category;
    // Update active state of tabs
    const tabs = document.querySelectorAll('.view-menu-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    if (button) button.classList.add('active');
    renderMenu();
}

// Render stats and items
function renderMenu() {
    const gridContainer = document.getElementById('view-menu-grid');
    const countEl = document.getElementById('menu-item-count');
    const statsContainer = document.getElementById('menu-stats-row');

    // Filter products
    filteredProducts = allProducts.filter(product => {
        const prodCat = (product.category || '').toLowerCase();
        const filterCat = currentCategoryFilter.toLowerCase();
        
        const matchesCategory = currentCategoryFilter === 'All' ||
                              prodCat === filterCat ||
                              prodCat.includes(filterCat) ||
                              filterCat.includes(prodCat);

        const search = searchFilter.toLowerCase();
        const matchesSearch = (product.itemName || '').toLowerCase().includes(search) ||
                              (product.description || '').toLowerCase().includes(search);
                              
        return matchesCategory && matchesSearch;
    });

    // 1. Update count label
    if (countEl) {
        countEl.textContent = `${filteredProducts.length} Items`;
    }

    // 2. Render statistics row
    if (statsContainer) {
        const totalCount = allProducts.length;
        const uniqueCategories = [...new Set(allProducts.map(p => p.category))].length;
        const popularCount = allProducts.filter(p => p.itemName.toLowerCase().includes('coffee')).length; // simple heuristic

        // Calculate Price Range
        const prices = allProducts.map(p => p.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const priceRange = `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}`;

        statsContainer.innerHTML = `
            <div class="view-menu-stat-card">
                <div class="view-menu-stat-icon total">
                    <i class="fa-solid fa-mug-hot"></i>
                </div>
                <div class="view-menu-stat-details">
                    <span class="view-menu-stat-value">${totalCount}</span>
                    <span class="view-menu-stat-label">Total Products</span>
                </div>
            </div>
            <div class="view-menu-stat-card">
                <div class="view-menu-stat-icon categories">
                    <i class="fa-solid fa-list"></i>
                </div>
                <div class="view-menu-stat-details">
                    <span class="view-menu-stat-value">${uniqueCategories}</span>
                    <span class="view-menu-stat-label">Categories</span>
                </div>
            </div>
            <div class="view-menu-stat-card">
                <div class="view-menu-stat-icon popular">
                    <i class="fa-solid fa-star"></i>
                </div>
                <div class="view-menu-stat-details">
                    <span class="view-menu-stat-value">${popularCount}</span>
                    <span class="view-menu-stat-label">Coffee Items</span>
                </div>
            </div>
            <div class="view-menu-stat-card">
                <div class="view-menu-stat-icon pricerange">
                    <i class="fa-solid fa-indian-rupee-sign"></i>
                </div>
                <div class="view-menu-stat-details">
                    <span class="view-menu-stat-value">${priceRange}</span>
                    <span class="view-menu-stat-label">Price Range</span>
                </div>
            </div>
        `;
    }

    // 3. Render grid items
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    if (filteredProducts.length === 0) {
        gridContainer.innerHTML = `
            <div class="view-menu-empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No menu items found</h3>
                <p>No products match your search or selected category.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(item => {
        const card = document.createElement('div');
        card.className = 'view-menu-card';
        card.innerHTML = `
            <div class="view-menu-card-img-wrapper">
                <img src="${item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=300'}" alt="${item.itemName}" class="view-menu-card-img">
                <span class="view-menu-card-badge">${item.category || 'Menu Item'}</span>
            </div>
            
            <div class="view-menu-card-body">
                <span class="view-menu-card-category">${item.category || ''}</span>
                <div class="view-menu-card-title-row">
                    <h3 class="view-menu-card-title">${item.itemName}</h3>
                    <span class="view-menu-card-price">₹${item.price.toFixed(2)}</span>
                </div>
                
                <p class="view-menu-card-desc">${item.description || ''}</p>
                
                <div class="view-menu-card-details">
                    <div class="view-menu-card-specs">
                        <span>Price: <strong>₹${item.price.toFixed(2)}</strong></span>
                        <span>ID: <strong>${item.menuId}</strong></span>
                    </div>
                    
                    <div class="view-menu-card-footer">
                        <span class="view-menu-card-stock ${item.availability === 'Available' ? 'in-stock' : 'out-of-stock'}">${item.availability}</span>
                    </div>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

// Search Bar Filtering
function filterMenuBySearch() {
    const searchInput = document.getElementById('view-menu-search');
    if (searchInput) {
        searchFilter = searchInput.value;
        renderMenu();
    }
}

// Logout session
function logoutSession() {
    try {
        sessionStorage.removeItem('operatorName');
        sessionStorage.removeItem('operatorRole');
        sessionStorage.removeItem('operatorAvatar');
    } catch (e) {
        console.warn("sessionStorage is unavailable or blocked:", e);
    }
    window.location.href = 'index.html';
}

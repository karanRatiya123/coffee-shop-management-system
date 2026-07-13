// --- Coffee Shop POS Menu Catalog Logic (menu.js) ---

// Operator State (loaded from sessionStorage safely)
let selectedOperator = {
  name: 'Sarah Jenkins',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
};

try {
  const storedName = sessionStorage.getItem('operatorName');
  const storedAvatar = sessionStorage.getItem('operatorAvatar');
  if (storedName) selectedOperator.name = storedName;
  if (storedAvatar) selectedOperator.avatar = storedAvatar;
} catch (e) {
  console.warn("sessionStorage is unavailable or blocked:", e);
}

// Detailed Menu Catalog
const products = [
  { 
    id: 'cappuccino', 
    name: 'Cappuccino', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=300',
    description: 'A classic espresso drink made with equal parts double espresso, steamed milk, and velvety foam. Dusted with dark cocoa powder.',
    dietary: ['Veg'],
    nutrition: { kcal: 120, caffeine: 150, sugar: 8 },
    ingredients: ['Espresso', 'Whole Milk', 'Cocoa Powder'],
    stock: 25,
    isPopular: true
  },
  { 
    id: 'latte', 
    name: 'Latte', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 130, 
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300',
    description: 'A smooth and creamy blend of fresh espresso, steamed milk, and a thin, delicate layer of microfoam on top.',
    dietary: ['Veg'],
    nutrition: { kcal: 190, caffeine: 150, sugar: 15 },
    ingredients: ['Espresso', 'Steamed Milk', 'Vanilla syrup (optional)'],
    stock: 35,
    isPopular: false
  },
  { 
    id: 'americano', 
    name: 'Americano', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 110, 
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=300',
    description: 'Rich, full-bodied espresso diluted with hot water to create a robust, drip-style coffee with crema.',
    dietary: ['Veg', 'Vegan', 'Dairy-Free'],
    nutrition: { kcal: 15, caffeine: 225, sugar: 0 },
    ingredients: ['Espresso', 'Filtered Hot Water'],
    stock: 50,
    isPopular: false
  },
  { 
    id: 'mocha', 
    name: 'Mocha', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 140, 
    image: 'https://images.unsplash.com/photo-1596078841242-12e73dc697c4?auto=format&fit=crop&q=80&w=300',
    description: 'Decadent chocolate syrup combined with fresh espresso, steamed milk, and finished with whipped cream.',
    dietary: ['Veg'],
    nutrition: { kcal: 320, caffeine: 150, sugar: 32 },
    ingredients: ['Espresso', 'Steamed Milk', 'Chocolate Ganache', 'Whipped Cream'],
    stock: 18,
    isPopular: true
  },
  { 
    id: 'iced-coffee', 
    name: 'Iced Coffee', 
    category: 'Cold Drinks', 
    subtitle: 'Cold Drink', 
    price: 150, 
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=300',
    description: 'Freshly brewed espresso cooled and served over ice, sweetened with simple syrup and dairy cream.',
    dietary: ['Veg'],
    nutrition: { kcal: 140, caffeine: 150, sugar: 12 },
    ingredients: ['Espresso', 'Ice Cubes', 'Whole Milk', 'Cane Syrup'],
    stock: 22,
    isPopular: true
  },
  { 
    id: 'cold-chocolate', 
    name: 'Cold Chocolate', 
    category: 'Cold Drinks', 
    subtitle: 'Cold Drink', 
    price: 160, 
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=300',
    description: 'Premium chilled milk blended with rich Swiss chocolate powder, cocoa shavings, and a scoop of vanilla ice cream.',
    dietary: ['Veg'],
    nutrition: { kcal: 380, caffeine: 5, sugar: 40 },
    ingredients: ['Chilled Milk', 'Cocoa Powder', 'Vanilla Ice Cream', 'Chocolate Drizzle'],
    stock: 12,
    isPopular: false
  },
  { 
    id: 'lemon-iced-tea', 
    name: 'Lemon Iced Tea', 
    category: 'Cold Drinks', 
    subtitle: 'Cold Drink', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=300',
    description: 'Refreshing organic black tea brewed with fresh lemon juice, sweetened and served over crushed ice with fresh mint.',
    dietary: ['Veg', 'Vegan', 'Dairy-Free'],
    nutrition: { kcal: 90, caffeine: 40, sugar: 22 },
    ingredients: ['Brewed Black Tea', 'Fresh Lemon Juice', 'Mint Leaves', 'Ice'],
    stock: 30,
    isPopular: true
  },
  { 
    id: 'green-tea', 
    name: 'Green Tea', 
    category: 'Tea', 
    subtitle: 'Hot Tea', 
    price: 100, 
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=300',
    description: 'Steeped organic Sencha green tea leaves offering a grassy, clean flavor Profile packed with antioxidants.',
    dietary: ['Veg', 'Vegan', 'Dairy-Free'],
    nutrition: { kcal: 2, caffeine: 35, sugar: 0 },
    ingredients: ['Japanese Sencha Green Tea Leaves', 'Hot Water'],
    stock: 45,
    isPopular: false
  },
  { 
    id: 'chocolate-cake', 
    name: 'Chocolate Cake', 
    category: 'Desserts', 
    subtitle: 'Dessert', 
    price: 180, 
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300',
    description: 'A decadent slice of triple-layered chocolate fudge cake, filled and frosted with dark chocolate ganache.',
    dietary: ['Veg'],
    nutrition: { kcal: 450, caffeine: 10, sugar: 48 },
    ingredients: ['Wheat Flour', 'Dark Cocoa', 'Butter', 'Sugar', 'Baking Powder'],
    stock: 8,
    isPopular: true
  },
  { 
    id: 'blueberry-muffin', 
    name: 'Blueberry Muffin', 
    category: 'Desserts', 
    subtitle: 'Dessert', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=300',
    description: 'Moist, golden muffin baked with fresh blueberries and topped with a sweet, crunchy sugar streusel.',
    dietary: ['Veg'],
    nutrition: { kcal: 280, caffeine: 0, sugar: 20 },
    ingredients: ['Fresh Blueberries', 'Wheat Flour', 'Butter', 'Brown Sugar'],
    stock: 14,
    isPopular: false
  },
  { 
    id: 'veg-sandwich', 
    name: 'Veg Sandwich', 
    category: 'Snacks', 
    subtitle: 'Snacks', 
    price: 150, 
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&q=80&w=300',
    description: 'Fresh cucumbers, tomatoes, and bell peppers layered with cream cheese and spicy green chutney on sourdough bread.',
    dietary: ['Veg'],
    nutrition: { kcal: 310, caffeine: 0, sugar: 4 },
    ingredients: ['Sourdough Bread', 'Cucumber', 'Tomato', 'Bell Pepper', 'Cream Cheese'],
    stock: 0, // Out of Stock to show empty stock state
    isPopular: true
  },
  { 
    id: 'cheese-burger', 
    name: 'Cheese Burger', 
    category: 'Snacks', 
    subtitle: 'Snacks', 
    price: 160, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    description: 'A grilled potato patty topped with cheddar cheese, crisp lettuce, red onions, gherkins, and house secret sauce.',
    dietary: ['Veg'],
    nutrition: { kcal: 420, caffeine: 0, sugar: 6 },
    ingredients: ['Brioche Bun', 'Potato Patty', 'Cheddar Slice', 'Lettuce', 'Secret Sauce'],
    stock: 16,
    isPopular: false
  }
];

// Search & Filter State
let searchFilter = '';
let currentDietFilter = 'All';
let dashClockInterval = null;

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  // Sync cashier profile header details
  updateDashboardOperator();
  startDashboardClock();

  // Render Catalog
  renderMenu();
});

// 1. Dashboard Operator Profile Sync
function updateDashboardOperator() {
  const dashNameEl = document.getElementById('dash-operator-name');
  const dashAvatarEl = document.getElementById('dash-operator-avatar');
  
  if (dashNameEl) dashNameEl.textContent = selectedOperator.name;
  if (dashAvatarEl) dashAvatarEl.style.backgroundImage = `url('${selectedOperator.avatar}')`;
}

// 2. Real-Time clock for top bar
function startDashboardClock() {
  const timeEl = document.getElementById('dash-time-display');
  if (!timeEl) return;
  
  if (dashClockInterval) clearInterval(dashClockInterval);
  
  function updateTime() {
    const now = new Date();
    const realMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = realMonths[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    timeEl.textContent = `${month} ${date}, ${year} | ${hours}:${minutes} ${ampm}`;
  }
  
  updateTime();
  dashClockInterval = setInterval(updateTime, 1000);
}

// 3. Render Detailed Menu
function renderMenu() {
  const layoutContainer = document.getElementById('menu-catalog-layout');
  if (!layoutContainer) return;
  
  layoutContainer.innerHTML = '';
  
  // Filter products by Search and Dietary preferences
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchFilter.toLowerCase());
                          
    const matchesDiet = currentDietFilter === 'All' || product.dietary.includes(currentDietFilter);
    return matchesSearch && matchesDiet;
  });

  // Group filtered products by Category
  const categories = ['Coffee', 'Cold Drinks', 'Tea', 'Snacks', 'Desserts'];
  
  categories.forEach(category => {
    const categoryItems = filteredProducts.filter(item => item.category === category);
    
    // Skip categories with no matching search results
    if (categoryItems.length === 0) return;
    
    // Create Category Section
    const section = document.createElement('div');
    section.className = 'menu-catalog-section';
    section.innerHTML = `
      <h2 class="menu-section-title">${category}</h2>
      <div class="menu-items-grid"></div>
    `;
    
    const itemsGrid = section.querySelector('.menu-items-grid');
    
    categoryItems.forEach(item => {
      // Stock Badge Styling
      let stockStatusHtml = '';
      if (item.stock > 10) {
        stockStatusHtml = `<span class="stock-badge in-stock">In Stock (${item.stock})</span>`;
      } else if (item.stock > 0) {
        stockStatusHtml = `<span class="stock-badge low-stock">Low Stock (${item.stock})</span>`;
      } else {
        stockStatusHtml = `<span class="stock-badge out-of-stock">Out of Stock</span>`;
      }
      
      // Dietary badges
      const dietBadgesHtml = item.dietary.map(diet => `<span class="diet-label ${diet.toLowerCase()}">${diet}</span>`).join(' ');
      
      const card = document.createElement('div');
      card.className = `menu-catalog-card ${item.stock === 0 ? 'inactive-card' : ''}`;
      card.innerHTML = `
        <div class="menu-card-left">
          <div class="menu-card-img-wrapper">
            <img src="${item.image}" alt="${item.name}" class="menu-card-img">
            ${item.isPopular ? '<span class="popular-ribbon">Bestseller</span>' : ''}
          </div>
          <span class="menu-card-price">₹${item.price.toFixed(2)}</span>
        </div>
        
        <div class="menu-card-right">
          <div class="menu-card-header-row">
            <h3 class="menu-card-name">${item.name}</h3>
            ${stockStatusHtml}
          </div>
          
          <p class="menu-card-desc">${item.description}</p>
          
          <div class="ingredients-list">
            <strong>Ingredients:</strong> ${item.ingredients.join(', ')}
          </div>
          
          <div class="nutrition-specs-row">
            <div class="spec-capsule">Calories: <strong>${item.nutrition.kcal} kcal</strong></div>
            <div class="spec-capsule">Caffeine: <strong>${item.nutrition.caffeine} mg</strong></div>
            <div class="spec-capsule">Sugar: <strong>${item.nutrition.sugar} g</strong></div>
          </div>
          
          <div class="menu-card-footer">
            <div class="dietary-badges-row">${dietBadgesHtml}</div>
            <a href="dashboard.html" class="add-to-order-link ${item.stock === 0 ? 'disabled' : ''}">
              <span>Order Terminal</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="order-arrow-icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      `;
      itemsGrid.appendChild(card);
    });
    
    layoutContainer.appendChild(section);
  });
  
  if (filteredProducts.length === 0) {
    layoutContainer.innerHTML = `
      <div class="no-menu-results">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No menu items matches your query. Try another search or filter.</p>
      </div>
    `;
  }
}

// 4. Filter Dietary Preferences
function filterDiet(dietType, button) {
  currentDietFilter = dietType;
  
  // Toggle dietary buttons active state
  const buttons = document.querySelectorAll('.dietary-tab');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  
  renderMenu();
}

// 5. Search Bar Filtering
function filterMenuBySearch() {
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchFilter = searchInput.value;
    renderMenu();
  }
}

// 6. Session Logout
function logoutSession() {
  if (dashClockInterval) clearInterval(dashClockInterval);
  // Clear sessionStorage operator details
  try {
    sessionStorage.removeItem('operatorName');
    sessionStorage.removeItem('operatorAvatar');
  } catch (e) {
    console.warn("sessionStorage is unavailable or blocked:", e);
  }
  window.location.href = 'index.html';
}

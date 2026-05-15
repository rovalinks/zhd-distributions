let products = [];
let selectedCategory = 'All';
let cart =
  JSON.parse(localStorage.getItem('zhd_cart'))
  || [];

function toggleCart() {

  const cartPanel =
    document.getElementById('cartPanel');

  const overlay =
    document.getElementById('overlay');

  cartPanel.classList.toggle('open');

  overlay.classList.toggle('show');

  const categorySection =
    document.querySelector('.category-buttons');

  if(cartPanel.classList.contains('open')) {

    categorySection.scrollBy({
      left: 200,
      behavior: 'smooth'
    });

  }

}

function updateCartUI() {

  const cartItems =
    document.getElementById('cartItems');

  const cartCount =
    document.getElementById('cartCount');

  const cartSummary =
    document.getElementById('cartSummary');

  cartItems.innerHTML = '';

  cartCount.innerText = cart.length;

  let totalQty = 0;

  cart.forEach((item, index) => {

    totalQty += parseInt(item.qty);

    cartItems.innerHTML += `

      <div class="cart-item">

        <div class="cart-item-name">
          ${item.name}
        </div>

        <div class="cart-item-qty-controls">
        
          <button
            class="qty-btn"
            onclick="decreaseQty(${index})">
            -
          </button>
        
          <span>${item.qty}</span>
        
          <button
            class="qty-btn"
            onclick="increaseQty(${index})">
            +
          </button>
        
        </div>

        <button
          class="remove-btn"
          onclick="removeFromCart(${index})"
        >
          Remove
        </button>

      </div>

      `;
  
    });
  
    cartSummary.innerText =
      `${totalQty} Products Added`;
  
    localStorage.setItem(
      'zhd_cart',
      JSON.stringify(cart)
    );
  
  }

  function removeFromCart(index) {
  
    cart.splice(index, 1);
  
    updateCartUI();
  
  }

function increaseQty(index) {

  cart[index].qty =
    parseInt(cart[index].qty) + 1;

  updateCartUI();

}

function decreaseQty(index) {

  if(cart[index].qty > 1) {

    cart[index].qty =
      parseInt(cart[index].qty) - 1;

  } else {

    cart.splice(index, 1);

  }

  updateCartUI();

}

  function clearCart() {
  
    cart = [];
  
    updateCartUI();
  
  }

const productsContainer = document.getElementById('productsContainer');
const searchInput = document.getElementById('searchInput');

fetch('catalog/master_data.csv')
  .then(response => response.text())
  .then(csvText => {

    const rows = csvText.split('\n').slice(1);

    products = rows
      .filter(row => row.trim() !== '')
      .map(row => {

        const cols = row.split(',');

        return {
          id: cols[0]?.trim(),
          name: cols[1]?.trim(),
          category: cols[2]?.trim(),
          brand: cols[3]?.trim(),
          pack: cols[4]?.trim(),

          image: `images/${cols[1]
            ?.trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}.png`
        };

      });

    generateCategories();
    renderProducts();

  });

function generateCategories() {

  const categoryContainer =
    document.getElementById('categoryButtons');

  const categories = [
    ...new Set(products.map(product => product.category))
  ];

  categoryContainer.innerHTML = '';

  categoryContainer.innerHTML += `
    <button class="category-btn active"
      data-category="All">
      All
    </button>
  `;

  categories.forEach(category => {

    categoryContainer.innerHTML += `
      <button class="category-btn"
        data-category="${category}">
        ${category}
      </button>
    `;

  });

  document.querySelectorAll('.category-btn')
    .forEach(btn => {

      btn.addEventListener('click', () => {

        document.querySelectorAll('.category-btn')
          .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        selectedCategory = btn.dataset.category;

        renderProducts();

      });

    });

}

function renderProducts() {

  const searchText =
    searchInput.value.toLowerCase();

  const filteredProducts = products.filter(product => {

    const matchesCategory =
      selectedCategory === 'All'
      || product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchText)
      || product.brand.toLowerCase().includes(searchText)
      || product.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;

  });

  productsContainer.innerHTML = '';

  filteredProducts.forEach((product, index) => {

    const card = document.createElement('div');

    card.className = 'product-card';

    card.innerHTML = `

      <div class="product-image">

        <img
          src="${product.image}"
          onerror="this.src='images/placeholder.png'"
          alt="${product.name}"
          style="
            width:100%;
            height:100%;
            object-fit:contain;
            border-radius:10px;
          "
        >

      </div>

      <div class="product-brand">
        ${product.brand} - ${product.category}
      </div>

      <div class="product-name">
        ${product.name}
      </div>

      <div class="product-details">
        Pack: ${product.pack}
      </div>

      <div class="qty-row">

        <input
          type="number"
          min="1"
          value="1"
          id="qty-${product.id}"
        />

        <button
          class="add-btn"
          onclick="addToCart('${product.id}')"
        >
          Add
        </button>

      </div>

    `;

    productsContainer.appendChild(card);

  });

}

searchInput.addEventListener('input', renderProducts);


function addToCart(productId) {

  const product =
    products.find(p => p.id === productId);

  const qty =
    parseInt(
      document.getElementById(`qty-${productId}`).value
    );

  const existingItem =
    cart.find(item => item.id === productId);

  if(existingItem) {

    existingItem.qty =
      parseInt(existingItem.qty) + qty;

  } else {

    cart.push({
      ...product,
      qty
    });

  }

  updateCartUI();

  showToast();

}

function showToast() {

  const toast =
    document.getElementById('toast');
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2000);

}
  
function sendWhatsAppOrder() {

  if(cart.length === 0) {

    alert('Please add products first');

    return;

  }

  let message =
    'Hello, I would like to order:%0A%0A';

  cart.forEach(item => {

    message +=
      `- ${item.brand} - ${item.name} - ${item.pack} | Qty: ${item.qty}%0A`;

  });

  const phone = '447000000000';

  window.open(
    `https://wa.me/${phone}?text=${message}`,
    '_blank'
  );

}

updateCartUI();

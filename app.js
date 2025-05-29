// app.js
import { db, collection, getDocs } from "./firebase.js";

let products = [];
let cart = [];
let total = 0;

// Función para cargar productos desde Firebase
async function fetchProducts() {
    try {
        const productosRef = collection(db, "productos");
        const snapshot = await getDocs(productosRef);

        products = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.titulo || "Sin nombre",
                price: parseFloat(data.precioVenta) || 0,
                category: data.categoria || "Sin categoría",
                image: data.imagenUrl || "img/logo-tienda.png" // Si no hay URL, usa una por defecto
            };
        });

        displayProducts(products);
    } catch (error) {
        console.error("Error al cargar productos de Firebase:", error);
    }
}

// Mostrar productos
function displayProducts(filteredProducts) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiar lista actual

    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        const productImg = document.createElement('img');
        productImg.src = product.image;
        productImg.onerror = () => productImg.src = 'img/logo-tienda.png';
        productDiv.appendChild(productImg);

        const productName = document.createElement('h4');
        productName.textContent = product.name;
        productDiv.appendChild(productName);

        const productPrice = document.createElement('p');
        productPrice.textContent = `$${product.price}`;
        productDiv.appendChild(productPrice);

        const addButton = document.createElement('button');
        addButton.textContent = 'Agregar al carrito';
        addButton.onclick = () => addToCart(product);
        productDiv.appendChild(addButton);

        productList.appendChild(productDiv);
    });
}

// Función para filtrar productos por categoría
function filterProducts(category) {
    const filtered = category === 'all' ? products : products.filter(product => product.category === category);
    displayProducts(filtered);
}

// Función para agregar productos al carrito y mostrar el toast
function addToCart(product) {
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    total += product.price;
    updateCart();
    updateCartItemCount();

    // Mostrar el toast al agregar producto
    showToast();
}

// Mostrar el Toast de Bootstrap
function showToast() {
    let toastElement = document.getElementById('liveToast');
    let toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Actualizar el contador de artículos en el carrito
function updateCartItemCount() {
    const cartItemCount = document.getElementById('cartItemCount');
    const totalItems = cart.reduce((sum, product) => sum + product.quantity, 0);
    cartItemCount.textContent = totalItems;
}

// Actualizar el carrito
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';

    cart.forEach(product => {
        const cartItem = document.createElement('li');
        cartItem.textContent = `${product.name} - $${product.price} x ${product.quantity}`;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('cart-buttons');

        const decreaseBtn = document.createElement('button');
        decreaseBtn.textContent = '-';
        decreaseBtn.classList.add('btn', 'btn-decrease');
        decreaseBtn.onclick = () => decreaseQuantity(product.id);
        buttonsDiv.appendChild(decreaseBtn);

        const increaseBtn = document.createElement('button');
        increaseBtn.textContent = '+';
        increaseBtn.classList.add('btn', 'btn-increase');
        increaseBtn.onclick = () => addToCart(product);
        buttonsDiv.appendChild(increaseBtn);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Eliminar';
        removeBtn.classList.add('btn', 'btn-remove');
        removeBtn.onclick = () => removeProduct(product.id);
        buttonsDiv.appendChild(removeBtn);

        cartItem.appendChild(buttonsDiv);
        cartItems.appendChild(cartItem);
    });

    document.getElementById('total').textContent = total.toFixed(2);
}

// Disminuir cantidad de producto en el carrito
function decreaseQuantity(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1 && cart[productIndex].quantity > 1) {
        cart[productIndex].quantity -= 1;
        total -= cart[productIndex].price;
    } else if (cart[productIndex].quantity === 1) {
        total -= cart[productIndex].price;
        cart.splice(productIndex, 1);
    }

    if (total < 0) total = 0;
    updateCart();
    updateCartItemCount();
}

// Eliminar producto del carrito
function removeProduct(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        total -= cart[productIndex].price * cart[productIndex].quantity;
        cart.splice(productIndex, 1);
    }

    if (total < 0) total = 0;
    updateCart();
    updateCartItemCount();
}

// Finalizar compra
function finalizarCompra() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de finalizar la compra.");
        return;
    }

    let mensaje = "👋 ¡Hola! Me gustaría hacer un pedido:\n\n";

    cart.forEach(product => {
        mensaje += `🛒 *${product.name}*\n`;
        mensaje += `Cantidad: ${product.quantity}\n`;
        mensaje += `Precio unitario: $${product.price}\n`;
        mensaje += `Total: $${(product.price * product.quantity).toFixed(2)}\n\n`;
    });

    mensaje += `💰 *Total general:* $${total.toFixed(2)}\n\n`;
    mensaje += "📩 Por favor, contáctame para confirmar el pedido.";

    const phoneNumber = "542236764618";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
}

// Guardar carrito en localStorage
function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("total", total);
}

// Cargar carrito de localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("cart");
    const savedTotal = localStorage.getItem("total");

    if (savedCart) {
        cart = JSON.parse(savedCart);
        total = parseFloat(savedTotal) || 0;
        updateCart();
        updateCartItemCount();
    }
}

// Mostrar / ocultar el menú de categorías en móviles
document.getElementById('menuIcon').addEventListener('click', function () {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Cerrar el menú si se hace clic fuera
document.addEventListener('click', function (event) {
    const menu = document.getElementById('dropdownMenu');
    const menuIcon = document.getElementById('menuIcon');

    if (event.target !== menu && event.target !== menuIcon) {
        menu.style.display = 'none';
    }
});

// Hacer scroll hacia el carrito
const cartIcon = document.getElementById('cartIcon');
cartIcon.addEventListener('click', function() {
    const cartSection = document.getElementById('cartSection');
    cartSection.scrollIntoView({ behavior: 'smooth' });
});

// Llamar funciones principales al cargar la página
window.onload = () => {
    fetchProducts();
    loadCartFromLocalStorage();
};

// Hacer accesibles estas funciones al HTML
window.filterProducts = filterProducts;
window.finalizarCompra = finalizarCompra;


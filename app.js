// Array de productos
const products = [
    { id: 1, name: 'Stevia', price: 10, category: 'categoria1', image: 'img_1.jpg' },
    { id: 2, name: 'Miel Orgánica', price: 20, category: 'categoria2', image: 'img_2.jpg' },
    { id: 3, name: 'Cacao', price: 15, category: 'categoria1', image: 'img_3.jpg' },
    { id: 4, name: 'Mermelada', price: 25, category: 'categoria3', image: 'img_4.jpg' },
    { id: 5, name: 'Maple', price: 30, category: 'categoria2', image: 'img_5.jpg' },
    { id: 6, name: 'Pasta de maní', price: 40, category: 'categoria3', image: 'img_6.jpg' }
];

let cart = [];
let total = 0;

// Mostrar / ocultar el menú de categorías en móviles
document.getElementById('menuIcon').addEventListener('click', function () {
    const menu = document.getElementById('dropdownMenu');
    
    // Toggle el menú
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
});

// Cerrar el menú si se hace clic fuera
document.addEventListener('click', function (event) {
    const menu = document.getElementById('dropdownMenu');
    const menuIcon = document.getElementById('menuIcon');

    if (event.target !== menu && event.target !== menuIcon) {
        menu.style.display = 'none';
    }
});

// Función para hacer scroll hacia la sección del carrito
const cartIcon = document.getElementById('cartIcon');

cartIcon.addEventListener('click', function() {
    const cartSection = document.getElementById('cartSection');
    cartSection.scrollIntoView({ behavior: 'smooth' }); // Esto hará un desplazamiento suave hacia el carrito
});

// Mostrar todos los productos al inicio
window.onload = () => {
    displayProducts(products);
};

// Función para mostrar los productos
function displayProducts(filteredProducts) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiar lista actual

    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        const productImg = document.createElement('img');
        productImg.src = 'img/' + product.image;
        productImg.onerror = () => productImg.src = 'img/default.jpg'; // Imagen por defecto si no se carga
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

// Función para agregar productos al carrito
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
}

// Función para actualizar el contador de artículos en el carrito
function updateCartItemCount() {
    const cartItemCount = document.getElementById('cartItemCount');
    const totalItems = cart.reduce((sum, product) => sum + product.quantity, 0);
    cartItemCount.textContent = totalItems;
}

// Función para actualizar el carrito
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';

    cart.forEach(product => {
        const cartItem = document.createElement('li');
        cartItem.textContent = `${product.name} - $${product.price} x ${product.quantity}`;

        // Contenedor para botones
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

// Función para disminuir la cantidad de un producto en el carrito
function decreaseQuantity(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1 && cart[productIndex].quantity > 1) {
        cart[productIndex].quantity -= 1;
        total -= cart[productIndex].price;
    } else if (cart[productIndex].quantity === 1) {
        total -= cart[productIndex].price;
        cart.splice(productIndex, 1);
    }

    if (total < 0) total = 0; // Evitar valores negativos

    updateCart();
    updateCartItemCount();
}

// Función para eliminar un producto del carrito
function removeProduct(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        total -= cart[productIndex].price * cart[productIndex].quantity;
        cart.splice(productIndex, 1);
    }

    if (total < 0) total = 0; // Evitar valores negativos

    updateCart();
    updateCartItemCount();
}

// Función para finalizar la compra y enviar pedido a WhatsApp
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

    const phoneNumber = "542236764618"; // Número de la tienda sin "+", sin espacios ni caracteres especiales
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
}

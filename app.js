const products = [
    { id: 1, name: 'Stevia', price: 10, category: 'categoria1', image: 'img_1.jpg' },
    { id: 2, name: 'Miel Orgánica', price: 20, category: 'categoria2', image: 'img_2.jpg' },
    { id: 3, name: 'Cacao', price: 15, category: 'categoria1', image: 'img_3.jpg' },
    { id: 4, name: 'Mermelada', price: 25, category: 'categoria3', image: 'img_4.jpg' },
    { id: 5, name: 'Maple', price: 30, category: 'categoria2', image: 'img_5.jpg' },
    { id: 6, name: 'Pasta de maní', price: 40, category: 'categoria3', image: 'img_6.jpg' },
    { id: 7, name: 'Stevia', price: 10, category: 'categoria1', image: 'img_4.jpg' },
    { id: 8, name: 'Stevia', price: 10, category: 'categoria1', image: 'img_5.jpg' },
    { id: 9, name: 'Stevia', price: 10, category: 'categoria1', image: 'img_2.jpg' },
    { id: 10, name: 'Stevia', price: 10, category: 'categoria1', image: 'img_1.jpg' },
];

let cart = [];
let total = 0;

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
        productImg.src = 'img/' + product.image; // Ruta actualizada
        productImg.onerror = () => {
            productImg.src = 'img/default.jpg'; // Imagen por defecto si no se carga
        };
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
    // Verificar si el producto ya está en el carrito
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        // Si ya existe, aumentamos la cantidad
        cart[existingProductIndex].quantity += 1;
    } else {
        // Si no existe, lo agregamos al carrito con cantidad 1
        cart.push({ ...product, quantity: 1 });
    }

    total += product.price;
    updateCart();
    updateCartItemCount(); // Actualiza el contador del carrito
}

// Función para actualizar el contador de artículos en el carrito
function updateCartItemCount() {
    const cartItemCount = document.getElementById('cartItemCount');
    const totalItems = cart.reduce((sum, product) => sum + product.quantity, 0); // Suma la cantidad de todos los productos
    cartItemCount.textContent = totalItems; // Actualiza el contador en el ícono
}

// Función para actualizar el carrito
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = ''; // Limpiar carrito

    cart.forEach(product => {
        const cartItem = document.createElement('li');
        cartItem.textContent = `${product.name} - $${product.price} x ${product.quantity}`;

        // Botones de sumar y restar cantidad
        const buttonsDiv = document.createElement('div');
        const decreaseBtn = document.createElement('button');
        decreaseBtn.textContent = '-';
        decreaseBtn.onclick = () => decreaseQuantity(product.id);
        buttonsDiv.appendChild(decreaseBtn);

        const increaseBtn = document.createElement('button');
        increaseBtn.textContent = '+';
        increaseBtn.onclick = () => addToCart(product); // Si es el mismo producto, agregamos otra unidad
        buttonsDiv.appendChild(increaseBtn);

        // Botón de eliminar producto
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Eliminar';
        removeBtn.onclick = () => removeProduct(product.id);
        buttonsDiv.appendChild(removeBtn);

        cartItem.appendChild(buttonsDiv);
        cartItems.appendChild(cartItem);
    });

    document.getElementById('total').textContent = total.toFixed(2);
}

// Función para restar la cantidad de un producto en el carrito
function decreaseQuantity(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1 && cart[productIndex].quantity > 1) {
        cart[productIndex].quantity -= 1;
        total -= cart[productIndex].price;
    } else if (cart[productIndex].quantity === 1) {
        // Si la cantidad es 1, eliminamos el producto
        total -= cart[productIndex].price;  // Asegurarse de restar el precio del total
        cart.splice(productIndex, 1);
    }

    updateCart();
    updateCartItemCount();  // Actualiza el contador después de modificar la cantidad
}

// Función para eliminar un producto del carrito
function removeProduct(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        total -= cart[productIndex].price * cart[productIndex].quantity;
        cart.splice(productIndex, 1);
    }

    updateCart();
    updateCartItemCount();  // Actualiza el contador del carrito después de eliminar un producto
}

// Función para finalizar la compra y redirigir a WhatsApp con un detalle claro del pedido
function finalizarCompra() {
    // Crear un mensaje de texto con los productos en el carrito
    let mensaje = "¡Hola! Me gustaría realizar un pedido de los siguientes productos:\n\n";
    
    // Detalle de los productos en el carrito
    cart.forEach(product => {
        // Agregar cada producto con su nombre, cantidad, precio unitario y total
        mensaje += `Producto: ${product.name}\n`;
        mensaje += `Cantidad: ${product.quantity}\n`;
        mensaje += `Precio unitario: $${product.price}\n`;
        mensaje += `Total: $${(product.price * product.quantity).toFixed(2)}\n\n`;
    });

    // Agregar total general
    mensaje += `Total general de la compra: $${total.toFixed(2)}\n`;
    
    // Añadir un mensaje final
    mensaje += "Por favor, contáctame para confirmar el pedido.";

    // Número de WhatsApp donde se enviará el mensaje (sin el "+" ni caracteres especiales)
    const phoneNumber = "+542236764618";  // Reemplaza este número por el de la tienda
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensaje)}`;
    
    // Redirigir al usuario al enlace de WhatsApp
    window.open(url, "_blank");
}

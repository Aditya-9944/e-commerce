// Sticky Header Function
window.onscroll = function() { stickyHeader() };

function stickyHeader() {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}

// Array to store cart items
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to add an item to the cart
function addToCart(itemName, itemPrice) {
    // Check if the item already exists in the cart
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        // Increase the quantity if the item is already in the cart
        existingItem.quantity++;
    } else {
        // Add new item to the cart
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }

    // Update the cart display
    displayCart();
    // Save cart to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to remove an item from the cart
function removeFromCart(itemName) {
    // Filter out the item with the specified name
    cart = cart.filter(item => item.name !== itemName);

    // Update the cart display to reflect the changes
    displayCart();
    // Save cart to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to display items in the cart and calculate the total
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    // Clear previous cart items
    cartItemsContainer.innerHTML = '';

    // Loop through each item in the cart to display and calculate total
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        // Create a div for each cart item
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <p><strong>${item.name}</strong> x ${item.quantity} - ₹${itemTotal.toFixed(2)}</p>
            <button class="remove-button" onclick="removeFromCart('${item.name}')">Remove</button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    // Update the total price display with the rupee symbol
    cartTotal.textContent = `₹${total.toFixed(2)}`;
}

// Function to place an order
async function placeOrder() {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const order = {
        customerName: 'Jane Doe',  // Replace with actual customer input if available
        items: cart,
        totalPrice: totalPrice,
        address: '123 Main St, Cityville' // Replace with actual address input if available
    };

    try {
        const response = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (response.ok) {
            alert('Order placed successfully!');
            cart = []; // Clear the cart after placing the order
            displayCart(); // Update display to reflect empty cart
            localStorage.setItem('cart', JSON.stringify(cart)); // Clear cart in local storage
        } else {
            alert('Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
    }
}

// Function to fetch and display all orders
async function fetchOrders() {
    try {
        const response = await fetch('http://localhost:3000/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

// Function to display orders
function displayOrders(orders) {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = ''; // Clear previous orders
    orders.forEach((order, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order');
        orderDiv.innerHTML = `
            <h3>Order ${index + 1}</h3>
            <p><strong>Customer Name:</strong> ${order.customerName}</p>
            <p><strong>Address:</strong> ${order.address}</p>
            <p><strong>Items:</strong> ${order.items.map(item => `${item.name} x ${item.quantity}`).join(', ')}</p>
            <p><strong>Total Price:</strong> ₹${order.totalPrice.toFixed(2)}</p>
            <p><strong>Order Date and Time:</strong> ${new Date(order.orderTime).toLocaleString()}</p>
        `;
        orderContainer.appendChild(orderDiv);
    });
}

// Function to fetch and display sales summary
async function fetchSalesSummary() {
    try {
        const response = await fetch('http://localhost:3000/sales-summary');
        const summary = await response.json();
        displaySalesSummary(summary);
    } catch (error) {
        console.error('Error fetching sales summary:', error);
    }
}

function displaySalesSummary(summary) {
    const summaryContainer = document.getElementById('sales-summary');
    summaryContainer.innerHTML = ''; // Clear any previous content

    for (const [day, data] of Object.entries(summary)) {
        // Create a container for each day's summary
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('sales-day');

        // Add the day's header with total orders
        const dayHeader = document.createElement('h3');
        dayHeader.innerHTML = `${day} <span>Total Orders: ${data.totalOrders}</span>`;
        dayDiv.appendChild(dayHeader);

        // Display the sales in rupees without changing the actual value
        const daySales = document.createElement('p');
        daySales.textContent = `${day}: ₹${data.salesAmount.toFixed(2)}`;
        dayDiv.appendChild(daySales);

        // Add each hour's data
        for (const [hour, count] of Object.entries(data.hourly)) {
            const hourEntry = document.createElement('p');
            hourEntry.textContent = `Hour ${hour}:00 - ${count} Orders`;
            dayDiv.appendChild(hourEntry);
        }

        // Append the day's div to the summary container
        summaryContainer.appendChild(dayDiv);
    }
}

// Function to display the most ordered dish
function displayMostOrderedDish(dish) {
    const mostOrderedContainer = document.getElementById('most-ordered');
    mostOrderedContainer.innerHTML = `
        <h2>Most Ordered Dish</h2>
        <p><strong>Dish:</strong> ${dish.name}</p>
        <p><strong>Orders:</strong> ${dish.count}</p>
    `;
}

// Function to fetch and display the most ordered dish
async function fetchMostOrderedDish() {
    try {
        const response = await fetch('http://localhost:3000/most-ordered');
        if (response.ok) {
            const mostOrderedDish = await response.json();
            displayMostOrderedDish(mostOrderedDish);
        } else {
            console.log('No most ordered dish found.');
        }
    } catch (error) {
        console.error('Error fetching most ordered dish:', error);
    }
}

// Function to fetch and display highest sale time
async function fetchHighestSaleTime() {
    try {
        const response = await fetch('http://localhost:3000/highest-sale-time');
        const highestSale = await response.json();
        displayHighestSaleTime(highestSale);
    } catch (error) {
        console.error('Error fetching highest sale time:', error);
    }
}

// Function to display the highest sale time (to be implemented as needed)
function displayHighestSaleTime(highestSale) {
    const highestSaleContainer = document.getElementById('highest-sale-time');
    highestSaleContainer.innerHTML = `
        <h2>Highest Sale Time</h2>
        <p><strong>Time:</strong> ${highestSale.dateTime}</p>
        <p><strong>Orders:</strong> ${highestSale.sales}</p>
    `;
}

// Initialize the cart display and call other functions on page load
window.onload = () => {
    displayCart();
    fetchOrders();
    fetchSalesSummary();
    fetchMostOrderedDish();
    fetchHighestSaleTime();
};

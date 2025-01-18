const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for PORT or default to 3000

app.use(cors());
app.use(express.json()); // Middleware to parse JSON data

// Files to store order data
const ordersFile = './orders.json';         // File for storing order details
const orderCountsFile = './orderCounts.json'; // File for storing order counts

// Route to display a welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the Online Restaurant Backend!');
});

// Load orders from file
function loadOrders() {
    try {
        if (fs.existsSync(ordersFile)) {
            return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        } else {
            return [];
        }
    } catch (err) {
        console.error('Failed to load orders:', err);
        return [];
    }
}

// Load or initialize order counts from orderCounts.json
function loadOrderCounts() {
    try {
        if (fs.existsSync(orderCountsFile)) {
            return JSON.parse(fs.readFileSync(orderCountsFile, 'utf8'));
        } else {
            return {}; // Return an empty object if no data exists
        }
    } catch (err) {
        console.error('Failed to load order counts:', err);
        return {};
    }
}

// Save updated order counts to the file
function saveOrderCounts(orderCounts) {
    try {
        fs.writeFileSync(orderCountsFile, JSON.stringify(orderCounts, null, 2));
    } catch (err) {
        console.error('Failed to save order counts:', err);
    }
}

// Route to receive an order (POST /order) and save order details
// Route to receive an order (POST /order) and save order details
app.post('/order', (req, res) => {
    const newOrder = req.body;
    newOrder.orderTime = new Date().toISOString(); // Add timestamp to each order

    let orders = loadOrders();
    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    // Update order counts
    const orderCounts = loadOrderCounts();
    newOrder.items.forEach(item => {
        if (orderCounts[item.name]) {
            orderCounts[item.name] += item.quantity;
        } else {
            orderCounts[item.name] = item.quantity;
        }
    });
    saveOrderCounts(orderCounts);

    res.status(201).json({ message: 'Order received', totalPrice: newOrder.totalPrice });
});


// Route to get all orders (GET /orders)
app.get('/orders', (req, res) => {
    const orders = loadOrders();
    res.json(orders);
});

// Endpoint to get the most ordered dish (GET /most-ordered)
app.get('/most-ordered', (req, res) => {
    const orderCounts = loadOrderCounts();

    // Find the dish with the highest count
    let mostOrderedDish = null;
    let maxCount = 0;

    for (const [dish, count] of Object.entries(orderCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostOrderedDish = { name: dish, count };
        }
    }

    if (mostOrderedDish) {
        res.json(mostOrderedDish);
    } else {
        res.status(404).json({ message: 'No orders found' });
    }
});

// Endpoint to get sales summary by day and time
app.get('/sales-summary', (req, res) => {
    const orders = loadOrders();
    const summary = {};

    orders.forEach(order => {
        const orderDate = new Date(order.orderTime);
        const day = orderDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const hour = orderDate.getHours(); // Extract the hour for time-based grouping

        // Initialize date and hour if not present
        if (!summary[day]) summary[day] = { totalOrders: 0, hourly: {} };
        if (!summary[day].hourly[hour]) summary[day].hourly[hour] = 0;

        // Increment total orders for the day and for the hour
        summary[day].totalOrders++;
        summary[day].hourly[hour]++;
    });

    res.json(summary);
});

// Endpoint to get the time of highest sales
app.get('/highest-sale-time', (req, res) => {
    const orders = loadOrders();
    const salesByTime = {};

    // Count sales by date and time (hourly)
    orders.forEach(order => {
        if (!order.orderTime) return; // Skip if orderTime is missing

        const orderDate = new Date(order.orderTime);
        if (isNaN(orderDate)) return; // Skip invalid date entries

        const day = orderDate.toISOString().split('T')[0];
        const hour = orderDate.getHours();

        const dateTime = `${day} ${hour}:00`; // Corrected template string syntax
        if (!salesByTime[dateTime]) salesByTime[dateTime] = 0;
        salesByTime[dateTime]++;
    });

    // Find the time with the highest sales
    let maxSalesTime = null;
    let maxSalesCount = 0;
    for (const [dateTime, count] of Object.entries(salesByTime)) {
        if (count > maxSalesCount) {
            maxSalesCount = count;
            maxSalesTime = dateTime;
        }
    }

    res.json({ dateTime: maxSalesTime, sales: maxSalesCount });
});

// Calculate sales amount for each order
function calculateSalesAmount(orders) {
    orders.forEach(order => {
        order.salesAmount = order.items.reduce((total, item) => total + item.price * item.quantity, 0);
    });
}

app.get('/daily-sales', (req, res) => {
    const orders = loadOrders();
    calculateSalesAmount(orders); // Ensure this function does not convert to INR
    const summary = {};
    orders.forEach(order => {
        const orderDate = new Date(order.orderTime);
        const day = orderDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        if (!summary[day]) {
            summary[day] = 0;
        }
        summary[day] += order.salesAmount; // Keep the original dollar value
    });
    res.json(summary);
});


app.get('/api/orders', (req, res) => {
    try {
        const orders = loadOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

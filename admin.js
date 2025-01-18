// Function to fetch and display all orders
async function fetchOrders() {
    try {
        const response = await fetch('http://localhost:3000/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();

        // Display orders
        const orderContainer = document.getElementById('order-container');
orderContainer.innerHTML = ''; // Clear previous orders
console.log("Orders fetched:", orders);

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

const orderDates = orders.map(order => new Date(order.orderTime).toLocaleDateString());
const orderCounts = {};

orderDates.forEach(date => {
    orderCounts[date] = (orderCounts[date] || 0) + 1;
});


    const labels = Object.keys(orderCounts);
    const data = Object.values(orderCounts);

    displayOrdersChart(labels, data);
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// Function to display the most ordered dish in the admin page
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
        if (!response.ok) {
            console.log('No most ordered dish found.');
            return;
        }
        const mostOrderedDish = await response.json();
        displayMostOrderedDish(mostOrderedDish);
    } catch (error) {
        console.error('Error fetching most ordered dish:', error);
    }
}

// Function to display the sales summary
function displaySalesSummary(summary) {
    const summaryContainer = document.getElementById('sales-summary');
    summaryContainer.innerHTML = ''; // Clear any previous content

    // Iterate over each day in the summary data
    for (const [day, data] of Object.entries(summary)) {
        // Create a container for each day's summary
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('sales-day'); // Assuming you have styling for '.sales-day' in CSS

        // Add the day's header with total orders
        const dayHeader = document.createElement('h3');
        dayHeader.innerHTML = `${day} <span>Total Orders: ${data.totalOrders}</span>`;
        dayHeader.style.fontSize = '1.2rem';
        dayHeader.style.color = '#333';
        dayDiv.appendChild(dayHeader);

        // Add each hour's data within this day
        for (const [hour, count] of Object.entries(data.hourly)) {
            const hourEntry = document.createElement('p');
            hourEntry.textContent = `Hour ${hour}:00 - ${count} Orders`;
            hourEntry.style.marginLeft = '20px';
            hourEntry.style.color = '#555';
            dayDiv.appendChild(hourEntry);
        }

        // Append the day's div to the summary container
        summaryContainer.appendChild(dayDiv);
    }
}

// Function to fetch and display the sales summary
async function fetchSalesSummary() {
    try {
        const response = await fetch('http://localhost:3000/sales-summary');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const summary = await response.json();
        displaySalesSummary(summary);
    } catch (error) {
        console.error('Error fetching sales summary:', error);
    }
}

// Function to display the highest sale time
function displayHighestSaleTime(highestSale) {
    const highestSaleContainer = document.getElementById('highest-sale-time');
    highestSaleContainer.innerHTML = `
        <h2>Highest Sale Time</h2>
        <p><strong>Time:</strong> ${highestSale.dateTime}</p>
        <p><strong>Orders:</strong> ${highestSale.sales}</p>
    `;
}

// Function to fetch and display the highest sale time
async function fetchHighestSaleTime() {
    try {
        const response = await fetch('http://localhost:3000/highest-sale-time');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const highestSale = await response.json();
        displayHighestSaleTime(highestSale);
    } catch (error) {
        console.error('Error fetching highest sale time:', error);
    }
}

async function fetchDailySales() {
    try {
        const response = await fetch('http://localhost:3000/daily-sales');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const dailySales = await response.json();
        displayDailySales(dailySales);

        // Schedule the next refresh at midnight
        scheduleDailyRefresh();
    } catch (error) {
        console.error('Error fetching daily sales:', error);
    }
}

function displayDailySales(dailySales) {
    const salesSummaryContainer = document.getElementById('daily-sales-summary');
    salesSummaryContainer.innerHTML = '<h3>Daily Sales Summary</h3>';
    Object.entries(dailySales).forEach(([day, sales]) => {
        const daySales = document.createElement('p');
        // Display the sales in rupees without changing the actual value
        daySales.textContent = `${day}: ₹${sales.toFixed(2)}`;
        salesSummaryContainer.appendChild(daySales);
    });
}




function scheduleDailyRefresh() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = nextMidnight - now;

    // Set a timeout to refresh daily sales at the next midnight
    setTimeout(() => {
        fetchDailySales();

        // Set an interval to refresh daily sales every 24 hours after the first refresh
        setInterval(fetchDailySales, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    }, timeUntilMidnight);
}

function displayOrdersChart(labels, data) {
    const ctx = document.getElementById('ordersChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Orders',
                data: data,
                backgroundColor: 'rgba(0, 0, 128, 0.3)', // Transparent navy blue
                borderColor: 'rgba(0, 0, 128, 1)', // Solid navy blue
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}





  async function downloadOrdersToExcel() {
    try {
        // Fetch order data from the server
        const response = await fetch('http://localhost:3000/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();

        // Convert the orders data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(orders);

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // Export the workbook to an Excel file
        XLSX.writeFile(workbook, "orders_data.xlsx");
    } catch (error) {
        console.error("Error downloading orders to Excel:", error);
    }
}

// Add a button to trigger the download in your HTML
// <button onclick="downloadOrdersToExcel()">Download Orders as Excel</button>


  
  
  
  
  

// Initialize fetch on page load
window.onload = () => {
    fetchOrders();
    fetchMostOrderedDish();
    fetchSalesSummary();
    fetchHighestSaleTime();
    fetchDailySales();
};
